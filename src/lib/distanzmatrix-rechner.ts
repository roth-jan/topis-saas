/**
 * Berechnet den gewichteten Verteilweg aus einer gemessenen Distanzmatrix.
 * Ersetzt die A*-basierte Berechnung durch echte Messwerte.
 *
 * Formel: Σ(distanz_EZ_zu_Tor × colli_Relation) / Σ(colli)
 * Referenzwert AS Gersthofen: ≈ 138.8m
 */

import type { Distanzmatrix, DistanzmatrixErgebnis, VerteilwegDetail } from '@/types/distanzmatrix';

/**
 * Ordnet eine Ausgangsrelation einem Tor zu, basierend auf den SE-Relationen in der Distanzmatrix.
 * Versucht exakten Match, dann Prefix-Match (z.B. "0100" → "01", "CL4016" → Netzwerk-Fallback).
 */
function findeTorFuerRelation(dm: Distanzmatrix, relation: string): { tor: string; ez: string } | null {
  // 1. Exakter Match in SE-Relationen
  for (const eintrag of dm.eintraege) {
    if (eintrag.seRelationen.includes(relation)) {
      return { tor: eintrag.nachName, ez: eintrag.vonName };
    }
  }

  // 2. Prefix-Match: "0100" → suche "01", "3608" → suche "36"
  // Viele IDS-Depots haben 4-stellige Codes, die 2-stelligen Hauptrelationen entsprechen
  if (relation.length >= 3 && /^\d+$/.test(relation)) {
    const prefix2 = relation.substring(0, 2);
    for (const eintrag of dm.eintraege) {
      if (eintrag.seRelationen.includes(prefix2)) {
        return { tor: eintrag.nachName, ez: eintrag.vonName };
      }
    }
  }

  // 3. SA-Relationen als Fallback (wenn keine SE-Zuordnung existiert)
  for (const eintrag of dm.eintraege) {
    if (eintrag.saRelationen.includes(relation)) {
      return { tor: eintrag.nachName, ez: eintrag.vonName };
    }
  }

  return null;
}

/**
 * Findet die Distanz von einer Entladezone zu einem Tor.
 */
function findeDistanz(dm: Distanzmatrix, ezName: string, torName: string): number | null {
  const eintrag = dm.eintraege.find(e => e.vonName === ezName && e.nachName === torName);
  return eintrag ? eintrag.distanzM : null;
}

/**
 * Berechnet die durchschnittliche Distanz über alle EZ→Tor-Paare für eine EZ.
 * Wird als Fallback für nicht zugeordnete Relationen verwendet.
 */
function berechneDurchschnittsDistanz(dm: Distanzmatrix, ezName: string): number {
  const ezEntries = dm.eintraege.filter(e => e.vonName === ezName);
  if (ezEntries.length === 0) return 60; // Harter Fallback
  return ezEntries.reduce((sum, e) => sum + e.distanzM, 0) / ezEntries.length;
}

/**
 * Berechnet den gewichteten Verteilweg aus einer gemessenen Distanzmatrix.
 * Nutzt die Leerhubwagen-Daten (Colli pro Relation) und die Distanzmatrix (EZ→Tor).
 *
 * Nicht zugeordnete Relationen werden mit der Durchschnittsdistanz der Standard-EZ bewertet,
 * um eine realistische Gesamtschätzung zu ermöglichen.
 *
 * @param dm - Die Distanzmatrix mit Einträgen und Leerhubwagen-Daten
 * @param standardEZ - Standard-Entladezone (default: "EZ 1" — größte Zone)
 * @returns Ergebnis mit gewichtetem Verteilweg und Details
 */
export function berechneVerteilwegAusDistanzmatrix(
  dm: Distanzmatrix,
  standardEZ: string = 'EZ 1',
): DistanzmatrixErgebnis {
  const details: VerteilwegDetail[] = [];
  let totalDistColli = 0;
  let totalColli = 0;
  let nichtZugeordnet = 0;

  const avgDistanz = berechneDurchschnittsDistanz(dm, standardEZ);

  for (const lhw of dm.leerhubwagen) {
    const zuordnung = findeTorFuerRelation(dm, lhw.ausgangsrelation);

    if (!zuordnung) {
      // Fallback: Durchschnittsdistanz für nicht zugeordnete Relationen
      nichtZugeordnet += lhw.colli;
      const gewichtet = avgDistanz * lhw.colli;
      totalDistColli += gewichtet;
      totalColli += lhw.colli;
      details.push({
        relation: lhw.ausgangsrelation,
        colli: lhw.colli,
        tor: '(Ø)',
        entladezone: standardEZ,
        distanzM: avgDistanz,
        gewichtetM: gewichtet,
      });
      continue;
    }

    // Distanz von der Entladezone zum zugeordneten Tor
    const distanz = findeDistanz(dm, zuordnung.ez, zuordnung.tor)
      ?? findeDistanz(dm, standardEZ, zuordnung.tor)
      ?? avgDistanz;

    const ez = findeDistanz(dm, zuordnung.ez, zuordnung.tor) !== null
      ? zuordnung.ez : standardEZ;

    const gewichtet = distanz * lhw.colli;
    totalDistColli += gewichtet;
    totalColli += lhw.colli;
    details.push({
      relation: lhw.ausgangsrelation,
      colli: lhw.colli,
      tor: zuordnung.tor,
      entladezone: ez,
      distanzM: distanz,
      gewichtetM: gewichtet,
    });
  }

  const gewichteterWegM = totalColli > 0 ? totalDistColli / totalColli : 0;

  // Sortiere nach Colli-Volumen absteigend
  details.sort((a, b) => b.colli - a.colli);

  return {
    gewichteterWegM,
    gesamtColli: dm.gesamtColli,
    abgedeckteColli: totalColli - nichtZugeordnet,
    nichtZugeordnet,
    details,
  };
}
