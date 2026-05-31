import type { Gang } from '@/types/topis';

/**
 * Verbindet Insel-Cluster im Gang-Netz mit den jeweils kürzesten Connector-
 * Gängen, sodass A* zwischen allen Gängen routen kann.
 *
 * Strategie:
 * 1. Connected-Components bilden (Endpunkt-Distanz < tol oder Gang-Schnittpunkt
 *    zählt als "verbunden")
 * 2. Solange > 1 Component: zwei nächste Components per kürzester Endpunkt-
 *    Distanz finden und mit Connector-Gang verbinden
 * 3. Wiederholen bis alle verbunden
 *
 * Connector-Gänge tragen `autoFromPathAreaId` NICHT (sie hängen nicht an einer
 * konkreten pathArea) und bekommen den Namen "Auto: Verbinder N".
 */

export interface ConnectorOptions {
  /** Maximaler Connector-Abstand. Längere Verbindungen werden NICHT gezogen
   * (Insel bleibt isoliert). Default 30 m. */
  maxConnectorDistance?: number;
  /** Endpunkt-Nähe ab der zwei Gänge als verbunden gelten. Default 0.5 m. */
  proximityTolerance?: number;
  /** Breite der Connector-Gänge. Default 3 m (Standard-Stapler-Mindestbreite). */
  connectorBreite?: number;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function segmentsIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): boolean {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-9) return false;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/** Liefert die Connected-Components von Gängen als Array von Gang-ID-Sets. */
export function findGangClusters(gaenge: Gang[], tol: number = 0.5): Set<number>[] {
  const parent: Record<number, number> = {};
  const find = (a: number): number => parent[a] === a ? a : (parent[a] = find(parent[a]));
  const union = (a: number, b: number) => { parent[find(a)] = find(b); };
  for (const g of gaenge) parent[g.id] = g.id;

  // Endpunkt-Nähe ODER Schnittpunkt-Test
  for (let i = 0; i < gaenge.length; i++) {
    for (let j = i + 1; j < gaenge.length; j++) {
      const gi = gaenge[i]; const gj = gaenge[j];
      let connected = false;
      // Endpunkt-Nähe
      outer: for (const p of gi.points) {
        for (const q of gj.points) {
          if (dist(p.x, p.y, q.x, q.y) <= tol) { connected = true; break outer; }
        }
      }
      // Schnittpunkt
      if (!connected) {
        for (let si = 0; si + 1 < gi.points.length && !connected; si++) {
          for (let sj = 0; sj + 1 < gj.points.length && !connected; sj++) {
            const a = gi.points[si]; const b = gi.points[si + 1];
            const c = gj.points[sj]; const d = gj.points[sj + 1];
            if (segmentsIntersect(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y)) connected = true;
          }
        }
      }
      if (connected) union(gi.id, gj.id);
    }
  }

  const groups = new Map<number, Set<number>>();
  for (const g of gaenge) {
    const root = find(g.id);
    if (!groups.has(root)) groups.set(root, new Set());
    groups.get(root)!.add(g.id);
  }
  return Array.from(groups.values());
}

/**
 * Generiert Connector-Gänge bis das Netz zusammenhängend ist.
 * Liefert nur die NEUEN Connector-Gänge zurück (ohne IDs).
 */
export function generateConnectors(
  gaenge: Gang[],
  opts: ConnectorOptions = {},
): Omit<Gang, 'id'>[] {
  const maxDist = opts.maxConnectorDistance ?? 30;
  const tol = opts.proximityTolerance ?? 0.5;
  const breite = opts.connectorBreite ?? 3;

  if (gaenge.length < 2) return [];

  const connectors: Omit<Gang, 'id'>[] = [];
  let working = gaenge.slice();
  let counter = 1;

  // Bis zu N Iterationen — bei jedem Schritt wird mindestens eine Insel
  // angeschlossen. Safety: max 20 Connectors.
  for (let iter = 0; iter < 20; iter++) {
    const clusters = findGangClusters(working, tol);
    if (clusters.length <= 1) break;

    // Bestes Cluster-Paar: minimale Endpunkt-Distanz zwischen beiden Clustern
    let best: { from: { x: number; y: number }; to: { x: number; y: number }; d: number } | null = null;
    for (let ca = 0; ca < clusters.length; ca++) {
      for (let cb = ca + 1; cb < clusters.length; cb++) {
        const A = clusters[ca]; const B = clusters[cb];
        for (const ga of working.filter(g => A.has(g.id))) {
          for (const pa of ga.points) {
            for (const gb of working.filter(g => B.has(g.id))) {
              for (const pb of gb.points) {
                const d = dist(pa.x, pa.y, pb.x, pb.y);
                if (d > maxDist) continue;
                if (!best || d < best.d) best = { from: pa, to: pb, d };
              }
            }
          }
        }
      }
    }
    if (!best) break; // alle übrigen Cluster-Paare > maxDist → können nicht verbunden werden

    const connector: Omit<Gang, 'id'> = {
      name: `Auto: Verbinder ${counter++}`,
      points: [{ x: best.from.x, y: best.from.y }, { x: best.to.x, y: best.to.y }],
      breite,
      typ: 'quergang',
      farbe: 'rgba(251, 191, 36, 0.4)',
    };
    connectors.push(connector);
    // synthetische ID für nächste Cluster-Iteration
    working = [...working, { ...connector, id: -counter } as Gang];
  }

  return connectors;
}
