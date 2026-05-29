import type { TopisObject, Gang } from '@/types/topis';
import type { ScandatenRecord, RelationZuordnung } from '@/types/scandaten';
import { buildGangGraph, findPath, connectGangsToBounds, generateTorAnbindungsGaenge } from '@/lib/pathfinding';

export interface BereichVorschlag {
  bereichId: number;
  bereichName: string;
  altePosition: { x: number; y: number };
  neuePosition: { x: number; y: number };
  verschiebungM: number;
  toreVersorgt: number;
  colliProTag: number;
}

export interface OptimizerErgebnis {
  vorschlaege: BereichVorschlag[];
  verteilwegVorherM: number;
  verteilwegNachherM: number;
  ersparnisProzent: number;
  arbeitstage: number;
}

interface OptInputs {
  objects: TopisObject[];
  records: ScandatenRecord[];
  relationZuordnungen: RelationZuordnung[];
  gaenge: Gang[];
  hallWidth: number;
  hallHeight: number;
}

function center(o: { x: number; y: number; width: number; height: number }) {
  return { x: o.x + o.width / 2, y: o.y + o.height / 2 };
}

function rectsOverlap(a: TopisObject, b: TopisObject, margin: number = 0.5): boolean {
  return !(a.x + a.width + margin <= b.x || b.x + b.width + margin <= a.x ||
           a.y + a.height + margin <= b.y || b.y + b.height + margin <= a.y);
}

function clampPosition(
  bereich: TopisObject,
  centerX: number,
  centerY: number,
  obstacles: TopisObject[],
  hallWidth: number,
  hallHeight: number,
): { x: number; y: number } {
  let x = centerX - bereich.width / 2;
  let y = centerY - bereich.height / 2;
  x = Math.max(0, Math.min(hallWidth - bereich.width, x));
  y = Math.max(0, Math.min(hallHeight - bereich.height, y));

  // Kollision mit anderen Objekten: greedy in 1m-Schritten verschieben bis kollisionsfrei.
  const candidate = { ...bereich, x, y } as TopisObject;
  for (let attempt = 0; attempt < 30; attempt++) {
    const hit = obstacles.find((o) => o.id !== bereich.id && rectsOverlap(candidate, o));
    if (!hit) break;
    const dx = candidate.x + candidate.width / 2 - (hit.x + hit.width / 2);
    const dy = candidate.y + candidate.height / 2 - (hit.y + hit.height / 2);
    const norm = Math.max(0.5, Math.sqrt(dx * dx + dy * dy));
    candidate.x += (dx / norm);
    candidate.y += (dy / norm);
    candidate.x = Math.max(0, Math.min(hallWidth - candidate.width, candidate.x));
    candidate.y = Math.max(0, Math.min(hallHeight - candidate.height, candidate.y));
  }
  return { x: candidate.x, y: candidate.y };
}

function gewichteterVerteilweg(
  objects: TopisObject[],
  records: ScandatenRecord[],
  relationZuordnungen: RelationZuordnung[],
  gaenge: Gang[],
): { mittel: number; arbeitstage: number } {
  const graph = buildGangGraph(gaenge);
  const walls = objects.filter((o) => o.type === 'wand' || o.type === 'bereich' || o.type === 'regal' || o.type === 'hindernis');
  const torById = new Map<number, TopisObject>();
  for (const t of objects) if (t.type === 'tor') torById.set(t.id, t);
  const torByMpCode = new Map<string, TopisObject>();
  for (const t of objects) {
    const code = (t.meta as { code?: string } | undefined)?.code;
    if (code) torByMpCode.set(code, t);
  }
  const bereichByRelation = new Map<string, TopisObject>();
  for (const rz of relationZuordnungen) {
    if (rz.objectId === null) continue;
    const b = objects.find((o) => o.id === rz.objectId);
    if (b) bereichByRelation.set(rz.relationKey, b);
  }

  // Pro Tor-Bereich-Paar: cache findPath-Distanz, dann gewichtet über Records summieren.
  const distCache = new Map<string, number>();
  function pathDist(tor: TopisObject, bereich: TopisObject): number {
    const key = `${tor.id}|${bereich.id}`;
    const c = distCache.get(key);
    if (c !== undefined) return c;
    const tc = center(tor);
    const bc = center(bereich);
    const r = findPath(tc.x, tc.y, bc.x, bc.y, graph, undefined, walls);
    const d = r?.distance ?? Math.sqrt((tc.x - bc.x) ** 2 + (tc.y - bc.y) ** 2);
    distCache.set(key, d);
    return d;
  }

  let sumColliMeter = 0;
  let sumColli = 0;
  const tage = new Set<string>();
  for (const r of records) {
    const tor = torByMpCode.get(r.stellplatz) ?? torById.get(r.messpunkt);
    if (!tor) continue;
    const bereich = bereichByRelation.get(r.dispogebiet || r.ausgangsrelation);
    if (!bereich) continue;
    const d = pathDist(tor, bereich);
    sumColliMeter += d * r.colli;
    sumColli += r.colli;
    tage.add(r.scandatum);
  }
  return {
    mittel: sumColli > 0 ? sumColliMeter / sumColli : 0,
    arbeitstage: tage.size,
  };
}

/**
 * Heilt die Gang-Topologie für jeden Kunden — auch wenn der Layout-Loader
 * die Tor-Anbindungen vergessen hat oder V-Gänge nicht bis zu den H-Gängen
 * reichen. So funktioniert der Optimizer (und A* allgemein) für jedes
 * geladene Layout, nicht nur für die AS-Vorlage.
 */
function gangsMitTopologieHeilung(
  objects: TopisObject[],
  gaenge: Gang[],
  hallWidth: number,
  hallHeight: number,
): Gang[] {
  const tore = objects.filter((o) => o.type === 'tor');
  if (tore.length < 3) return gaenge; // zu wenig Tore für sinnvolle Anbindungs-Reihen
  const maxId = gaenge.reduce((m, g) => Math.max(m, (g as Gang).id ?? 0), 0);
  // Nur Anbindungs-Gänge hinzufügen, falls noch keine existieren (Name-Marker).
  const hasAnbindung = gaenge.some((g) => /Anbindung/i.test(g.name || ''));
  const baseMitAnbindung = hasAnbindung
    ? gaenge
    : [...gaenge, ...generateTorAnbindungsGaenge(tore, hallWidth, hallHeight, maxId + 1)];
  return connectGangsToBounds(baseMitAnbindung, 0, hallHeight, 0, hallWidth);
}

export function optimizeBereichPositions(inputs: OptInputs): OptimizerErgebnis {
  const { objects, records, relationZuordnungen, hallWidth, hallHeight } = inputs;
  const gaenge = gangsMitTopologieHeilung(objects, inputs.gaenge, hallWidth, hallHeight);
  const bereiche = objects.filter((o) => o.type === 'bereich');
  const tore = objects.filter((o) => o.type === 'tor');
  const torByMpCode = new Map<string, TopisObject>();
  for (const t of tore) {
    const code = (t.meta as { code?: string } | undefined)?.code;
    if (code) torByMpCode.set(code, t);
  }
  const torById = new Map<number, TopisObject>();
  for (const t of tore) torById.set(t.id, t);
  const relationToBereichId = new Map<string, number>();
  for (const rz of relationZuordnungen) {
    if (rz.objectId !== null) relationToBereichId.set(rz.relationKey, rz.objectId);
  }

  // Pro Bereich: Schwerpunkt der Tore-Versorgung (Colli-gewichtet).
  type Aggr = { sumX: number; sumY: number; sumColli: number; toreSet: Set<number> };
  const aggrByBereich = new Map<number, Aggr>();
  for (const r of records) {
    const tor = torByMpCode.get(r.stellplatz) ?? torById.get(r.messpunkt);
    if (!tor) continue;
    const bId = relationToBereichId.get(r.dispogebiet || r.ausgangsrelation);
    if (bId === undefined) continue;
    const a = aggrByBereich.get(bId) ?? { sumX: 0, sumY: 0, sumColli: 0, toreSet: new Set<number>() };
    const tc = center(tor);
    a.sumX += tc.x * r.colli;
    a.sumY += tc.y * r.colli;
    a.sumColli += r.colli;
    a.toreSet.add(tor.id);
    aggrByBereich.set(bId, a);
  }

  // Verteilweg vorher
  const vorher = gewichteterVerteilweg(objects, records, relationZuordnungen, gaenge);

  // Vorschläge erzeugen + Kollisionen schrittweise auflösen
  const vorschlaege: BereichVorschlag[] = [];
  const obstaclesSnap: TopisObject[] = objects
    .filter((o) => o.type === 'wand' || o.type === 'regal' || o.type === 'hindernis')
    .map((o) => ({ ...o }));
  // Bereiche selbst werden iterativ als Hindernisse mitgenommen (mit jeweils neuer Position).
  const bereicheSnap: TopisObject[] = bereiche.map((b) => ({ ...b }));

  // Sortierung: Bereich mit höchstem Colli-Aufkommen zuerst — der "verdient" die optimale Position.
  const reihenfolge = [...bereiche].sort((a, b) => {
    const ca = aggrByBereich.get(a.id)?.sumColli ?? 0;
    const cb = aggrByBereich.get(b.id)?.sumColli ?? 0;
    return cb - ca;
  });

  for (const b of reihenfolge) {
    const agg = aggrByBereich.get(b.id);
    if (!agg || agg.sumColli === 0) {
      vorschlaege.push({
        bereichId: b.id,
        bereichName: b.name || `Bereich ${b.id}`,
        altePosition: { x: b.x, y: b.y },
        neuePosition: { x: b.x, y: b.y },
        verschiebungM: 0,
        toreVersorgt: 0,
        colliProTag: 0,
      });
      continue;
    }
    const targetX = agg.sumX / agg.sumColli;
    const targetY = agg.sumY / agg.sumColli;
    const otherBereiche = bereicheSnap.filter((bb) => bb.id !== b.id);
    const obstacles = [...obstaclesSnap, ...otherBereiche];
    const neueXY = clampPosition(b, targetX, targetY, obstacles, hallWidth, hallHeight);
    const dx = neueXY.x - b.x;
    const dy = neueXY.y - b.y;
    vorschlaege.push({
      bereichId: b.id,
      bereichName: b.name || `Bereich ${b.id}`,
      altePosition: { x: b.x, y: b.y },
      neuePosition: neueXY,
      verschiebungM: Math.sqrt(dx * dx + dy * dy),
      toreVersorgt: agg.toreSet.size,
      colliProTag: vorher.arbeitstage > 0 ? agg.sumColli / vorher.arbeitstage : agg.sumColli,
    });
    // bereicheSnap aktualisieren, damit folgende Bereiche die neue Position als Hindernis sehen
    const idx = bereicheSnap.findIndex((bb) => bb.id === b.id);
    if (idx >= 0) bereicheSnap[idx] = { ...bereicheSnap[idx], x: neueXY.x, y: neueXY.y };
  }

  // Verteilweg nachher: berechne mit verschobenen Bereichen
  const objectsNachher = objects.map((o) => {
    if (o.type !== 'bereich') return o;
    const v = vorschlaege.find((vv) => vv.bereichId === o.id);
    return v ? { ...o, x: v.neuePosition.x, y: v.neuePosition.y } : o;
  });
  const nachher = gewichteterVerteilweg(objectsNachher, records, relationZuordnungen, gaenge);

  const ersparnis = vorher.mittel > 0 ? (1 - nachher.mittel / vorher.mittel) * 100 : 0;
  return {
    vorschlaege: vorschlaege.sort((a, b) => b.colliProTag - a.colliProTag),
    verteilwegVorherM: vorher.mittel,
    verteilwegNachherM: nachher.mittel,
    ersparnisProzent: ersparnis,
    arbeitstage: vorher.arbeitstage,
  };
}
