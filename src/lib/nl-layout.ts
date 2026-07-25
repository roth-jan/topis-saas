// KI-Textbuilder — deterministischer Kern.
//
// Architektur (Council 25.07.2026, einstimmig): Das LLM liefert NUR strukturierte
// Parameter (LayoutParams). Die Geometrie/Koordinaten entstehen AUSSCHLIESSLICH hier —
// deterministisch, testbar, reproduzierbar (Voraussetzung für die Min/Colli-Rechnung).
// Dieser Kern hat KEINE LLM-/Netz-/Store-Abhängigkeit und ist rein unit-testbar.
//
// Spec: topis/SPEC-KI-TEXTBUILDER-2026-07-25.md

import { OBJECT_DEFAULTS, TopisObject, ObjectType } from '@/types/topis';

export type GateSide = 'north' | 'south' | 'east' | 'west';

/** Rohausgabe des LLM (Edge Function) — striktes Schema, v1. */
export interface LayoutParams {
  action: 'createHall';
  hall: { lengthM: number; widthM: number; name?: string };
  gates?: {
    count: number;
    side: GateSide;
    spacingM?: number;      // Achsabstand Mitte-zu-Mitte
    firstOffsetM?: number;  // Abstand des ersten Tors von der Wandecke
  };
  unit?: 'm' | 'ft';
  unresolved?: string[];    // Felder, die das LLM nicht sicher ableiten konnte
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  /** Normalisierte Parameter in Metern, mit gefüllten Defaults. */
  filled: LayoutParams;
}

const FT_TO_M = 0.3048;
const DEFAULT_FIRST_OFFSET_M = 1.0;
// Plausible Torabstand-Grenzen (Zahlendreher-Erkennung).
const SPACING_MIN_WARN = 2.0;
const SPACING_MAX_WARN = 20.0;

function defaultSpacingM(): number {
  return OBJECT_DEFAULTS.tor.width + 1; // 4,5 m — identisch zum Tor-Pinsel
}

/**
 * Validiert + normalisiert die LLM-Parameter: Einheiten → Meter, Defaults füllen,
 * Plausibilität prüfen. Gibt Fehler (blockierend) + Warnungen (Hinweis) zurück.
 * KEINE Geometrie hier — nur Zahlenprüfung.
 */
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
  };

  if (params.gates) {
    const count = Math.round(params.gates.count);
    const side = params.gates.side;
    const spacingM = params.gates.spacingM != null ? toM(params.gates.spacingM) : defaultSpacingM();
    const firstOffsetM = params.gates.firstOffsetM != null ? toM(params.gates.firstOffsetM) : DEFAULT_FIRST_OFFSET_M;

    if (!Number.isFinite(count) || count < 1) errors.push('Toranzahl fehlt oder ist ungültig.');
    if (!['north', 'south', 'east', 'west'].includes(side)) errors.push('Tor-Seite (Nord/Süd/Ost/West) fehlt oder ist ungültig.');
    if (!Number.isFinite(spacingM) || spacingM <= 0) errors.push('Torabstand ist ungültig.');

    if (errors.length === 0) {
      // Passt die Reihe auf die Wand? (Wandlänge = Länge bei N/S, Breite bei O/W)
      const horiz = side === 'north' || side === 'south';
      const wallLen = horiz ? lengthM : widthM;
      const torSizeAlong = OBJECT_DEFAULTS.tor.width; // Tor liegt mit Breite entlang der Wand
      const requiredSpan = firstOffsetM + (count - 1) * spacingM + torSizeAlong / 2;
      if (requiredSpan > wallLen + 0.01) {
        errors.push(
          `${count} Tore mit ${spacingM.toFixed(2)} m Abstand brauchen ~${requiredSpan.toFixed(0)} m, ` +
          `die ${horiz ? 'lange' : 'kurze'} Wand hat aber nur ${wallLen.toFixed(0)} m.`,
        );
      }
      if (spacingM < SPACING_MIN_WARN) warnings.push(`Torabstand ${spacingM.toFixed(2)} m ist ungewöhnlich eng — bitte prüfen (Zahlendreher?).`);
      if (spacingM > SPACING_MAX_WARN) warnings.push(`Torabstand ${spacingM.toFixed(2)} m ist ungewöhnlich groß — bitte prüfen.`);
    }

    filled.gates = { count, side, spacingM, firstOffsetM };
  }

  return { ok: errors.length === 0, errors, warnings, filled };
}

/**
 * Kanonischer Offline-Parser für das Standardformat, z.B.
 *   „Halle 210x58, 115 Tore Nord 3,75"  ·  „100 x 50 m, 20 Tore im Norden, Abstand 5"
 * Best-effort, regelbasiert — KEIN LLM. Dient als (a) Dev-Stub ohne Edge Function und
 * (b) Offline-/Kostenlos-Fallback. Fuzzy-Sprache übernimmt später das LLM.
 * Gibt null zurück, wenn keine Hallenmaße erkennbar sind.
 */
export function parseCanonical(input: string): LayoutParams | null {
  if (!input || !input.trim()) return null;
  // Dezimal-Komma → Punkt (nur zwischen Ziffern), Vergleichs-Text kleingeschrieben.
  const t = input.replace(/(\d),(\d)/g, '$1.$2');
  const low = t.toLowerCase();

  const dims = low.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  if (!dims) return null;
  const lengthM = parseFloat(dims[1]);
  const widthM = parseFloat(dims[2]);

  const unit: 'm' | 'ft' = /\bft\b|fuß|feet/.test(low) ? 'ft' : 'm';

  const params: LayoutParams = {
    action: 'createHall',
    hall: { lengthM, widthM },
    unit,
  };

  const countMatch = low.match(/(\d+)\s*tore?\b/);
  let side: GateSide | undefined;
  if (/\bnord|norden\b/.test(low)) side = 'north';
  else if (/\bsüd|sud|süden|sueden\b/.test(low)) side = 'south';
  else if (/\bost|osten\b/.test(low)) side = 'east';
  else if (/\bwest|westen\b/.test(low)) side = 'west';

  if (countMatch && side) {
    // Abstand/Raster erkennen — mehrere Formen:
    //  a) Zahl vor Schlüsselwort: „3.75-m-Raster", „3.75er Raster", „5 Abstand"
    //  b) Schlüsselwort vor Zahl: „Abstand 5", „Raster 3.75"
    //  c) Fallback: eine Dezimalzahl (enthält Punkt), die nicht Teil der Maße ist
    //     (z.B. „115 Tore Nord 3,75" ohne Schlüsselwort)
    let spacingM: number | undefined;
    const a = low.match(/(\d+(?:\.\d+)?)[^\d]{0,4}(?:raster|abstand)/);
    const b = low.match(/(?:raster|abstand)[^\d]{0,4}(\d+(?:\.\d+)?)/);
    if (a) spacingM = parseFloat(a[1]);
    else if (b) spacingM = parseFloat(b[1]);
    else {
      const dimStrs = [dims[1], dims[2]];
      const decimals = (low.match(/\d+\.\d+/g) ?? []).filter((d) => !dimStrs.includes(d));
      if (decimals.length > 0) spacingM = parseFloat(decimals[0]);
    }
    params.gates = { count: parseInt(countMatch[1], 10), side, ...(spacingM != null ? { spacingM } : {}) };
  }

  return params;
}

export interface GeneratedLayout {
  hall: { width: number; height: number; name: string };
  objects: Omit<TopisObject, 'id'>[];
}

/**
 * Deterministisch: normalisierte Parameter → Halle + Tor-Objekte.
 * Gleiche Tor-Mathematik wie der Tor-Pinsel (computePinselGhosts): fester Achsabstand,
 * N/S quer (B×T = 3.5×1.5), O/W hochkant (1.5×3.5), an die Hallenkante geclampt.
 * Liefert reine Daten — kein Store, kein Reset. `filled` MUSS validiert (ok) sein.
 */
export function paramsToLayout(filled: LayoutParams): GeneratedLayout {
  const width = filled.hall.lengthM;   // X (horizontal)
  const height = filled.hall.widthM;   // Y (Tiefe)
  const name = filled.hall.name ?? 'Neue Halle';
  const objects: Omit<TopisObject, 'id'>[] = [];

  if (filled.gates) {
    const { count, side, spacingM = defaultSpacingM(), firstOffsetM = DEFAULT_FIRST_OFFSET_M } = filled.gates;
    const W = OBJECT_DEFAULTS.tor.width;   // entlang der Wand
    const D = OBJECT_DEFAULTS.tor.height;  // in die Halle hinein
    const horiz = side === 'north' || side === 'south';

    for (let i = 0; i < count; i++) {
      const center = firstOffsetM + i * spacingM;
      let x: number, y: number, w: number, h: number;
      if (horiz) {
        w = W; h = D;
        x = Math.max(0, Math.min(width - w, center - w / 2));
        y = side === 'north' ? 0 : height - h;
      } else {
        w = D; h = W;
        y = Math.max(0, Math.min(height - h, center - h / 2));
        x = side === 'west' ? 0 : width - w;
      }
      const nr = i + 1;
      objects.push({
        type: 'tor' as ObjectType,
        x, y, width: w, height: h,
        name: `Tor ${nr}`,
        side,
        torNummer: nr,
        tags: ['messpunkt'],
        meta: { code: `MP${nr}` },
      });
    }
  }

  return { hall: { width, height, name }, objects };
}
