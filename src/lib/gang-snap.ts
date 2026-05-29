import type { Gang } from '@/types/topis';

/**
 * Snap-Engine fürs Gang-Werkzeug. Findet zu einer Maus-Welt-Position
 * den nächsten „guten" Anker auf bestehenden Gängen.
 *
 * Snap-Typen, sortiert nach Priorität (höher = wichtiger):
 * - `endpoint`   : exakt auf einem Gang-Endpunkt
 * - `intersection`: auf einem Schnittpunkt zweier Gänge (wenn der Cursor
 *                   in der Nähe einer Linie ist UND ein anderer Gang dort
 *                   ebenfalls verläuft)
 * - `perpendicular`: senkrechte Projektion auf die nächste Gang-Linie
 *
 * Toleranz default 2 m — entspricht etwa der typischen Stapler-Wenderadius-
 * Genauigkeit beim Layout-Zeichnen.
 */

export type SnapType = 'endpoint' | 'intersection' | 'perpendicular';

export interface SnapTarget {
  x: number;
  y: number;
  type: SnapType;
  gangId: number;
  // Distanz Mausposition → Snap-Punkt
  dist: number;
}

interface NoSnap { snapped: false }
interface Snapped extends SnapTarget { snapped: true }
export type SnapResult = NoSnap | Snapped;

const EPS = 1e-6;

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/** Projiziert (wx,wy) senkrecht aufs Segment a→b. Liefert {x,y,t,dist} oder null. */
function projectOntoSegment(
  wx: number, wy: number,
  ax: number, ay: number, bx: number, by: number,
): { x: number; y: number; t: number; dist: number } | null {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < EPS) return null;
  const t = ((wx - ax) * dx + (wy - ay) * dy) / len2;
  const tClamped = Math.max(0, Math.min(1, t));
  const px = ax + tClamped * dx;
  const py = ay + tClamped * dy;
  return { x: px, y: py, t: tClamped, dist: distance(wx, wy, px, py) };
}

/** Schnittpunkt zwischen zwei Segmenten oder null. */
function segmentIntersection(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): { x: number; y: number } | null {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < EPS) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

/**
 * Findet das beste Snap-Ziel für (wx, wy). Liefert das nächstgelegene Ziel
 * innerhalb `tolerance`. Wenn mehrere Typen gleich nah sind, gilt die
 * Priorität endpoint > intersection > perpendicular.
 */
export function findGangSnap(
  wx: number, wy: number,
  gaenge: Gang[],
  tolerance: number = 2,
): SnapResult {
  let best: SnapTarget | null = null;

  // Magnet-Bonus pro Typ: endpoint hat starken Bonus, intersection mittel,
  // perpendicular keinen. So gewinnen semantisch wichtige Anker bei
  // ähnlicher Distanz.
  const magnetBonus: Record<SnapType, number> = { endpoint: 1.2, intersection: 0.8, perpendicular: 0 };
  const better = (cand: SnapTarget) => {
    if (!best) return true;
    return cand.dist - magnetBonus[cand.type] < best.dist - magnetBonus[best.type];
  };

  // Endpunkte
  for (const g of gaenge) {
    for (const p of g.points) {
      const d = distance(wx, wy, p.x, p.y);
      if (d <= tolerance) {
        const cand: SnapTarget = { x: p.x, y: p.y, type: 'endpoint', gangId: g.id, dist: d };
        if (better(cand)) best = cand;
      }
    }
  }

  // Schnittpunkte zwischen Gang-Paaren (begrenzt sinnvoll: nur wenn Cursor in Nähe)
  for (let i = 0; i < gaenge.length; i++) {
    const gi = gaenge[i];
    for (let si = 0; si + 1 < gi.points.length; si++) {
      const a = gi.points[si];
      const b = gi.points[si + 1];
      // schnelle Vorab-Distanzprüfung
      const proj = projectOntoSegment(wx, wy, a.x, a.y, b.x, b.y);
      if (!proj || proj.dist > tolerance * 2) continue;
      for (let j = i + 1; j < gaenge.length; j++) {
        const gj = gaenge[j];
        for (let sj = 0; sj + 1 < gj.points.length; sj++) {
          const c = gj.points[sj];
          const d = gj.points[sj + 1];
          const x = segmentIntersection(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
          if (!x) continue;
          const dd = distance(wx, wy, x.x, x.y);
          if (dd <= tolerance) {
            const cand: SnapTarget = { x: x.x, y: x.y, type: 'intersection', gangId: gi.id, dist: dd };
            if (better(cand)) best = cand;
          }
        }
      }
    }
  }

  // Senkrechte Projektion
  for (const g of gaenge) {
    for (let si = 0; si + 1 < g.points.length; si++) {
      const a = g.points[si];
      const b = g.points[si + 1];
      const proj = projectOntoSegment(wx, wy, a.x, a.y, b.x, b.y);
      if (!proj || proj.dist > tolerance) continue;
      const cand: SnapTarget = { x: proj.x, y: proj.y, type: 'perpendicular', gangId: g.id, dist: proj.dist };
      if (better(cand)) best = cand;
    }
  }

  if (!best) return { snapped: false };
  return { ...best, snapped: true };
}

/**
 * Hilft beim Speichern: Wenn ein Gang-Endpunkt nahe an einem anderen Gang
 * liegt, aber nicht exakt darauf, wird er auf die Linie verlängert.
 * Liefert evtl. den korrigierten Endpunkt + flag.
 */
export function extendEndpointToNearbyGang(
  endpoint: { x: number; y: number },
  otherGaenge: Gang[],
  tolerance: number = 2,
): { x: number; y: number; extended: boolean; ankerType?: SnapType; gangId?: number } {
  const snap = findGangSnap(endpoint.x, endpoint.y, otherGaenge, tolerance);
  if (!snap.snapped) return { ...endpoint, extended: false };
  const moved = distance(endpoint.x, endpoint.y, snap.x, snap.y);
  if (moved < 0.01) return { ...endpoint, extended: false };
  return { x: snap.x, y: snap.y, extended: true, ankerType: snap.type, gangId: snap.gangId };
}

/**
 * Prüft ob ein Gang im Layout mindestens eine Verbindung zu einem anderen
 * Gang hat (Endpunkt-, Schnitt- oder Perpendicular-Anker auf einem anderen
 * Gang). Wird beim Save aufgerufen, um „Insel-Gänge" als Warnung zu melden.
 */
export function isGangIsolated(
  gang: Gang,
  otherGaenge: Gang[],
  tolerance: number = 0.5,
): boolean {
  if (otherGaenge.length === 0) return true;
  for (const p of gang.points) {
    const s = findGangSnap(p.x, p.y, otherGaenge, tolerance);
    if (s.snapped) return false;
  }
  // Zusätzlich: kreuzt der Gang einen anderen mitten durch?
  for (let i = 0; i + 1 < gang.points.length; i++) {
    const a = gang.points[i];
    const b = gang.points[i + 1];
    for (const o of otherGaenge) {
      for (let j = 0; j + 1 < o.points.length; j++) {
        const c = o.points[j];
        const d = o.points[j + 1];
        if (segmentIntersection(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y)) return false;
      }
    }
  }
  return true;
}
