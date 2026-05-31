// Verlader-Berechnungen (Lastenheft Kapitel 4)
//
// Reine, nebenwirkungsfreie Funktionen für:
//  - Auslastung eines Verladers in % (Aufträge/Tag vs. theoretische Kapazität)
//  - Verlader-Bedarf bei gegebenem Volumen + Arbeitsstunden + Kapazität/h
//  - Gruppierung einer Verlader-Liste nach Schicht
//
// Die Funktionen sind absichtlich klein und ohne Store-Zugriff, damit sie in
// Vitest deterministisch testbar bleiben.

import type { Verlader, VerladerSchicht } from '@/types/topis';

/**
 * Auslastung eines Verladers in Prozent (0..n, kann >100% werden).
 *
 * Formel: alleAuftraegeProTag / (kapazitaetProStunde × 8 Std/Tag) × 100
 *
 * Annahme: 8h-Standardarbeitstag wenn keine explizite Schicht-Dauer
 * mitgegeben wird. Das ist die in der TOPIS-Doku übliche Vereinfachung; bei
 * Schicht-Berechnung mit echten Std bitte `verladerBedarf` mit eigenem
 * Arbeitsstunden-Wert verwenden.
 *
 * Edge-Cases:
 *  - kapazitaetProStunde fehlt oder 0 → 0 (keine Auslastung berechenbar)
 *  - alleAuftraegeProTag < 0 → 0 (Eingaben werden bereinigt)
 */
export function verladerAuslastung(
  v: Verlader,
  alleAuftraegeProTag: number,
  arbeitsstundenProTag = 8,
): number {
  if (!v.kapazitaetProStunde || v.kapazitaetProStunde <= 0) return 0;
  if (alleAuftraegeProTag <= 0) return 0;
  if (arbeitsstundenProTag <= 0) return 0;
  const kapProTag = v.kapazitaetProStunde * arbeitsstundenProTag;
  return (alleAuftraegeProTag / kapProTag) * 100;
}

/**
 * Wie viele Verlader werden benötigt, um colliProTag in arbeitsstunden zu
 * bewältigen, bei einer Kapazität von kapProH Colli/h?
 *
 * Formel: ceil(colliProTag / (kapProH × arbeitsstunden))
 *
 * Edge-Cases:
 *  - colliProTag ≤ 0 → 0 (kein Bedarf)
 *  - kapProH ≤ 0 oder arbeitsstunden ≤ 0 → 0 (nicht berechenbar)
 *  - Ergebnis wird aufgerundet (ein halber Mensch arbeitet nicht).
 */
export function verladerBedarf(
  colliProTag: number,
  kapProH: number,
  arbeitsstunden: number,
): number {
  if (colliProTag <= 0) return 0;
  if (kapProH <= 0 || arbeitsstunden <= 0) return 0;
  const bedarf = colliProTag / (kapProH * arbeitsstunden);
  return Math.ceil(bedarf);
}

/**
 * Gruppiert eine Verlader-Liste nach Schicht. Verlader ohne Schicht-Property
 * werden in den 'tag'-Topf gelegt (Default-Schicht).
 */
export function gruppiereVerladerNachSchicht(
  verlader: Verlader[],
): Record<VerladerSchicht, Verlader[]> {
  const out: Record<VerladerSchicht, Verlader[]> = {
    frueh: [],
    spaet: [],
    nacht: [],
    tag: [],
  };
  for (const v of verlader) {
    const s = v.schicht ?? 'tag';
    out[s].push(v);
  }
  return out;
}

/** Hilfsfunktion fürs UI: lesbares Label pro Schicht. */
export function schichtLabel(s: VerladerSchicht): string {
  switch (s) {
    case 'frueh':
      return 'Frühschicht';
    case 'spaet':
      return 'Spätschicht';
    case 'nacht':
      return 'Nachtschicht';
    case 'tag':
      return 'Tagschicht';
  }
}
