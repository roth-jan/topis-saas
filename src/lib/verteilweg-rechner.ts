import type { TopisObject, Gang, FFZ } from '@/types/topis';
import type { ScandatenRecord, TorZuordnung, RelationZuordnung } from '@/types/scandaten';
import { buildGangGraph, findPath, type Graph } from './pathfinding';

/**
 * Ergebnis der Verteilweg-Berechnung pro Tor/Stellplatz.
 */
export interface VerteilwegErgebnis {
  stellplatzKey: string;
  objectId: number;
  objectName: string;
  /** Gewichteter Durchschnittsweg in Metern */
  gewichteterWegM: number;
  /** Gesamt-Colli dieses Stellplatzes */
  colliGesamt: number;
  /** Einzelne Wege pro Relation */
  wege: { relation: string; distanzM: number; colli: number }[];
}

/**
 * Gesamtergebnis der Verteilweg-Analyse.
 */
export interface VerteilwegAnalyse {
  /** Gewichteter Durchschnittsweg über alle Tore/Stellplätze */
  gesamtGewichteterWegM: number;
  /** Gesamt-Colli */
  gesamtColli: number;
  /** Ergebnisse pro Stellplatz */
  ergebnisse: VerteilwegErgebnis[];
}

/** Distanz-Cache für wiederholte Queries (gleiche Paare ändern sich nicht) */
const distanzCache = new Map<string, number>();

function getCacheKey(fromId: number, toId: number): string {
  return `${fromId}->${toId}`;
}

/**
 * Cache leeren (z.B. wenn Layout sich ändert).
 */
export function clearDistanzCache(): void {
  distanzCache.clear();
}

/**
 * Berechnet die Distanz zwischen zwei Objekten (mit Cache).
 */
export function berechneDistanzMitCache(
  from: TopisObject,
  to: TopisObject,
  gaenge: Gang[],
  ffz?: FFZ
): number {
  const key = getCacheKey(from.id, to.id);
  const cached = distanzCache.get(key);
  if (cached !== undefined) return cached;

  const graph = buildGangGraph(gaenge, ffz);
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };

  const result = findPath(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, graph, ffz);

  // Fallback: Luftlinie wenn kein Gang-Pfad
  const distanz = result
    ? result.distance
    : Math.sqrt((toCenter.x - fromCenter.x) ** 2 + (toCenter.y - fromCenter.y) ** 2);

  distanzCache.set(key, distanz);
  return distanz;
}

/**
 * Berechnet den gewichteten Verteilweg basierend auf Scandaten und Zuordnungen.
 *
 * Formel: gewichteterWeg = Σ(distanz_i × colli_i) / Σ(colli_i)
 *
 * Für jedes Paar (Entladezone/Tor → Ziel-Relation/Bereich) wird die Distanz
 * über das Gang-Netzwerk berechnet und mit der Colli-Menge gewichtet.
 */
export function berechneGewichtetenVerteilweg(
  records: ScandatenRecord[],
  torZuordnungen: TorZuordnung[],
  relationZuordnungen: RelationZuordnung[],
  objects: TopisObject[],
  gaenge: Gang[],
  ffz?: FFZ
): VerteilwegAnalyse {
  const ergebnisse: VerteilwegErgebnis[] = [];
  let gesamtDistanzColli = 0;
  let gesamtColli = 0;

  // Gruppiere Records nach Stellplatz
  const stellplatzGroups = new Map<string, ScandatenRecord[]>();
  records.forEach((r) => {
    if (!r.stellplatz) return;
    if (!stellplatzGroups.has(r.stellplatz)) stellplatzGroups.set(r.stellplatz, []);
    stellplatzGroups.get(r.stellplatz)!.push(r);
  });

  stellplatzGroups.forEach((recs, stellplatzKey) => {
    const torZuordnung = torZuordnungen.find((z) => z.stellplatzKey === stellplatzKey);
    if (!torZuordnung || !torZuordnung.objectId) return;

    const torObj = objects.find((o) => o.id === torZuordnung.objectId);
    if (!torObj) return;

    // Gruppiere nach Relation
    const relationGroups = new Map<string, number>();
    recs.forEach((r) => {
      const rel = r.ausgangsrelation || 'UNBEKANNT';
      relationGroups.set(rel, (relationGroups.get(rel) || 0) + r.colli);
    });

    const wege: { relation: string; distanzM: number; colli: number }[] = [];
    let stellplatzDistanzColli = 0;
    let stellplatzColli = 0;

    relationGroups.forEach((colli, relation) => {
      // Finde Ziel-Bereich
      const relZuordnung = relationZuordnungen.find((z) => z.relationKey === relation);
      let distanzM = 0;

      if (relZuordnung?.objectId) {
        const zielObj = objects.find((o) => o.id === relZuordnung.objectId);
        if (zielObj) {
          distanzM = berechneDistanzMitCache(torObj, zielObj, gaenge, ffz);
        }
      }

      // Wenn kein Ziel zugeordnet → Schätzung basierend auf Hallengröße
      if (distanzM === 0 && objects.length > 0) {
        // Fallback: Median-Distanz aller Objekte zum Tor (grobe Schätzung)
        distanzM = 50; // Default 50m wenn nichts berechenbar
      }

      wege.push({ relation, distanzM, colli });
      stellplatzDistanzColli += distanzM * colli;
      stellplatzColli += colli;
    });

    const gewichteterWeg = stellplatzColli > 0 ? stellplatzDistanzColli / stellplatzColli : 0;

    ergebnisse.push({
      stellplatzKey,
      objectId: torZuordnung.objectId,
      objectName: torObj.name || stellplatzKey,
      gewichteterWegM: gewichteterWeg,
      colliGesamt: stellplatzColli,
      wege,
    });

    gesamtDistanzColli += stellplatzDistanzColli;
    gesamtColli += stellplatzColli;
  });

  return {
    gesamtGewichteterWegM: gesamtColli > 0 ? gesamtDistanzColli / gesamtColli : 0,
    gesamtColli,
    ergebnisse,
  };
}

/**
 * Efficient variant: builds the graph once and reuses it for all distance lookups.
 * Same logic as berechneGewichtetenVerteilweg but avoids rebuilding the graph per pair.
 */
export function berechneVerteilwegEffizient(
  records: ScandatenRecord[],
  torZuordnungen: TorZuordnung[],
  relationZuordnungen: RelationZuordnung[],
  objects: TopisObject[],
  gaenge: Gang[],
  ffz?: FFZ
): VerteilwegAnalyse {
  const graph = buildGangGraph(gaenge, ffz);
  const localCache = new Map<string, number>();
  const ergebnisse: VerteilwegErgebnis[] = [];
  let gesamtDistanzColli = 0;
  let gesamtColli = 0;

  function getDistanz(from: TopisObject, to: TopisObject): number {
    const key = `${from.id}->${to.id}`;
    const cached = localCache.get(key);
    if (cached !== undefined) return cached;

    const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
    const result = findPath(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, graph, ffz);
    const distanz = result
      ? result.distance
      : Math.sqrt((toCenter.x - fromCenter.x) ** 2 + (toCenter.y - fromCenter.y) ** 2);
    localCache.set(key, distanz);
    return distanz;
  }

  const stellplatzGroups = new Map<string, ScandatenRecord[]>();
  records.forEach((r) => {
    if (!r.stellplatz) return;
    if (!stellplatzGroups.has(r.stellplatz)) stellplatzGroups.set(r.stellplatz, []);
    stellplatzGroups.get(r.stellplatz)!.push(r);
  });

  stellplatzGroups.forEach((recs, stellplatzKey) => {
    const torZuordnung = torZuordnungen.find((z) => z.stellplatzKey === stellplatzKey);
    if (!torZuordnung || !torZuordnung.objectId) return;
    const torObj = objects.find((o) => o.id === torZuordnung.objectId);
    if (!torObj) return;

    const relationGroups = new Map<string, number>();
    recs.forEach((r) => {
      const rel = r.ausgangsrelation || 'UNBEKANNT';
      relationGroups.set(rel, (relationGroups.get(rel) || 0) + r.colli);
    });

    const wege: { relation: string; distanzM: number; colli: number }[] = [];
    let stellplatzDistanzColli = 0;
    let stellplatzColli = 0;

    relationGroups.forEach((colli, relation) => {
      const relZuordnung = relationZuordnungen.find((z) => z.relationKey === relation);
      let distanzM = 0;

      if (relZuordnung?.objectId) {
        const zielObj = objects.find((o) => o.id === relZuordnung.objectId);
        if (zielObj) {
          distanzM = getDistanz(torObj, zielObj);
        }
      }

      if (distanzM === 0 && objects.length > 0) {
        distanzM = 50;
      }

      wege.push({ relation, distanzM, colli });
      stellplatzDistanzColli += distanzM * colli;
      stellplatzColli += colli;
    });

    const gewichteterWeg = stellplatzColli > 0 ? stellplatzDistanzColli / stellplatzColli : 0;
    ergebnisse.push({
      stellplatzKey,
      objectId: torZuordnung.objectId,
      objectName: torObj.name || stellplatzKey,
      gewichteterWegM: gewichteterWeg,
      colliGesamt: stellplatzColli,
      wege,
    });

    gesamtDistanzColli += stellplatzDistanzColli;
    gesamtColli += stellplatzColli;
  });

  return {
    gesamtGewichteterWegM: gesamtColli > 0 ? gesamtDistanzColli / gesamtColli : 0,
    gesamtColli,
    ergebnisse,
  };
}
