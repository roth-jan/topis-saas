// KI-Textbuilder — deterministischer Kern.
//
// Architektur (Council 25.07.2026): Parameter → deterministische Geometrie. Koordinaten
// entstehen AUSSCHLIESSLICH hier — testbar, reproduzierbar. Keine LLM-/Netz-/Store-Abhängigkeit.
// v1-Parser (parseCanonical) versteht das Standardformat; alles Nicht-Unterstützte wird
// EXPLIZIT als `ignored` gemeldet (kein stilles Schlucken). Fuzzy-Sprache → später via LLM.
//
// Spec: topis/SPEC-KI-TEXTBUILDER-2026-07-25.md

import { OBJECT_DEFAULTS, TopisObject, ObjectType } from '@/types/topis';

export type GateSide = 'north' | 'south' | 'east' | 'west';

export interface GateGroup {
  count: number;
  side: GateSide;
  spacingM?: number;      // Achsabstand Mitte-zu-Mitte
  firstOffsetM?: number;  // Mitte des ersten Tors, Abstand von der Wandecke
}

/** Rohausgabe des Parsers/LLM — striktes Schema. */
export interface LayoutParams {
  action: 'createHall';
  hall: { lengthM: number; widthM: number; name?: string };
  gates?: GateGroup[];      // mehrere Torreihen möglich
  bereiche?: number;        // Anzahl Lagerbereiche im Innenraum
  stellplaetze?: number;    // Anzahl Stellplätze im Innenraum
  unit?: 'm' | 'ft';
  unresolved?: string[];    // Felder, die nicht sicher ableitbar waren
  ignored?: string[];       // erkannte, aber (noch) nicht unterstützte Angaben
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  filled: LayoutParams;     // normalisiert (Meter), Defaults gefüllt
}

const FT_TO_M = 0.3048;
const TOR_W = OBJECT_DEFAULTS.tor.width;   // 3.5 — entlang der Wand
const TOR_D = OBJECT_DEFAULTS.tor.height;  // 1.5 — in die Halle
// Erstes Tor bündig in der Ecke → exakter Achsabstand ohne Rand-Clamping.
const DEFAULT_FIRST_OFFSET_M = TOR_W / 2;  // 1.75
const DEFAULT_SPACING_M = TOR_W + 1;       // 4.5
const SPACING_MIN_WARN = 2.0;
const SPACING_MAX_WARN = 20.0;
const SIDE_LABEL: Record<GateSide, string> = { north: 'Nord', south: 'Süd', east: 'Ost', west: 'West' };

export function validateParams(params: LayoutParams): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unit = params.unit ?? 'm';
  const toM = (v: number) => (unit === 'ft' ? v * FT_TO_M : v);

  const lengthM = toM(params.hall?.lengthM);
  const widthM = toM(params.hall?.widthM);
  if (!Number.isFinite(lengthM) || lengthM <= 0) errors.push('Hallenlänge fehlt oder ist ungültig.');
  if (!Number.isFinite(widthM) || widthM <= 0) errors.push('Hallenbreite fehlt oder ist ungültig.');

  const filled: LayoutParams = {
    action: 'createHall',
    hall: { lengthM, widthM, name: params.hall?.name?.trim() || 'Neue Halle' },
    unit: 'm',
    unresolved: params.unresolved ?? [],
    ignored: params.ignored ?? [],
  };

  const filledGates: GateGroup[] = [];
  const seenSides = new Set<GateSide>();
  for (const g of params.gates ?? []) {
    const count = Math.round(g.count);
    const side = g.side;
    const spacingM = g.spacingM != null ? toM(g.spacingM) : DEFAULT_SPACING_M;

    if (!Number.isFinite(count) || count < 1) { errors.push('Toranzahl fehlt oder ist ungültig.'); continue; }
    if (!['north', 'south', 'east', 'west'].includes(side)) { errors.push('Tor-Seite (Nord/Süd/Ost/West) fehlt oder ist ungültig.'); continue; }
    if (!Number.isFinite(spacingM) || spacingM <= 0) { errors.push('Torabstand ist ungültig.'); continue; }

    const horiz = side === 'north' || side === 'south';
    const wallLen = horiz ? lengthM : widthM;
    // Torreihe standardmäßig ZENTRIEREN (gleicher Randabstand links/rechts) —
    // außer der Nutzer gibt explizit einen Anfangsabstand vor.
    const rowLen = (count - 1) * spacingM;
    const firstOffsetM = g.firstOffsetM != null ? toM(g.firstOffsetM) : Math.max(TOR_W / 2, (wallLen - rowLen) / 2);
    const requiredSpan = firstOffsetM + rowLen + TOR_W / 2;
    if (requiredSpan > wallLen + 0.01) {
      errors.push(
        `${count} Tore (${SIDE_LABEL[side]}) mit ${spacingM.toFixed(2)} m Abstand brauchen ~${requiredSpan.toFixed(0)} m, ` +
        `die Wand hat aber nur ${wallLen.toFixed(0)} m.`,
      );
    }
    if (spacingM < SPACING_MIN_WARN) warnings.push(`Torabstand ${spacingM.toFixed(2)} m (${SIDE_LABEL[side]}) ist ungewöhnlich eng — Zahlendreher?`);
    if (spacingM > SPACING_MAX_WARN) warnings.push(`Torabstand ${spacingM.toFixed(2)} m (${SIDE_LABEL[side]}) ist ungewöhnlich groß.`);
    if (seenSides.has(side)) warnings.push(`Mehrere Torreihen an der ${SIDE_LABEL[side]}-Wand — sie können sich überlappen.`);
    seenSides.add(side);

    filledGates.push({ count, side, spacingM, firstOffsetM });
  }
  if (filledGates.length > 0) filled.gates = filledGates;

  // Innenraum-Objekte (Bereiche/Stellplätze)
  const bereiche = params.bereiche != null ? Math.max(0, Math.round(params.bereiche)) : 0;
  const stellplaetze = params.stellplaetze != null ? Math.max(0, Math.round(params.stellplaetze)) : 0;
  if (bereiche > 0) filled.bereiche = bereiche;
  if (stellplaetze > 0) filled.stellplaetze = stellplaetze;
  if (errors.length === 0 && (bereiche + stellplaetze) > 0) {
    const cap = interiorCapacity(lengthM, widthM);
    if (bereiche + stellplaetze > cap) {
      warnings.push(`Nur ~${cap} Innenraum-Felder passen — ${bereiche + stellplaetze - cap} Bereiche/Stellplätze werden nicht platziert.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings, filled };
}

// Interior-Grid: gleichmäßige Felder im Innenraum, ober- und unterhalb eines zentralen
// Längsgangs (bleibt frei). Wird für Bereiche + Stellplätze genutzt.
const INT_MARGIN = 5;      // Abstand zu den Wänden
const INT_AISLE_H = 6;     // Höhe des freien Mittelgangs
const INT_GAP = 2;
const INT_CELL_H = 8;

function interiorCells(width: number, height: number): { x: number; y: number; w: number; h: number }[] {
  const x0 = INT_MARGIN, x1 = width - INT_MARGIN;
  if (x1 - x0 < 6 || height < 2 * INT_MARGIN + INT_CELL_H) return [];
  const cols = Math.min(6, Math.max(1, Math.round((x1 - x0) / 18)));
  const cellW = (x1 - x0 - (cols - 1) * INT_GAP) / cols;
  const aisleY = height / 2;
  const bands = [
    { y0: INT_MARGIN, y1: aisleY - INT_AISLE_H / 2 },
    { y0: aisleY + INT_AISLE_H / 2, y1: height - INT_MARGIN },
  ];
  const cells: { x: number; y: number; w: number; h: number }[] = [];
  for (const b of bands) {
    const rows = Math.floor((b.y1 - b.y0 + INT_GAP) / (INT_CELL_H + INT_GAP));
    for (let r = 0; r < rows; r++) {
      const y = b.y0 + r * (INT_CELL_H + INT_GAP);
      for (let c = 0; c < cols; c++) cells.push({ x: x0 + c * (cellW + INT_GAP), y, w: cellW, h: INT_CELL_H });
    }
  }
  return cells;
}

export function interiorCapacity(width: number, height: number): number {
  return interiorCells(width, height).length;
}

export interface GeneratedLayout {
  hall: { width: number; height: number; name: string };
  objects: Omit<TopisObject, 'id'>[];
}

/**
 * Deterministisch: normalisierte Parameter → Halle + Tor-Objekte (alle Torreihen).
 * Exakter Achsabstand (erstes Tor bündig in der Ecke), N/S quer / O/W hochkant.
 * `filled` MUSS validiert (ok) sein.
 */
export function paramsToLayout(filled: LayoutParams): GeneratedLayout {
  const width = filled.hall.lengthM;
  const height = filled.hall.widthM;
  const name = filled.hall.name ?? 'Neue Halle';
  const objects: Omit<TopisObject, 'id'>[] = [];
  let nr = 0;

  for (const grp of filled.gates ?? []) {
    const spacingM = grp.spacingM ?? DEFAULT_SPACING_M;
    const firstOffsetM = grp.firstOffsetM ?? DEFAULT_FIRST_OFFSET_M;
    const horiz = grp.side === 'north' || grp.side === 'south';
    for (let i = 0; i < grp.count; i++) {
      const center = firstOffsetM + i * spacingM;
      let x: number, y: number, w: number, h: number;
      if (horiz) {
        w = TOR_W; h = TOR_D;
        x = Math.max(0, Math.min(width - w, center - w / 2));
        y = grp.side === 'north' ? 0 : height - h;
      } else {
        w = TOR_D; h = TOR_W;
        y = Math.max(0, Math.min(height - h, center - h / 2));
        x = grp.side === 'west' ? 0 : width - w;
      }
      nr++;
      objects.push({
        type: 'tor' as ObjectType,
        x, y, width: w, height: h,
        name: `Tor ${nr}`,
        side: grp.side,
        torNummer: nr,
        tags: ['messpunkt'],
        meta: { code: `MP${nr}` },
      });
    }
  }

  // Innenraum: Bereiche zuerst, dann Stellplätze in ein gemeinsames Grid (Mittelgang frei).
  const bCount = filled.bereiche ?? 0;
  const sCount = filled.stellplaetze ?? 0;
  if (bCount + sCount > 0) {
    const cells = interiorCells(width, height);
    let bi = 0, si = 0;
    for (let i = 0; i < cells.length && i < bCount + sCount; i++) {
      const cell = cells[i];
      if (i < bCount) {
        bi++;
        objects.push({ type: 'bereich' as ObjectType, x: cell.x, y: cell.y, width: cell.w, height: cell.h, name: `Bereich ${bi}` });
      } else {
        si++;
        const w = Math.min(cell.w, OBJECT_DEFAULTS.stellplatz.width);
        objects.push({ type: 'stellplatz' as ObjectType, x: cell.x, y: cell.y, width: w, height: Math.min(cell.h, OBJECT_DEFAULTS.stellplatz.height), name: `Stellplatz ${si}` });
      }
    }
  }

  return { hall: { width, height, name }, objects };
}

// ---- Offline-Parser (Standardformat) -------------------------------------------------

const SIDE_KEYWORDS: [RegExp, GateSide][] = [
  [/\bnord(en)?\b/, 'north'],
  [/\b(süd|sud|sueden|süden)\b/, 'south'],
  [/\bost(en)?\b/, 'east'],
  [/\bwest(en)?\b/, 'west'],
];

// Nicht (mehr) unterstützte Elemente → werden offen gemeldet statt still geschluckt.
// (Stellplätze + Bereiche werden inzwischen gebaut → nicht mehr hier.)
const UNSUPPORTED: [RegExp, string][] = [
  [/regal/, 'Regale'],
  [/(fahr)?g(a|ä)ng/, 'Gänge/Fahrgänge'],
  [/\bweg(e|en)?\b/, 'Wege'],
  [/sicherheitsabstand/, 'Sicherheitsabstände'],
  [/rampe/, 'Rampen'],
  [/b(ü|ue)ro/, 'Büro'],
];

function matchSpacing(seg: string, allowBareDecimal: boolean): number | undefined {
  const a = seg.match(/(\d+(?:\.\d+)?)[^\d]{0,4}(?:raster|abstand)/);
  if (a) return parseFloat(a[1]);
  const b = seg.match(/(?:raster|abstand)[^\d]{0,4}(\d+(?:\.\d+)?)/);
  if (b) return parseFloat(b[1]);
  if (allowBareDecimal) {
    const d = seg.match(/(\d+\.\d+)/);
    if (d) return parseFloat(d[1]);
  }
  return undefined;
}

function sideOf(seg: string): GateSide | null {
  for (const [re, side] of SIDE_KEYWORDS) if (re.test(seg)) return side;
  return null;
}

/**
 * Parst das Standardformat, z.B.
 *   „Halle 210x58, 50 Tore Nord Abstand 3,75, 50 Tore Süd"
 * Mehrere Maße → erstes = Halle, weitere → `ignored`. Mehrere Torreihen möglich.
 * Nicht unterstützte Elemente (Stellplätze, Bereiche, Gänge, Wege …) → `ignored`.
 * Gibt null zurück, wenn keine Hallenmaße erkennbar sind.
 */
export function parseCanonical(input: string): LayoutParams | null {
  if (!input || !input.trim()) return null;
  const t = input.replace(/(\d),(\d)/g, '$1.$2');
  const low = t.toLowerCase();

  const dimRe = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/g;
  const dims = [...low.matchAll(dimRe)];
  if (dims.length === 0) return null;

  const unit: 'm' | 'ft' = /\bft\b|fuß|feet/.test(low) ? 'ft' : 'm';
  const ignored: string[] = [];
  const params: LayoutParams = {
    action: 'createHall',
    hall: { lengthM: parseFloat(dims[0][1]), widthM: parseFloat(dims[0][2]) },
    unit,
  };
  for (let i = 1; i < dims.length; i++) ignored.push(`Maß „${dims[i][0]}" (nicht als Hallenmaß verwendet)`);

  // Globaler Abstand als Fallback für Torreihen ohne eigenen Abstand.
  const globalSpacing = matchSpacing(low, false);

  // Torreihen aus Segmenten (getrennt durch , ; oder „und").
  const segments = low.split(/[,;]|\bund\b/);
  const gates: GateGroup[] = [];
  for (const seg of segments) {
    const cm = seg.match(/(\d+)\s*tore?\b/);
    const side = sideOf(seg);
    if (cm && side) {
      const noDims = !/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/.test(seg);
      const sp = matchSpacing(seg, noDims) ?? globalSpacing;
      gates.push({ count: parseInt(cm[1], 10), side, ...(sp != null ? { spacingM: sp } : {}) });
    }
  }
  if (gates.length > 0) params.gates = gates;

  // Bereiche / Stellplätze (Anzahl) — „6 Bereiche", „20 Lagerplätze/Stellplätze".
  const bm = low.match(/(\d+)\s*(?:lager)?bereich/);
  if (bm) params.bereiche = parseInt(bm[1], 10);
  else if (/bereich/.test(low)) ignored.push('Bereiche (Anzahl unklar — bitte angeben)');
  const sm = low.match(/(\d+)\s*(?:stell|lager)pl(?:a|ä)tz/);
  if (sm) params.stellplaetze = parseInt(sm[1], 10);
  else if (/stellpl(?:a|ä)tz/.test(low)) ignored.push('Stellplätze (Anzahl unklar — bitte angeben)');

  // Nicht unterstützte Elemente offen melden.
  for (const [re, label] of UNSUPPORTED) {
    if (re.test(low) && !ignored.some((x) => x.includes(label))) {
      ignored.push(`${label} (noch nicht unterstützt — bitte von Hand ergänzen)`);
    }
  }
  if (ignored.length > 0) params.ignored = ignored;

  return params;
}
