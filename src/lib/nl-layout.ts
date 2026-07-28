// KI-Textbuilder — deterministischer Kern.
//
// Architektur (Council 25.07.2026): Parameter → deterministische Geometrie. Koordinaten
// entstehen AUSSCHLIESSLICH hier — testbar, reproduzierbar. Keine LLM-/Netz-/Store-Abhängigkeit.
// v1-Parser (parseCanonical) versteht das Standardformat; alles Nicht-Unterstützte wird
// EXPLIZIT als `ignored` gemeldet (kein stilles Schlucken). Fuzzy-Sprache → später via LLM.
//
// Spec: topis/SPEC-KI-TEXTBUILDER-2026-07-25.md

import { OBJECT_DEFAULTS, TopisObject, ObjectType } from '@/types/topis';
import { findFreeSpot, findOverlaps } from '@/lib/geometry';

export type GateSide = 'north' | 'south' | 'east' | 'west';

export interface GateGroup {
  count: number;
  side: GateSide;
  torBreiteM?: number;    // Tor-Länge entlang der Wand (Lastenheft §1.1.2.1 „Length"), Default 3.5
  lueckeM?: number;       // LÜCKE zwischen benachbarten Toren (Lastenheft „distance between the gates")
  spacingM?: number;      // Achsabstand Mitte-zu-Mitte (= Breite + Lücke). Intern/Back-compat.
  firstOffsetM?: number;  // Mitte des ersten Tors, Abstand von der Wandecke
}

/** Rohausgabe des Parsers/LLM — striktes Schema. */
export interface LayoutParams {
  action: 'createHall';
  hall: { lengthM: number; widthM: number; name?: string };
  gates?: GateGroup[];      // mehrere Torreihen möglich
  bereiche?: number;        // Anzahl (unbenannter) Lagerbereiche im Innenraum
  zonen?: { name: string; side?: GateSide; laengeM?: number; breiteM?: number }[]; // benannte Zonen (Wareneingang West 20×15 …)
  stellplaetze?: number;    // Anzahl Stellplätze im Innenraum (Grid-Modus)
  stellplaetzeJeTor?: boolean; // Stellplatz VOR JEDEM Tor (Cross-Dock-Vorfeld) statt Grid
  stellplatzLaengeM?: number;  // Stellplatz-Tiefe in die Halle (Default 12)
  stellplatzBreiteM?: number;  // Stellplatz-Breite entlang der Wand (Default 3)
  mittelgangM?: number;     // Breite des zentralen Längsgangs (Default 4)
  flaechen?: { art: string; count: number }[]; // Sonderflächen (AV/ÜZ/Wertverschlag/…)
  nummerierung?: 'fortlaufend' | 'seite' | 'alpha'; // Tor-Nummerierungsschema
  startNr?: number;         // Startwert bei fortlaufender Nummerierung
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
const SIDE_LETTER: Record<GateSide, string> = { north: 'N', south: 'S', east: 'O', west: 'W' };

// 1→A, 26→Z, 27→AA … (für alphabetisches Nummerierungsschema)
function numToAlpha(n: number): string {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s || 'A';
}

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
    // Tor-Breite entlang der Wand (Lastenheft-Eigenschaft). Nur „explizit", wenn eine Breite
    // WIRKLICH angegeben wurde — nie geraten (das LLM neigte dazu, 4 m zu erfinden).
    const hasExplicitBreite = g.torBreiteM != null && g.torBreiteM > 0;
    // Achsabstand (Pitch) ZUERST bestimmen. Disambiguierung von „Abstand":
    //  - explizit spacingM → Achsabstand.
    //  - lueckeM + explizite Breite → „Abstand"/„Lücke" = Zwischenraum → Pitch = Breite + Lücke.
    //  - lueckeM OHNE Breite → „Abstand 6" meint konventionell den Achsabstand (wie AS Halle 6).
    //  - nichts → Default.
    const spacingM = g.spacingM != null ? toM(g.spacingM)
      : g.lueckeM != null && g.lueckeM >= 0
        ? (hasExplicitBreite ? toM(g.torBreiteM!) + toM(g.lueckeM) : toM(g.lueckeM))
        : hasExplicitBreite ? toM(g.torBreiteM!) + 1 : DEFAULT_SPACING_M;
    // Breite: explizit übernehmen; sonst an den Achsabstand anpassen (nie breiter als der
    // Pitch → Tore überlappen ohne explizite Breite NIE, auch bei engem Raster wie „Abstand 3").
    const torBreiteM = hasExplicitBreite ? toM(g.torBreiteM!) : Math.min(TOR_W, spacingM);
    const lueckeEff = spacingM - torBreiteM; // effektive Lücke (nur bei EXPLIZITER Breite negativ)

    if (!Number.isFinite(count) || count < 1) { errors.push('Toranzahl fehlt oder ist ungültig.'); continue; }
    if (!['north', 'south', 'east', 'west'].includes(side)) { errors.push('Tor-Seite (Nord/Süd/Ost/West) fehlt oder ist ungültig.'); continue; }
    if (!Number.isFinite(spacingM) || spacingM <= 0) { errors.push('Torabstand ist ungültig.'); continue; }

    const horiz = side === 'north' || side === 'south';
    const wallLen = horiz ? lengthM : widthM;
    // Torreihe standardmäßig ZENTRIEREN (gleicher Randabstand links/rechts) —
    // außer der Nutzer gibt explizit einen Anfangsabstand vor.
    const rowLen = (count - 1) * spacingM;
    const firstOffsetM = g.firstOffsetM != null ? toM(g.firstOffsetM) : Math.max(torBreiteM / 2, (wallLen - rowLen) / 2);
    const requiredSpan = firstOffsetM + rowLen + torBreiteM / 2;
    // Kapazität VOR dem Bau (Lastenheft: Anzahl × Breite + (Anzahl−1) × Lücke ≤ Wandlänge).
    if (requiredSpan > wallLen + 0.01) {
      const bedarf = count * torBreiteM + (count - 1) * Math.max(0, lueckeEff);
      errors.push(
        `${count} Tore à ${torBreiteM.toFixed(1)} m + ${Math.max(0, lueckeEff).toFixed(1)} m Lücke (${SIDE_LABEL[side]}) ` +
        `brauchen ~${bedarf.toFixed(0)} m, die Wand hat aber nur ${wallLen.toFixed(0)} m.`,
      );
    }
    // Negative Lücke = Tore überlappen sich → Fehler (nicht bloß Warnung), das Lastenheft
    // kennt keine überlappenden Tore.
    if (lueckeEff < -0.01) {
      errors.push(
        `Tore (${SIDE_LABEL[side]}) überlappen sich: Breite ${torBreiteM.toFixed(1)} m ist größer als der Achsabstand ${spacingM.toFixed(1)} m ` +
        `(Lücke ${lueckeEff.toFixed(1)} m). Bitte größere Lücke oder schmalere Tore.`,
      );
    } else if (lueckeEff > 0.05 && lueckeEff < 0.5) {
      // Nur bei ECHT knapper, positiver Lücke warnen. Lücke = 0 (Tore stoßen bündig
      // aneinander) ist ein gültiger Dichtpack-Fall und keine Warnung wert.
      warnings.push(`Enge Torlücke (${lueckeEff.toFixed(1)} m, ${SIDE_LABEL[side]}) — bewusst so knapp?`);
    }
    if (spacingM > SPACING_MAX_WARN) warnings.push(`Torabstand ${spacingM.toFixed(2)} m (${SIDE_LABEL[side]}) ist ungewöhnlich groß.`);
    if (seenSides.has(side)) warnings.push(`Mehrere Torreihen an der ${SIDE_LABEL[side]}-Wand — sie können sich überlappen.`);
    seenSides.add(side);

    filledGates.push({ count, side, spacingM, firstOffsetM, torBreiteM });
  }
  if (filledGates.length > 0) filled.gates = filledGates;

  // Innenraum-Objekte (Bereiche/Stellplätze)
  const bereiche = params.bereiche != null ? Math.max(0, Math.round(params.bereiche)) : 0;
  const stellplaetze = params.stellplaetze != null ? Math.max(0, Math.round(params.stellplaetze)) : 0;
  // Benannte Zonen (Wareneingang West etc.) haben Vorrang vor der reinen Bereich-Anzahl.
  const validSides: GateSide[] = ['north', 'south', 'east', 'west'];
  const zonen = (params.zonen ?? [])
    .filter((z) => z && typeof z.name === 'string' && z.name.trim())
    .map((z) => ({
      name: z.name.trim(),
      side: validSides.includes(z.side as GateSide) ? z.side : undefined,
      laengeM: z.laengeM != null && z.laengeM > 0 ? toM(z.laengeM) : undefined,
      breiteM: z.breiteM != null && z.breiteM > 0 ? toM(z.breiteM) : undefined,
    }));
  if (zonen.length > 0) filled.zonen = zonen;
  else if (bereiche > 0) filled.bereiche = bereiche;

  // Zentraler Längsgang (Mittelgang) — Breite übernehmen, sonst Default.
  const mittelgangM = params.mittelgangM != null && params.mittelgangM > 0 ? toM(params.mittelgangM) : DEFAULT_MITTELGANG_M;
  filled.mittelgangM = Math.max(MITTELGANG_MIN_M, mittelgangM);
  if (params.mittelgangM != null && toM(params.mittelgangM) < MITTELGANG_MIN_M) {
    warnings.push(`Mittelgang ${toM(params.mittelgangM).toFixed(1)} m ist sehr schmal — auf ${MITTELGANG_MIN_M} m angehoben.`);
  }

  // Cross-Dock-Vorfeld: ein Stellplatz VOR JEDEM Tor.
  const jeTor = !!params.stellplaetzeJeTor && filledGates.length > 0;
  if (jeTor) {
    filled.stellplaetzeJeTor = true;
    filled.stellplatzLaengeM = params.stellplatzLaengeM != null && params.stellplatzLaengeM > 0
      ? toM(params.stellplatzLaengeM) : DEFAULT_STELLPLATZ_LAENGE_M;
    filled.stellplatzBreiteM = params.stellplatzBreiteM != null && params.stellplatzBreiteM > 0
      ? toM(params.stellplatzBreiteM) : DEFAULT_STELLPLATZ_BREITE_M;
    // Tiefen-Fit: Tor + Stellplatz + halber Mittelgang müssen in die halbe Halle passen (N/S).
    const hasNS = filledGates.some((g) => g.side === 'north' || g.side === 'south');
    const hasEW = filledGates.some((g) => g.side === 'east' || g.side === 'west');
    const halfDepth = (v: number) => v / 2 - filled.mittelgangM! / 2 - TOR_D;
    if (hasNS && filled.stellplatzLaengeM > halfDepth(widthM) + 0.01) {
      warnings.push(`Stellplatz-Tiefe ${filled.stellplatzLaengeM.toFixed(1)} m + Mittelgang passt nicht in die ${widthM.toFixed(0)} m tiefe Halle — Tiefe wird gekürzt.`);
    }
    if (hasEW && filled.stellplatzLaengeM > halfDepth(lengthM) + 0.01) {
      warnings.push(`Stellplatz-Tiefe ${filled.stellplatzLaengeM.toFixed(1)} m + Mittelgang passt nicht in die ${lengthM.toFixed(0)} m lange Halle — Tiefe wird gekürzt.`);
    }
  } else if (stellplaetze > 0) {
    filled.stellplaetze = stellplaetze;
    if (params.stellplatzLaengeM != null && params.stellplatzLaengeM > 0) filled.stellplatzLaengeM = toM(params.stellplatzLaengeM);
    if (params.stellplatzBreiteM != null && params.stellplatzBreiteM > 0) filled.stellplatzBreiteM = toM(params.stellplatzBreiteM);
  }
  const flaechen = (params.flaechen ?? [])
    .filter((f) => FLAECHEN_BY_ART.has(f.art))
    .map((f) => ({ art: f.art, count: Math.max(0, Math.round(f.count)) }))
    .filter((f) => f.count > 0);
  if (flaechen.length > 0) filled.flaechen = flaechen;
  // Robustheit: das LLM legt nummerierung/startNr manchmal in gates[] statt oben ab.
  const gAny = (params.gates ?? []) as Array<GateGroup & { nummerierung?: LayoutParams['nummerierung']; startNr?: number }>;
  const nummerierung = params.nummerierung ?? gAny.find((g) => g.nummerierung)?.nummerierung;
  const startNr = params.startNr ?? gAny.find((g) => g.startNr != null)?.startNr;
  if (nummerierung) filled.nummerierung = nummerierung;
  if (startNr != null && startNr >= 1) filled.startNr = Math.round(startNr);
  // Nur Grid-Objekte gegen die Kapazität prüfen: Cross-Dock-Stellplätze hängen an den Toren,
  // Cross-Dock-Bereiche sind Bänder — beide brauchen keine Grid-Buchten.
  const gridItems = flaechen.reduce((a, f) => a + f.count, 0)
    + (jeTor ? 0 : stellplaetze)
    + (jeTor || filled.zonen ? 0 : bereiche);
  if (errors.length === 0 && gridItems > 0) {
    const cap = interiorCapacity(lengthM, widthM, filled.mittelgangM! / 2);
    if (gridItems > cap) {
      warnings.push(`Nur ~${cap} Innenraum-Felder passen — ${gridItems - cap} Objekte werden nicht platziert.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings, filled };
}

// Interior-Layout mit KREUZUNGSFREIEN Fahrwegen + Sicherheitsabstand:
// Objekte (Bereiche/Stellplätze) liegen in Buchten ZWISCHEN den Gängen, nie darauf.
// Die Gang-Geometrie (zentraler Längsgang + vertikale Quergänge) MUSS zu
// generateBasicGangNet (pathfinding.ts) passen — dieselben Fraktionen/Breiten.
const INT_MARGIN = 5;          // Abstand zu den Wänden
export const AISLE_FRACTIONS = [0.2, 0.5, 0.8]; // vertikale Quergänge (× Hallenbreite)
export const AISLE_HALF = 2;   // halbe Gangbreite (Gang-breite = 4)
export const AISLE_H_HALF = 2; // halber zentraler Längsgang (Gang-breite 4)
export const SAFETY_M = 1.5;   // Sicherheitsabstand Objekt ↔ Gang/Wand

// Cross-Dock-Vorfeld (Stellplätze je Tor)
export const DEFAULT_STELLPLATZ_LAENGE_M = 12; // Tiefe in die Halle
export const DEFAULT_STELLPLATZ_BREITE_M = 3;  // Breite entlang der Wand
export const DEFAULT_MITTELGANG_M = 4;         // zentraler Längsgang
const MITTELGANG_MIN_M = 2;
// Standardmaß für benannte Zonen OHNE explizite Angabe (kein Halbhallen-Klotz).
export const DEFAULT_ZONE_LAENGE_M = 20;
export const DEFAULT_ZONE_BREITE_M = 15;
const INT_GAP = 2;
const INT_CELL_H = 8;
const MIN_CELL_W = 10;

// Freie Intervalle in [lo,hi] nach Abzug der (bereits um Sicherheit erweiterten) Sperrzonen.
function freeSegments(lo: number, hi: number, blocked: [number, number][]): [number, number][] {
  const segs: [number, number][] = [];
  let cur = lo;
  const sorted = [...blocked].sort((a, b) => a[0] - b[0]);
  for (const [b0, b1] of sorted) {
    if (b0 > cur) segs.push([cur, Math.min(b0, hi)]);
    cur = Math.max(cur, b1);
    if (cur >= hi) break;
  }
  if (cur < hi) segs.push([cur, hi]);
  return segs.filter(([a, b]) => b - a > 0.01);
}

function interiorCells(width: number, height: number, aisleHHalf: number = AISLE_H_HALF): { x: number; y: number; w: number; h: number }[] {
  const x0 = INT_MARGIN, x1 = width - INT_MARGIN;
  if (x1 - x0 < MIN_CELL_W || height < 2 * INT_MARGIN + INT_CELL_H) return [];
  // Sperrzonen X: vertikale Quergänge + Sicherheitsabstand
  const xBlocked: [number, number][] = AISLE_FRACTIONS
    .map((f) => width * f)
    .map((cx) => [cx - AISLE_HALF - SAFETY_M, cx + AISLE_HALF + SAFETY_M] as [number, number]);
  const xSegs = freeSegments(x0, x1, xBlocked).filter(([a, b]) => b - a >= MIN_CELL_W);
  // Sperrzone Y: zentraler Längsgang (Mittelgang) + Sicherheitsabstand
  const aisleY = height / 2;
  const yBlocked: [number, number][] = [[aisleY - aisleHHalf - SAFETY_M, aisleY + aisleHHalf + SAFETY_M]];
  const ySegs = freeSegments(INT_MARGIN, height - INT_MARGIN, yBlocked).filter(([a, b]) => b - a >= INT_CELL_H);

  const cells: { x: number; y: number; w: number; h: number }[] = [];
  for (const [ya, yb] of ySegs) {
    const rows = Math.floor((yb - ya + INT_GAP) / (INT_CELL_H + INT_GAP));
    for (let r = 0; r < rows; r++) {
      const y = ya + r * (INT_CELL_H + INT_GAP);
      for (const [xa, xb] of xSegs) {
        const segW = xb - xa;
        const cols = Math.max(1, Math.floor((segW + INT_GAP) / (MIN_CELL_W + INT_GAP)));
        const cellW = (segW - (cols - 1) * INT_GAP) / cols;
        for (let c = 0; c < cols; c++) cells.push({ x: xa + c * (cellW + INT_GAP), y, w: cellW, h: INT_CELL_H });
      }
    }
  }
  return cells;
}

export function interiorCapacity(width: number, height: number, aisleHHalf: number = AISLE_H_HALF): number {
  return interiorCells(width, height, aisleHHalf).length;
}

// Sonderflächen, die im Innenraum-Grid platzierbar sind (Typ existiert in OBJECT_DEFAULTS
// + OBJECT_COLORS). Rampen NICHT hier — die gehören an die Außenwand (spätere Ausbaustufe).
export const FLAECHEN: { art: string; type: ObjectType; label: string; countRe: RegExp }[] = [
  { art: 'kommissionierflaeche', type: 'kommissionierflaeche', label: 'Kommissionierfläche', countRe: /(\d+)\s*kommissionier/ },
  { art: 'av_platz', type: 'av_platz', label: 'AV-Platz', countRe: /(\d+)\s*(?:av[- ]?pl|annahmeverweiger)/ },
  { art: 'uz_platz', type: 'uz_platz', label: 'ÜZ-Platz', countRe: /(\d+)\s*(?:üz[- ]?pl|ueberz|überz)/ },
  { art: 'wertverschlag', type: 'wertverschlag', label: 'Wertverschlag', countRe: /(\d+)\s*(?:wertverschl[aä]g|k[äae]fig)/ },
  { art: 'palettenlager', type: 'palettenlager', label: 'Palettenlager', countRe: /(\d+)\s*palettenl[aä]ger/ },
  { art: 'sperrplatz', type: 'sperrplatz', label: 'Sperrplatz', countRe: /(\d+)\s*sperr/ },
  { art: 'klaerplatz', type: 'klaerplatz', label: 'Klärplatz', countRe: /(\d+)\s*kl[äae]r/ },
  { art: 'gefahrgut', type: 'gefahrgut', label: 'Gefahrgut-Platz', countRe: /(\d+)\s*gefahrgut/ },
  { art: 'ladestation', type: 'ladestation', label: 'Ladestation', countRe: /(\d+)\s*ladest/ },
  { art: 'hallenterminal', type: 'hallenterminal', label: 'Hallenterminal', countRe: /(\d+)\s*(?:hallenterminal|terminal)/ },
];
const FLAECHEN_BY_ART = new Map(FLAECHEN.map((f) => [f.art, f]));

export interface GeneratedLayout {
  hall: { width: number; height: number; name: string };
  objects: Omit<TopisObject, 'id'>[];
}

/** Überlappende Objektpaare im generierten Layout (für die Kollisionswarnung). */
export function findLayoutCollisions(objects: Omit<TopisObject, 'id'>[]): [string, string][] {
  const rects = objects.map((o, i) => ({ x: o.x, y: o.y, width: o.width, height: o.height, name: o.name ?? `#${i}` }));
  // margin -0.05 → Kanten dürfen sich berühren; erst echte Überlappung > 5 cm zählt.
  return findOverlaps(rects, -0.05).map(([a, b]) => [a.name!, b.name!]);
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
  const scheme = filled.nummerierung ?? 'fortlaufend';
  const startNr = filled.startNr ?? 1;
  const sideCount: Record<string, number> = {};
  let nr = 0;

  for (const grp of filled.gates ?? []) {
    const torBreite = grp.torBreiteM ?? TOR_W;
    const spacingM = grp.spacingM ?? (torBreite + 1);
    const firstOffsetM = grp.firstOffsetM ?? (torBreite / 2);
    const horiz = grp.side === 'north' || grp.side === 'south';
    for (let i = 0; i < grp.count; i++) {
      const center = firstOffsetM + i * spacingM;
      let x: number, y: number, w: number, h: number;
      if (horiz) {
        w = torBreite; h = TOR_D;
        x = Math.max(0, Math.min(width - w, center - w / 2));
        y = grp.side === 'north' ? 0 : height - h;
      } else {
        w = TOR_D; h = torBreite;
        y = Math.max(0, Math.min(height - h, center - h / 2));
        x = grp.side === 'west' ? 0 : width - w;
      }
      nr++;
      let torName: string;
      if (scheme === 'seite') {
        sideCount[grp.side] = (sideCount[grp.side] || 0) + 1;
        torName = `${SIDE_LETTER[grp.side]}${sideCount[grp.side]}`;
      } else if (scheme === 'alpha') {
        torName = numToAlpha(startNr - 1 + nr);
      } else {
        torName = `Tor ${startNr - 1 + nr}`;
      }
      objects.push({
        type: 'tor' as ObjectType,
        x, y, width: w, height: h,
        name: torName,
        side: grp.side,
        torNummer: nr,
        tags: ['messpunkt'],
        meta: { code: `MP${nr}` },
      });
    }
  }

  const mittelgangM = filled.mittelgangM ?? DEFAULT_MITTELGANG_M;
  const aisleHHalf = mittelgangM / 2;
  const jeTor = !!filled.stellplaetzeJeTor && (filled.gates?.length ?? 0) > 0;

  // Cross-Dock-Modus: ein Stellplatz VOR JEDEM Tor (+ Bereich-Bänder falls keine Zonen).
  if (jeTor) {
    const tore = objects.filter((o) => o.type === 'tor');
    // 1) Bereiche als Halbband-Zonen — nur wenn keine benannten Zonen gesetzt sind.
    if (!filled.zonen && (filled.bereiche ?? 0) > 0) buildBereichBaender(objects, tore, width, height, aisleHHalf, filled.bereiche!);
    // 2) Ein Stellplatz vor jedem Tor (Torrelation via meta.torNummer).
    const laenge = filled.stellplatzLaengeM ?? DEFAULT_STELLPLATZ_LAENGE_M;
    const breite = filled.stellplatzBreiteM ?? DEFAULT_STELLPLATZ_BREITE_M;
    for (const t of tore) {
      const r = stellplatzForTor(t, width, height, laenge, breite, aisleHHalf);
      if (!r) continue;
      objects.push({
        type: 'stellplatz', x: r.x, y: r.y, width: r.width, height: r.height,
        name: `SP ${t.torNummer ?? ''}`.trim(),
        meta: t.torNummer != null ? { tor: String(t.torNummer) } : undefined,
      });
    }
  }

  // Grid: Sonderflächen immer; Bereiche/Stellplätze nur im NICHT-Cross-Dock-Fall.
  // Buchten liegen zwischen den Gängen (kreuzungsfrei); Reihenfolge = Belegung.
  const specs: { type: ObjectType; label: string }[] = [];
  if (!jeTor) {
    if (!filled.zonen) for (let i = 0; i < (filled.bereiche ?? 0); i++) specs.push({ type: 'bereich', label: 'Bereich' });
    for (let i = 0; i < (filled.stellplaetze ?? 0); i++) specs.push({ type: 'stellplatz', label: 'Stellplatz' });
  }
  for (const grp of filled.flaechen ?? []) {
    const def = FLAECHEN_BY_ART.get(grp.art);
    if (!def) continue;
    for (let i = 0; i < grp.count; i++) specs.push({ type: def.type, label: def.label });
  }
  if (specs.length > 0) {
    const cells = interiorCells(width, height, aisleHHalf);
    const counters: Record<string, number> = {};
    for (let i = 0; i < cells.length && i < specs.length; i++) {
      const s = specs[i];
      const cell = cells[i];
      counters[s.type] = (counters[s.type] || 0) + 1;
      const def = OBJECT_DEFAULTS[s.type];
      const wantW = s.type === 'stellplatz' ? (filled.stellplatzBreiteM ?? def?.width) : def?.width;
      const wantH = s.type === 'stellplatz' ? (filled.stellplatzLaengeM ?? def?.height) : def?.height;
      const w = s.type === 'bereich' ? cell.w : Math.min(cell.w, wantW ?? cell.w);
      const h = s.type === 'bereich' ? cell.h : Math.min(cell.h, wantH ?? cell.h);
      objects.push({ type: s.type, x: cell.x, y: cell.y, width: w, height: h, name: `${s.label} ${counters[s.type]}` });
    }
  }

  // Benannte Zonen ZULETZT platzieren (kollisionsfrei gegen alle bereits gesetzten Objekte),
  // aber als Hintergrund voranstellen (unshift → zuerst gezeichnet).
  if (filled.zonen && filled.zonen.length > 0) {
    const zoneObjs = buildZonen(width, height, filled.zonen, objects, aisleHHalf);
    if (zoneObjs.length > 0) objects.unshift(...zoneObjs);
  }

  return { hall: { width, height, name }, objects };
}

// Benannte Zonen (Wareneingang West etc.) als Bereich-Rechtecke mit ECHTEN Maßen,
// KOLLISIONSFREI platziert — keine „halbe Halle". Explizite Maße werden geehrt; fehlt ein
// Maß, wird ein moderater Standard genommen (nummeriert in `unresolved`-Manier über den Namen).
// Bevorzugte Lage: an der genannten Himmelsrichtung (West→links, Ost→rechts, N→oben, S→unten).
function buildZonen(
  width: number, height: number,
  zonen: { name: string; side?: GateSide; laengeM?: number; breiteM?: number }[],
  placed: Omit<TopisObject, 'id'>[], aisleHHalf: number,
): Omit<TopisObject, 'id'>[] {
  const out: Omit<TopisObject, 'id'>[] = [];
  const obstacles = placed.map((o) => ({ x: o.x, y: o.y, width: o.width, height: o.height }));
  // Mittelgang als gesperrte Zone (Zonen dürfen ihn nicht überdecken).
  const mgTop = height / 2 - aisleHHalf, mgBottom = height / 2 + aisleHHalf;
  const blocked = [{ x: 0, y: mgTop, width, height: mgBottom - mgTop }];
  const preferForSide = (side: GateSide | undefined, w: number, h: number) => {
    switch (side) {
      case 'west': return { x: 1, y: height / 2 };
      case 'east': return { x: width - w - 1, y: height / 2 };
      case 'north': return { x: width / 2, y: 1 };
      case 'south': return { x: width / 2, y: height - h - 1 };
      default: return { x: width / 2, y: height / 2 };
    }
  };
  for (const z of zonen) {
    // Explizite Maße (z. B. 20×15). Fehlt eines → moderater Standard, kein Halbhallen-Klotz.
    const wantW = Math.min(z.laengeM ?? DEFAULT_ZONE_LAENGE_M, width);
    const wantH = Math.min(z.breiteM ?? DEFAULT_ZONE_BREITE_M, height);
    const pref = preferForSide(z.side, wantW, wantH);
    const all = [...obstacles, ...out.map((o) => ({ x: o.x, y: o.y, width: o.width, height: o.height }))];
    const find = (w: number, h: number) => findFreeSpot(w, h, width, height, all, { margin: 0.5, step: 2, blocked, preferX: pref.x, preferY: pref.y });
    let w = wantW, h = wantH;
    let spot = find(w, h);
    // Kein Platz → schrittweise verkleinern (Baukatalog-Garantie: skalieren statt still verlieren).
    while (!spot && (h > 4 || w > 4)) {
      if (h >= w && h > 4) h = Math.max(4, Math.round((h - 2) * 10) / 10);
      else if (w > 4) w = Math.max(4, Math.round((w - 2) * 10) / 10);
      spot = find(w, h);
    }
    if (!spot) continue; // kein Platz überhaupt → Karte meldet fehlende Zone (placed < requested)
    const skaliert = w < wantW - 0.01 || h < wantH - 0.01;
    out.push({ type: 'bereich', x: spot.x, y: spot.y, width: w, height: h, name: z.name, ...(skaliert ? { meta: { skaliert: `${wantW}x${wantH}` } } : {}) });
  }
  return out;
}

// Ein Stellplatz vor einem Tor: Breite entlang der Wand, Länge in die Halle,
// gekürzt sodass der zentrale Mittelgang frei bleibt. Null, wenn keine Tiefe übrig.
function stellplatzForTor(
  t: Omit<TopisObject, 'id'>, width: number, height: number,
  laenge: number, breite: number, aisleHHalf: number,
): { x: number; y: number; width: number; height: number } | null {
  const mgTop = height / 2 - aisleHHalf, mgBottom = height / 2 + aisleHHalf;
  if (t.side === 'north' || t.side === 'south') {
    const cx = t.x + t.width / 2;
    const w = Math.min(breite, width);
    const x = Math.max(0, Math.min(width - w, cx - w / 2));
    if (t.side === 'north') {
      const y0 = t.height, h = Math.min(laenge, mgTop - y0);
      return h < 1 ? null : { x, y: y0, width: w, height: h };
    }
    const inner = height - t.height, h = Math.min(laenge, inner - mgBottom);
    return h < 1 ? null : { x, y: inner - h, width: w, height: h };
  }
  const cy = t.y + t.height / 2;
  const h = Math.min(breite, height);
  const y = Math.max(0, Math.min(height - h, cy - h / 2));
  const mgL = width / 2 - aisleHHalf, mgR = width / 2 + aisleHHalf;
  if (t.side === 'west') {
    const x0 = t.width, w = Math.min(laenge, mgL - x0);
    return w < 1 ? null : { x: x0, y, width: w, height: h };
  }
  const inner = width - t.width, w = Math.min(laenge, inner - mgR);
  return w < 1 ? null : { x: inner - w, y, width: w, height: h };
}

// Bereiche als Vorfeld-Bänder: je bestückter Hallenhälfte ein Band; höhere Anzahl →
// Aufteilung in gleich breite Spalten. Deckt Tore nicht ab (startet hinter der Tortiefe).
function buildBereichBaender(
  objects: Omit<TopisObject, 'id'>[], tore: Omit<TopisObject, 'id'>[],
  width: number, height: number, aisleHHalf: number, n: number,
): void {
  const mgTop = height / 2 - aisleHHalf, mgBottom = height / 2 + aisleHHalf;
  const hasN = tore.some((t) => t.side === 'north'), hasS = tore.some((t) => t.side === 'south');
  const hasW = tore.some((t) => t.side === 'west'), hasE = tore.some((t) => t.side === 'east');
  const regions: { x: number; y: number; w: number; h: number }[] = [];
  if (hasN) regions.push({ x: 0, y: TOR_D, w: width, h: Math.max(0, mgTop - TOR_D) });
  if (hasS) regions.push({ x: 0, y: mgBottom, w: width, h: Math.max(0, height - TOR_D - mgBottom) });
  if (!hasN && !hasS) {
    const mgL = width / 2 - aisleHHalf, mgR = width / 2 + aisleHHalf;
    if (hasW) regions.push({ x: TOR_D, y: 0, w: Math.max(0, mgL - TOR_D), h: height });
    if (hasE) regions.push({ x: mgR, y: 0, w: Math.max(0, width - TOR_D - mgR), h: height });
  }
  if (regions.length === 0) regions.push({ x: 0, y: TOR_D, w: width, h: Math.max(0, mgTop - TOR_D) });

  const per = Math.ceil(n / regions.length);
  let made = 0;
  for (const reg of regions) {
    if (made >= n) break;
    const cols = Math.min(per, n - made);
    const cw = reg.w / cols;
    for (let c = 0; c < cols; c++) {
      objects.push({ type: 'bereich', x: reg.x + c * cw, y: reg.y, width: cw, height: reg.h, name: `Bereich ${made + 1}` });
      made++;
    }
  }
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
  // Mittelgang wird gebaut → nur sonstige Gänge/Fahrgänge sind noch unsupported.
  [/\b(?:fahr)?g(?:a|ä)ng/, 'Gänge/Fahrgänge'],
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

  // Stellplatz-Maße (z.B. „12x3 Stellplätze" oder „Stellplätze 12x3") — vor dem Zusatz-Maß-Ignore.
  let stellplatzDimStr: string | undefined;
  const spDim = low.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*m?\b[^.,;]{0,18}?stellpl/)
    ?? low.match(/stellpl[aä]tze?\b[^.,;]{0,18}?(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  if (spDim) {
    stellplatzDimStr = spDim[0].match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)?.[0];
    params.stellplatzLaengeM = parseFloat(spDim[1]); // Länge = in die Halle
    params.stellplatzBreiteM = parseFloat(spDim[2]); // Breite = entlang der Wand
  }
  // Zusatz-Maße melden — außer es ist das Stellplatz-Maß.
  for (let i = 1; i < dims.length; i++) {
    if (stellplatzDimStr && dims[i][0].replace(/\s/g, '') === stellplatzDimStr.replace(/\s/g, '')) continue;
    ignored.push(`Maß „${dims[i][0]}" (nicht als Hallenmaß verwendet)`);
  }

  // Tor-Breite (Lastenheft: „Length") + Lücke (Lastenheft: „distance between the gates").
  // Können global („jedes Tor 4 m breit mit 3 m Abstand zum nächsten Tor") oder je Segment stehen.
  // Tor-Breite NUR im Tor-Kontext (sonst würde „100 m breite" der HALLE als Tor-Breite gelesen).
  const matchBreite = (s: string) => s.match(/tor\w*[^.,;]{0,20}?(\d+(?:\.\d+)?)\s*m(?:eter)?n?\s*breit/)?.[1]
    ?? s.match(/(\d+(?:\.\d+)?)\s*m(?:eter)?n?\s*breit(?:e)?[^.,;]{0,20}?\btore?\b/)?.[1];
  const matchLuecke = (s: string) => s.match(/(\d+(?:\.\d+)?)\s*m(?:eter)?n?\s*(?:abstand|l[üu]cke)/)?.[1]
    ?? s.match(/(?:abstand|l[üu]cke)[^\d]{0,10}(\d+(?:\.\d+)?)/)?.[1];
  const globalBreite = matchBreite(low);
  const globalLuecke = matchLuecke(low) ?? (matchSpacing(low, false) != null ? String(matchSpacing(low, false)) : undefined);

  // Torreihen aus Segmenten (getrennt durch , ; oder „und").
  const segments = low.split(/[,;]|\bund\b/);
  const gates: GateGroup[] = [];
  for (const seg of segments) {
    const cm = seg.match(/(\d+)\s*tore?\b/);
    const side = sideOf(seg);
    if (cm && side) {
      const noDims = !/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/.test(seg);
      const breite = matchBreite(seg) ?? globalBreite;
      const luecke = matchLuecke(seg) ?? (matchSpacing(seg, noDims) != null ? String(matchSpacing(seg, noDims)) : undefined) ?? globalLuecke;
      gates.push({
        count: parseInt(cm[1], 10), side,
        ...(breite != null ? { torBreiteM: parseFloat(breite) } : {}),
        ...(luecke != null ? { lueckeM: parseFloat(luecke) } : {}),
      });
    }
  }
  if (gates.length > 0) params.gates = gates;

  // Benannte Zonen (Wareneingang West / Warenausgang Ost …) — Seite aus dem Umfeld ableiten.
  const zonen: { name: string; side?: GateSide; laengeM?: number; breiteM?: number }[] = [];
  for (const [re, label] of [[/wareneingang/, 'Wareneingang'], [/warenausgang/, 'Warenausgang']] as [RegExp, string][]) {
    const m = low.match(re);
    if (m) {
      const after = low.slice(m.index ?? 0, (m.index ?? 0) + 40);
      const dim = after.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
      zonen.push({
        name: label,
        side: sideOf(after) ?? undefined,
        ...(dim ? { laengeM: parseFloat(dim[1]), breiteM: parseFloat(dim[2]) } : {}),
      });
    }
  }
  if (zonen.length > 0) params.zonen = zonen;

  // Bereiche / Stellplätze (Anzahl) — „6 Bereiche", „20 Lagerplätze/Stellplätze".
  const bm = low.match(/(\d+)\s*(?:lager)?bereich/);
  if (bm) params.bereiche = parseInt(bm[1], 10);
  else if (zonen.length === 0 && /bereich/.test(low)) ignored.push('Bereiche (Anzahl unklar — bitte angeben)');
  // „je Tor" / „pro Tor" / „vor jedem Tor" → ein Stellplatz vor jedem Tor (Cross-Dock).
  const jeTor = /\b(?:je|pro)\s*tor\b|vor\s*jedem\s*tor|an\s*jedem\s*tor|je\s*dock/.test(low);
  if (jeTor) params.stellplaetzeJeTor = true;
  const sm = low.match(/(\d+)\s*(?:stell|lager)pl(?:a|ä)tz/);
  if (sm && !jeTor) params.stellplaetze = parseInt(sm[1], 10);
  else if (!jeTor && !sm && /stellpl(?:a|ä)tz/.test(low)) ignored.push('Stellplätze (Anzahl unklar — bitte angeben)');

  // Zentraler Mittelgang (Breite) — „6 m Mittelgang" / „Mittelgang 6".
  const mgM = low.match(/(\d+(?:\.\d+)?)\s*m?\s*(?:breiter?\s*)?mittelgang/)
    ?? low.match(/mittelgang[^\d]{0,8}(\d+(?:\.\d+)?)/);
  if (mgM) params.mittelgangM = parseFloat(mgM[1]);

  // Sonderflächen (AV/ÜZ/Wertverschlag/Kommissionier/…)
  const flaechen: { art: string; count: number }[] = [];
  for (const f of FLAECHEN) {
    const m = low.match(f.countRe);
    if (m) flaechen.push({ art: f.art, count: parseInt(m[1], 10) });
  }
  if (flaechen.length > 0) params.flaechen = flaechen;

  // Tor-Nummerierungsschema
  if (/nach\s*seite|seitenweise|pro\s*seite|seiten(?:weise)?nummer/.test(low)) params.nummerierung = 'seite';
  else if (/alphabet|buchstaben|a\s*,\s*b\s*,\s*c/.test(low)) params.nummerierung = 'alpha';
  const startM = low.match(/(?:ab|start(?:wert|nummer)?)\s*(?:nr\.?|nummer)?\s*(\d+)/);
  if (startM) params.startNr = parseInt(startM[1], 10);

  // Zonen-Maße (z. B. „20x15" bei Wareneingang) dürfen NICHT als „ignoriertes Maß" auftauchen.
  const zoneDims = zonen.filter((z) => z.laengeM);
  if (zoneDims.length > 0) {
    const norm = (s: string) => s.replace(/\s/g, '').replace('×', 'x');
    const zset = new Set(zoneDims.map((z) => norm(`${z.laengeM}x${z.breiteM}`)));
    for (let i = ignored.length - 1; i >= 0; i--) {
      const m = ignored[i].match(/(\d+(?:\.\d+)?\s*[x×]\s*\d+(?:\.\d+)?)/);
      if (m && zset.has(norm(m[1]))) ignored.splice(i, 1);
    }
  }

  // Nicht unterstützte Elemente offen melden.
  for (const [re, label] of UNSUPPORTED) {
    if (re.test(low) && !ignored.some((x) => x.includes(label))) {
      ignored.push(`${label} (noch nicht unterstützt — bitte von Hand ergänzen)`);
    }
  }
  if (ignored.length > 0) params.ignored = ignored;

  return params;
}
