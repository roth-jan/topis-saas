import { ProzessWorkbook, num } from './prozessmodell-excel-engine';
import type { NativesProzessmodell, NativKnoten, NativSchritt, NativBlock, NativUebersichtEintrag } from './prozessmodell-nativ';

/**
 * Excel → NATIVES Prozessmodell (einmalige Migration).
 *
 * Ansatz „Formelgraph umbenennen statt raten": Jede Zelle, die von einem
 * Schritt-Ausdruck (Anteil, Häufigkeit, Weg/Geschwindigkeit/Zeit, Basis) oder
 * der Übersicht referenziert wird, wird ein benannter Knoten (`_xE6`). Dessen
 * eigene Formel wird rekursiv genauso übersetzt, bis nur Eingabewerte übrig
 * sind. Damit überleben auch IF/SUM, blockübergreifende Bezüge und
 * Parameter-Verweise in Schrittspalten — der Graph bleibt identisch, nur die
 * Adressen werden zu Namen. Beweis: Gate-Test 18/18 Δ=0.
 */

const PN = 'Prozessmodell';
const BLOCK_TITLE_RE = /^(SE|SA|SI|SG|AMAZON)\s*:/i;
const CELL_TOKEN = /\$?([A-Z]{1,2})\$?(\d+)/g;
const NUR_ZELLE = /^\s*\$?([A-Z]{1,2})\$?(\d+)\s*$/;

interface RowInfo {
  name: string;
  region: 'menge' | 'parameter';
  blockId: string;
  /** Spalte, in der der (Roh-)Wert der Größe steht (E oder F). */
  wertSpalte: 'E' | 'F';
}

export interface KonvertierungsErgebnis {
  modell: NativesProzessmodell;
  warnungen: string[];
}

export function konvertiereExcelZuNativ(wb: ProzessWorkbook, name = 'Prozessmodell'): KonvertierungsErgebnis {
  const warnungen: string[] = [];
  const maxRow = wb.maxRow(PN);

  // --- Blöcke erkennen ---
  const blockStarts: { start: number; titel: string }[] = [];
  for (let r = 1; r <= maxRow; r++) {
    const v = wb.rawCell(PN, `A${r}`).v;
    if (typeof v === 'string' && BLOCK_TITLE_RE.test(v.trim())) blockStarts.push({ start: r, titel: v.trim() });
  }

  // --- Globale Karten: Größen-Zeilen + Schritt-Zeilen (über ALLE Blöcke) ---
  const rowinfo = new Map<number, RowInfo>();
  const schrittZeilen = new Set<number>();
  const blockMeta: { id: string; titel: string; start: number; ende: number; headerRow: number }[] = [];

  blockStarts.forEach((bs, i) => {
    const ende = i + 1 < blockStarts.length ? blockStarts[i + 1].start - 1 : maxRow;
    let headerRow = -1;
    for (let r = bs.start; r <= ende; r++) {
      if (wb.rawCell(PN, `C${r}`).v === 'Nr.') { headerRow = r; break; }
    }
    if (headerRow < 0) return;
    const id = `b${blockMeta.length}`;
    blockMeta.push({ id, titel: bs.titel, start: bs.start, ende, headerRow });

    let markerRow = -1;
    for (let r = bs.start; r < headerRow; r++) {
      const v = wb.rawCell(PN, `D${r}`).v;
      if (typeof v === 'string' && v.includes('Aufnahme')) { markerRow = r; break; }
    }
    for (let r = bs.start; r < headerRow; r++) {
      const label = wb.rawCell(PN, `D${r}`).v;
      if (typeof label !== 'string' || !label.trim()) continue;
      if (label.includes('Eingangswerte') || label.includes('Aufnahme')) continue;
      const region: RowInfo['region'] = markerRow >= 0 && r >= markerRow ? 'parameter' : 'menge';
      const e = wb.rawCell(PN, `E${r}`);
      const wertSpalte: 'E' | 'F' = region === 'parameter' && e.v == null && e.f == null ? 'F' : 'E';
      rowinfo.set(r, { name: label.trim(), region, blockId: id, wertSpalte });
    }
    for (let r = headerRow + 1; r <= ende; r++) {
      const abt = wb.rawCell(PN, `E${r}`).v;
      const nCell = wb.rawCell(PN, `N${r}`);
      const lCell = wb.rawCell(PN, `L${r}`);
      if (
        typeof abt === 'string' && abt.trim() &&
        (typeof nCell.v === 'number' || nCell.f != null) &&
        (lCell.v != null || lCell.f != null)
      ) {
        schrittZeilen.add(r);
      }
    }
  });

  // --- Knoten-Fabrik: Zelle → Knoten-ID, rekursiv über deren Formeln ---
  const knoten = new Map<string, NativKnoten>(); // id → Knoten
  const inArbeit = new Set<string>();

  // IDs in Kleinbuchstaben, damit der Zell-Regex ([A-Z]+Zahl) sie beim
  // Übersetzen NICHT erneut matcht (sonst _xF430 → _x_xF430).
  const knotenId = (col: string, row: number) => `_x${col.toLowerCase()}${row}`;

  /** Registriert die Zelle als Knoten (falls neu) und gibt ihre ID zurück. */
  const zelleZuKnoten = (col: string, row: number): string => {
    const id = knotenId(col, row);
    if (knoten.has(id) || inArbeit.has(id)) return id;
    inArbeit.add(id);

    const info = rowinfo.get(row);
    const sichtbar = info && col === info.wertSpalte;
    const cell = wb.rawCell(PN, `${col}${row}`);

    let wert: number | null = null;
    let expr: string | null = null;
    let origin: NativKnoten['origin'] = null;

    if (typeof cell.f === 'string') {
      // Reine Dateneingabe-Einzelverknüpfung = Eingabefeld (Wert übernehmen, Bindung lösen)
      const einzelRef = /^\s*'?([A-Za-zÄÖÜäöüß .]+?)'?!\$?([A-Z]{1,2})\$?(\d+)\s*$/.exec(cell.f);
      if (einzelRef && einzelRef[1].trim() === 'Dateneingabe') {
        if (einzelRef[2] === 'E' && einzelRef[3] === '3') {
          // Arbeitstage → globaler _AT
          expr = '_AT';
        } else {
          wert = wb.resolveNum(PN, `${col}${row}`);
          origin = { sheet: 'Dateneingabe', addr: `${einzelRef[2]}${einzelRef[3]}` };
        }
      } else {
        // Alles andere (inkl. zusammengesetzter Cross-Sheet-Formeln) übersetzen
        expr = uebersetzeFormel(cell.f, `${col}${row}`);
      }
    } else if (typeof cell.v === 'number') {
      wert = cell.v;
      origin = { sheet: PN, addr: `${col}${row}` };
    } else if (cell.v == null) {
      wert = 0;
    } else {
      wert = num(cell.v);
    }

    knoten.set(id, {
      id,
      name: sichtbar ? info!.name : null,
      region: sichtbar ? info!.region : 'intern',
      blockId: info ? info.blockId : null,
      wert,
      expr,
      origin,
    });
    inArbeit.delete(id);
    return id;
  };

  // Sprechende Namen für Dateneingabe-Zeilen: "SE: Beladung kleiner NV · Colli"
  // (Abschnitts-Überschrift Spalte A + Zeilen-Label Spalte B).
  let deLabels: Map<number, string> | null = null;
  const dateneingabeLabel = (row: number): string | null => {
    if (!deLabels) {
      deLabels = new Map();
      if (wb.hasSheet('Dateneingabe')) {
        let sektion = '';
        const deMax = wb.maxRow('Dateneingabe');
        for (let r = 1; r <= deMax; r++) {
          const a = wb.rawCell('Dateneingabe', `A${r}`).v;
          if (typeof a === 'string' && a.trim()) sektion = a.trim();
          const b = wb.rawCell('Dateneingabe', `B${r}`).v;
          if (typeof b === 'string' && b.trim()) {
            deLabels.set(r, sektion && !sektion.startsWith('Monatliche') ? `${sektion} · ${b.trim()}` : b.trim());
          }
        }
      }
    }
    return deLabels.get(row) ?? null;
  };

  /** Dateneingabe-Zelle → Eingabe-Knoten (die echten monatlichen Eingabefelder). */
  const dateneingabeKnoten = (col: string, row: number): string => {
    if (col === 'E' && row === 3) return '_AT'; // Arbeitstage global
    const id = `_xd${col.toLowerCase()}${row}`;
    if (!knoten.has(id)) {
      knoten.set(id, {
        id,
        name: dateneingabeLabel(row),
        region: 'intern',
        blockId: null,
        wert: wb.resolveNum('Dateneingabe', `${col}${row}`),
        expr: null,
        origin: { sheet: 'Dateneingabe', addr: `${col}${row}` },
      });
    }
    return id;
  };

  /** Excel-Formel → nativer Ausdruck (Zellrefs → Knoten-/Schritt-IDs). */
  const uebersetzeFormel = (formel: string, kontext: string): string => {
    let s = formel;
    // 1) SUM-Ranges in Einzelsummen auflösen (nur einspaltige Ranges nötig)
    s = s.replace(/SUM\(\$?([A-Z]{1,2})\$?(\d+):\$?([A-Z]{1,2})\$?(\d+)\)/g, (ganz, c1, r1, c2, r2) => {
      if (c1 !== c2) {
        warnungen.push(`Mehrspaltige SUM-Range in ${kontext} („${ganz}") — nicht unterstützt, als 0 übersetzt`);
        return '(0)';
      }
      const teile: string[] = [];
      for (let r = Math.min(+r1, +r2); r <= Math.max(+r1, +r2); r++) teile.push(tokenZuRef(c1, r));
      return `(${teile.join('+')})`;
    });
    // 2) Cross-Sheet-Refs (Dateneingabe!C16 …) → Eingabe-Knoten
    s = s.replace(/'?([A-Za-zÄÖÜäöüß .]+?)'?!\$?([A-Z]{1,2})\$?(\d+)/g, (ganz, sheet: string, c: string, r: string) => {
      const sh = sheet.trim();
      if (sh === 'Dateneingabe') return dateneingabeKnoten(c, +r);
      if (sh === PN) return tokenZuRef(c, +r);
      warnungen.push(`Cross-Sheet-Bezug ${ganz} in ${kontext} als Wert eingefroren`);
      return `(${wb.resolveNum(sh, `${c}${r}`)})`;
    });
    // 3) Lokale Zellrefs
    s = s.replace(CELL_TOKEN, (_, col: string, rowStr: string) => tokenZuRef(col, +rowStr));
    return s;
  };

  const tokenZuRef = (col: string, row: number): string => {
    if (col === 'L' && schrittZeilen.has(row)) return `_s${row}`; // Anteil eines Schritts
    return zelleZuKnoten(col, row);
  };

  // --- Schritte + Blöcke bauen ---
  const feld = (col: string, row: number): number | string | null => {
    const c = wb.rawCell(PN, `${col}${row}`);
    if (typeof c.f === 'string') return uebersetzeFormel(c.f, `${col}${row}`);
    if (typeof c.v === 'number') return c.v;
    return null;
  };

  const bloecke: NativBlock[] = blockMeta.map((bm) => {
    const schritte: NativSchritt[] = [];
    let basisExpr: string | null = null;

    for (let r = bm.headerRow + 1; r <= bm.ende; r++) {
      if (!schrittZeilen.has(r)) continue;
      // Basis aus der ersten N-Formel des Blocks (…/$F$6)
      const nf = wb.rawCell(PN, `N${r}`).f;
      if (basisExpr == null && typeof nf === 'string') {
        const divisor = /\/\s*(\$?[A-Z]{1,2}\$?\d+)\s*$/.exec(nf);
        if (divisor) {
          const m = NUR_ZELLE.exec(divisor[1])!;
          basisExpr = tokenZuRef(m[1], +m[2]);
        }
      }
      // Anteil (L): Zahl oder Ausdruck
      const lCell = wb.rawCell(PN, `L${r}`);
      const anteil: number | string =
        typeof lCell.f === 'string' ? uebersetzeFormel(lCell.f, `L${r}`) : typeof lCell.v === 'number' ? lCell.v : 0;
      // Häufigkeit (M): kompletter Ausdruck (enthält i.d.R. _s{r}*)
      const mCell = wb.rawCell(PN, `M${r}`);
      const haeufigkeitExpr =
        typeof mCell.f === 'string'
          ? uebersetzeFormel(mCell.f, `M${r}`)
          : typeof mCell.v === 'number'
            ? String(mCell.v)
            : '0';

      const nrV = wb.rawCell(PN, `C${r}`).v;
      schritte.push({
        id: `_s${r}`,
        nr: typeof nrV === 'number' ? nrV : null,
        name: String(wb.rawCell(PN, `D${r}`).v ?? ''),
        abteilung: String(wb.rawCell(PN, `E${r}`).v ?? '').trim(),
        wegM: feld('G', r),
        geschwMs: feld('H', r),
        standardSek: feld('I', r),
        anteil,
        haeufigkeitExpr,
      });
    }
    return { id: bm.id, name: bm.titel, basisExpr, schritte };
  });

  // --- Übersicht (MA-Stunden) ---
  const uebersicht: NativUebersichtEintrag[] = [];
  const sonstige: NativesProzessmodell['sonstige'] = [];
  let arbeitsminProStunde = 52.9;
  const U = 'Übersicht';
  if (wb.hasSheet(U)) {
    const uMax = wb.maxRow(U);
    let sektion = '';
    let modus: 'prozesse' | 'sonstige' | null = null;
    /** C-Spalten-Formel der Übersicht → Mengen-Ausdruck im nativen Modell. */
    const mengeExprAusC = (row: number, tiefe = 0): string | null => {
      if (tiefe > 4) return null;
      const c = wb.rawCell(U, `C${row}`);
      if (typeof c.f === 'string') {
        const pm = /Prozessmodell!\$?([A-Z]{1,2})\$?(\d+)/.exec(c.f);
        if (pm) return tokenZuRef(pm[1], +pm[2]);
        const lokal = /^\s*\$?C\$?(\d+)\s*$/.exec(c.f);
        if (lokal) return mengeExprAusC(+lokal[1], tiefe + 1);
      }
      if (typeof c.v === 'number') return String(c.v);
      return null;
    };
    for (let r = 1; r <= uMax; r++) {
      const b = wb.rawCell(U, `B${r}`).v;
      const e = wb.rawCell(U, `E${r}`).v;
      if (typeof e === 'string' && e.includes('Arbeitsminuten je Stunde')) {
        arbeitsminProStunde = wb.resolveNum(U, `F${r}`) || arbeitsminProStunde;
      }
      if (typeof b !== 'string') continue;
      const bt = b.trim();
      if (bt === 'Sammelguteingang' || bt === 'Sammelgutausgang') { sektion = bt; continue; }
      if (bt === 'Prozess') { modus = 'prozesse'; continue; }
      if (bt.startsWith('Berücksichtigung der sonstigen')) { modus = 'sonstige'; continue; }
      if (bt === 'Gesamt') { modus = null; continue; }
      if (modus === 'prozesse') {
        // Min/Colli-Quelle: E-Formel → N-Summenzeile → Block
        const eCell = wb.rawCell(U, `E${r}`);
        let blockId: string | null = null;
        if (typeof eCell.f === 'string') {
          const pm = /Prozessmodell!\$?N\$?(\d+)/.exec(eCell.f);
          if (pm) {
            const zeile = +pm[1];
            blockId = blockMeta.find((bm) => zeile >= bm.start && zeile <= bm.ende)?.id ?? null;
            if (!blockId) warnungen.push(`Übersicht „${bt}": N${zeile} keinem Block zuordenbar`);
          }
        }
        uebersicht.push({ sektion: sektion || 'Prozesse', name: bt, mengeExpr: mengeExprAusC(r), blockId });
      } else if (modus === 'sonstige') {
        const f = wb.rawCell(U, `F${r}`);
        if (f.v == null && f.f == null) continue;
        sonstige.push({ sektion: sektion || 'Prozesse', name: bt, maStunden: wb.resolveNum(U, `F${r}`) });
      }
    }
  }

  // Monat + Arbeitstage
  const monatV = wb.hasSheet('Dateneingabe') ? wb.rawCell('Dateneingabe', 'C3').v : null;
  const arbeitstage = wb.hasSheet('Dateneingabe') ? wb.resolveNum('Dateneingabe', 'E3') || 21 : 21;

  const modell: NativesProzessmodell = {
    version: 1,
    name,
    monat: typeof monatV === 'string' ? monatV : '',
    arbeitstage,
    arbeitsminProStunde,
    knoten: [...knoten.values()],
    bloecke,
    uebersicht,
    sonstige,
    nextId: 1,
  };
  return { modell, warnungen };
}
