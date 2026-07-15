import { ProzessWorkbook, type CellValue } from './prozessmodell-excel-engine';

/**
 * Baut aus einer geparsten AS-Prozessmodell-Mappe (`ProzessWorkbook`) das strukturierte,
 * anzeigbare/editierbare Modell: 18 Blöcke mit Schritten + Abteilungs-Split, die
 * editierbaren Mengen/Parameter je Block, und die Übersicht (MA-Stundenbedarf).
 *
 * Der Rechenkern bleibt die adressbasierte Engine — dieses Modul ist die benannte
 * SICHT darüber (Labels ↔ Zell-Adressen), damit das Cockpit Werte zeigen und Mengen
 * editieren kann, ohne die Formel-Treue zu gefährden.
 */

const SHEET = 'Prozessmodell';
const BLOCK_TITLE_RE = /^(SE|SA|SI|SG|AMAZON)\s*:/i;

export type ZellReferenz = { sheet: string; addr: string };

/** Editierbare Menge oder Parameter (eine benannte Zeile über der Schritt-Tabelle). */
export interface ModellGroesse {
  name: string;
  row: number;
  region: 'menge' | 'parameter';
  wert: number;
  /** Zelle, die den Rohwert hält (falls direkt editierbar). Sonst abgeleitet. */
  origin: ZellReferenz | null;
  editierbar: boolean;
  abgeleitet: boolean; // Wert kommt aus Formel (z.B. Colli mit Stapler = Colli − …)
  /** Gesetzt, wenn die Größe aus dem NATIVEN Modell stammt (Editier-Ziel). */
  nativId?: string;
}

export interface ModellSchritt {
  nr: number;
  name: string;
  abteilung: string;
  wegM: number | null;
  geschwMs: number | null;
  standardSek: number | null;
  anteil: number;
  haeufigkeitJeTag: number;
  zeitJeSchrittMin: number;
  minProColli: number;
  row: number;
  /** Gesetzt, wenn der Schritt aus dem NATIVEN Modell stammt (Editier-Ziel). */
  nativId?: string;
}

export interface ModellBlock {
  name: string;
  startRow: number;
  headerRow: number;
  endRow: number;
  mengen: ModellGroesse[];
  parameter: ModellGroesse[];
  schritte: ModellSchritt[];
  minProColli: number;
  /** Min/Colli je Abteilung (Entlader / Scanner / Verteiler …). */
  proAbteilung: Record<string, number>;
  /** Gesetzt, wenn der Block aus dem NATIVEN Modell stammt. */
  nativId?: string;
}

export interface UebersichtProzess {
  name: string;
  menge: number;
  minProColli: number;
  maStunden: number;
}

export interface UebersichtSektion {
  titel: string;
  prozesse: UebersichtProzess[];
  sonstige: { name: string; maStunden: number }[];
  summeProzesse: number;
}

export interface AsProzessModell {
  bloecke: ModellBlock[];
  uebersicht: UebersichtSektion[];
  arbeitsminutenJeStunde: number;
  /** Σ MA-Stunden über alle Prozesse (ohne Sonstige) — der 6375,9-h-Wert. */
  maStundenProzesse: number;
  monat: string;
}

// ---------------------------------------------------------------------------

/** Rohe (nicht-aufgelöste) Zelle im Prozessmodell-Sheet: Wert + Formel. */
function raw(wb: ProzessWorkbook, addr: string): { v: CellValue; f?: string } {
  return wb.rawCell(SHEET, addr);
}

/** Erkennt die 18 Blöcke über die Titel-Zeilen in Spalte A. */
function detectBlocks(wb: ProzessWorkbook): { start: number; title: string }[] {
  const out: { start: number; title: string }[] = [];
  const last = wb.maxRow(SHEET);
  for (let r = 1; r <= last; r++) {
    const c = raw(wb, `A${r}`);
    if (typeof c.v === 'string' && BLOCK_TITLE_RE.test(c.v.trim())) {
      out.push({ start: r, title: c.v.trim() });
    }
  }
  return out;
}

function buildBlock(wb: ProzessWorkbook, start: number, end: number, title: string): ModellBlock | null {
  // Header-Zeile: Spalte C == "Nr."
  let headerRow = -1;
  for (let r = start; r <= end; r++) {
    if (raw(wb, `C${r}`).v === 'Nr.') { headerRow = r; break; }
  }
  if (headerRow < 0) return null;

  // "Aufnahme"-Marker trennt Mengen (davor) von Parametern (danach), beide in Spalte D.
  let markerRow = -1;
  for (let r = start; r < headerRow; r++) {
    const v = raw(wb, `D${r}`).v;
    if (typeof v === 'string' && v.includes('Aufnahme')) { markerRow = r; break; }
  }

  const mengen: ModellGroesse[] = [];
  const parameter: ModellGroesse[] = [];
  for (let r = start; r < headerRow; r++) {
    const label = raw(wb, `D${r}`).v;
    if (typeof label !== 'string' || !label.trim()) continue;
    if (label.includes('Eingangswerte') || label.includes('Aufnahme')) continue; // Zwischenüberschriften
    const region: 'menge' | 'parameter' = markerRow >= 0 && r >= markerRow ? 'parameter' : 'menge';
    // Rohwert: Menge in Spalte E, Parameter bevorzugt E sonst F.
    const eCell = raw(wb, `E${r}`);
    const fCell = raw(wb, `F${r}`);
    let valueCell = 'E';
    if (region === 'parameter' && eCell.v == null && eCell.f == null) valueCell = 'F';
    const cell = valueCell === 'E' ? eCell : fCell;
    const wert = wb.resolveNum(SHEET, `${valueCell}${r}`);
    // Editierbarkeit / Origin bestimmen
    let origin: ZellReferenz | null = null;
    let abgeleitet = false;
    if (cell.f == null) {
      // Roh-Konstante direkt in dieser Zelle
      origin = { sheet: SHEET, addr: `${valueCell}${r}` };
    } else {
      const single = /^\s*'?([A-Za-zÄÖÜäöüß .]+?)'?!\$?([A-Z]{1,2})\$?(\d+)\s*$/.exec(cell.f);
      if (single) {
        origin = { sheet: single[1].trim(), addr: `${single[2]}${single[3]}` };
      } else {
        abgeleitet = true; // Formel wie E6-E7-E8
      }
    }
    const g: ModellGroesse = {
      name: label.trim(),
      row: r,
      region,
      wert,
      origin,
      editierbar: origin !== null,
      abgeleitet,
    };
    (region === 'menge' ? mengen : parameter).push(g);
  }

  // Schritte
  const schritte: ModellSchritt[] = [];
  const proAbteilung: Record<string, number> = {};
  for (let r = headerRow + 1; r <= end; r++) {
    const abt = raw(wb, `E${r}`).v;
    if (typeof abt !== 'string' || !abt.trim()) continue;
    const nCell = raw(wb, `N${r}`);
    if (nCell.v == null && nCell.f == null) continue; // keine Zeitzeile
    const minColli = wb.resolveNum(SHEET, `N${r}`);
    const s: ModellSchritt = {
      nr: wb.resolveNum(SHEET, `C${r}`),
      name: String(raw(wb, `D${r}`).v ?? ''),
      abteilung: abt.trim(),
      wegM: numOrNull(raw(wb, `G${r}`).v),
      geschwMs: numOrNull(raw(wb, `H${r}`).v),
      standardSek: numOrNull(raw(wb, `I${r}`).v),
      anteil: wb.resolveNum(SHEET, `L${r}`),
      haeufigkeitJeTag: wb.resolveNum(SHEET, `M${r}`),
      zeitJeSchrittMin: wb.resolveNum(SHEET, `J${r}`),
      minProColli: minColli,
      row: r,
    };
    schritte.push(s);
    proAbteilung[s.abteilung] = (proAbteilung[s.abteilung] ?? 0) + minColli;
  }
  const minProColli = schritte.reduce((a, s) => a + s.minProColli, 0);

  return { name: title, startRow: start, headerRow, endRow: end, mengen, parameter, schritte, minProColli, proAbteilung };
}

function numOrNull(v: CellValue): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Übersicht-Sektionen (SE / SA) mit MA-Stundenbedarf. */
function buildUebersicht(wb: ProzessWorkbook): { sektionen: UebersichtSektion[]; f6: number } {
  const U = 'Übersicht';
  if (!wb.hasSheet(U)) return { sektionen: [], f6: 52.9 };
  const last = wb.maxRow(U);
  const sektionen: UebersichtSektion[] = [];
  let f6 = 52.9;
  let cur: UebersichtSektion | null = null;
  let modus: 'prozesse' | 'sonstige' | null = null;
  let titel = '';
  for (let r = 1; r <= last; r++) {
    const b = wb.rawCell(U, `B${r}`).v;
    const e = wb.rawCell(U, `E${r}`).v;
    if (typeof e === 'string' && e.includes('Arbeitsminuten je Stunde')) {
      f6 = wb.resolveNum(U, `F${r}`) || f6;
    }
    if (typeof b !== 'string') continue;
    const bt = b.trim();
    if (bt === 'Sammelguteingang' || bt === 'Sammelgutausgang') { titel = bt; continue; }
    if (bt === 'Prozess') {
      cur = { titel: titel || `Sektion ${sektionen.length + 1}`, prozesse: [], sonstige: [], summeProzesse: 0 };
      sektionen.push(cur);
      modus = 'prozesse';
      continue;
    }
    if (bt.startsWith('Berücksichtigung der sonstigen')) { modus = 'sonstige'; continue; }
    if (bt === 'Gesamt') { modus = null; continue; }
    if (!cur) continue;
    if (modus === 'prozesse') {
      const menge = wb.resolveNum(U, `C${r}`);
      const minColli = wb.resolveNum(U, `E${r}`);
      const maStunden = wb.resolveNum(U, `F${r}`);
      cur.prozesse.push({ name: bt, menge, minProColli: minColli, maStunden });
      cur.summeProzesse += maStunden;
    } else if (modus === 'sonstige') {
      const fCell = wb.rawCell(U, `F${r}`);
      if (fCell.v == null && fCell.f == null) continue;
      cur.sonstige.push({ name: bt, maStunden: wb.resolveNum(U, `F${r}`) });
    }
  }
  return { sektionen, f6 };
}

/** Baut das komplette Modell aus einer geparsten Mappe. */
export function buildAsModell(wb: ProzessWorkbook): AsProzessModell {
  const starts = detectBlocks(wb);
  const bloecke: ModellBlock[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].start;
    const end = i + 1 < starts.length ? starts[i + 1].start - 1 : wb.maxRow(SHEET);
    const blk = buildBlock(wb, start, end, starts[i].title);
    if (blk) bloecke.push(blk);
  }
  const { sektionen, f6 } = buildUebersicht(wb);
  const maStundenProzesse = sektionen.reduce((a, s) => a + s.summeProzesse, 0);
  let monat = '';
  if (wb.hasSheet('Dateneingabe')) {
    const m = wb.rawCell('Dateneingabe', 'C3').v;
    if (typeof m === 'string') monat = m;
  }
  return { bloecke, uebersicht: sektionen, arbeitsminutenJeStunde: f6, maStundenProzesse, monat };
}
