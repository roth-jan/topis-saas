/**
 * Generalisierte Snap-Engine für alle Canvas-Zeichen-Werkzeuge.
 * Baut auf gang-snap.ts auf und ergänzt:
 *   - pathArea-Ecken
 *   - Path-Waypoints
 *   - Tor/Bereich/Stellplatz-Anker (wegpunktOffset-aware)
 *   - Hallen-Außenkontur-Ecken
 *
 * Pro Werkzeug kann konfiguriert werden, welche Quellen erlaubt sind.
 */
import type { Gang, PathArea, Path, TopisObject, Hall } from '@/types/topis';
import { findGangSnap, type SnapType as GangSnapType } from './gang-snap';
import { anchorPoint, isValidAnchorObject } from './path-anchor';

export type SnapSource =
  | 'gang-endpoint'
  | 'gang-intersection'
  | 'gang-perpendicular'
  | 'patharea-corner'
  | 'path-waypoint'
  | 'object-anchor'
  | 'hall-corner';

export interface SnapHit {
  x: number;
  y: number;
  source: SnapSource;
  // freier Label-Text für die UI-Anzeige
  label: string;
  // Distanz zur Maus
  dist: number;
}

export interface SnapInput {
  wx: number;
  wy: number;
  tolerance?: number;
  gaenge?: Gang[];
  pathAreas?: PathArea[];
  paths?: Path[];
  objects?: TopisObject[];
  hall?: Pick<Hall, 'width' | 'height'>;
  /** welche Quellen erlaubt sind. Wenn leer → alle */
  sources?: SnapSource[];
}

const SOURCE_LABEL: Record<SnapSource, string> = {
  'gang-endpoint': 'GANG-ENDE',
  'gang-intersection': 'GANG-KREUZUNG',
  'gang-perpendicular': 'GANG-SENKRECHT',
  'patharea-corner': 'WEGFLÄCHE-ECKE',
  'path-waypoint': 'WAYPOINT',
  'object-anchor': 'ANKER',
  'hall-corner': 'HALLE-ECKE',
};

const MAGNET_BONUS: Record<SnapSource, number> = {
  'gang-endpoint': 1.2,
  'gang-intersection': 0.9,
  'object-anchor': 0.8,
  'patharea-corner': 0.6,
  'path-waypoint': 0.5,
  'hall-corner': 0.4,
  'gang-perpendicular': 0,
};

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

const gangToSource: Record<GangSnapType, SnapSource> = {
  endpoint: 'gang-endpoint',
  intersection: 'gang-intersection',
  perpendicular: 'gang-perpendicular',
};

export function findSnap(input: SnapInput): SnapHit | null {
  const { wx, wy, tolerance = 2, gaenge = [], pathAreas = [], paths = [], objects = [], hall, sources } = input;
  const allowed = sources && sources.length > 0 ? new Set(sources) : null;
  const ok = (s: SnapSource) => !allowed || allowed.has(s);

  let best: SnapHit | null = null;
  const better = (cand: SnapHit) => {
    if (!best) return true;
    return cand.dist - MAGNET_BONUS[cand.source] < best.dist - MAGNET_BONUS[best.source];
  };

  // 1. Gang-Snaps (delegiert an gang-snap.ts wenn erlaubt)
  if ((ok('gang-endpoint') || ok('gang-intersection') || ok('gang-perpendicular')) && gaenge.length > 0) {
    const gSnap = findGangSnap(wx, wy, gaenge, tolerance);
    if (gSnap.snapped) {
      const src = gangToSource[gSnap.type];
      if (ok(src)) {
        const cand: SnapHit = { x: gSnap.x, y: gSnap.y, source: src, label: SOURCE_LABEL[src], dist: gSnap.dist };
        if (better(cand)) best = cand;
      }
    }
  }

  // 2. PathArea-Ecken
  if (ok('patharea-corner') && pathAreas.length > 0) {
    for (const pa of pathAreas) {
      if (pa.x == null || pa.y == null || pa.width == null || pa.height == null) continue;
      const corners = [
        { x: pa.x, y: pa.y },
        { x: pa.x + pa.width, y: pa.y },
        { x: pa.x, y: pa.y + pa.height },
        { x: pa.x + pa.width, y: pa.y + pa.height },
      ];
      for (const c of corners) {
        const d = dist(wx, wy, c.x, c.y);
        if (d <= tolerance) {
          const cand: SnapHit = { x: c.x, y: c.y, source: 'patharea-corner', label: SOURCE_LABEL['patharea-corner'], dist: d };
          if (better(cand)) best = cand;
        }
      }
    }
  }

  // 3. Path-Waypoints
  if (ok('path-waypoint') && paths.length > 0) {
    for (const p of paths) {
      for (const wp of p.waypoints) {
        const d = dist(wx, wy, wp.x, wp.y);
        if (d <= tolerance) {
          const cand: SnapHit = { x: wp.x, y: wp.y, source: 'path-waypoint', label: SOURCE_LABEL['path-waypoint'], dist: d };
          if (better(cand)) best = cand;
        }
      }
    }
  }

  // 4. Object-Anker (Tor/Bereich/Stellplatz mit Wegpunkt-Offset)
  if (ok('object-anchor') && objects.length > 0) {
    for (const o of objects) {
      if (!isValidAnchorObject(o)) continue;
      const a = anchorPoint(o);
      const d = dist(wx, wy, a.x, a.y);
      if (d <= tolerance) {
        const cand: SnapHit = { x: a.x, y: a.y, source: 'object-anchor', label: `${SOURCE_LABEL['object-anchor']} (${o.name})`, dist: d };
        if (better(cand)) best = cand;
      }
    }
  }

  // 5. Hallen-Außenkontur-Ecken
  if (ok('hall-corner') && hall) {
    const corners = [
      { x: 0, y: 0 },
      { x: hall.width, y: 0 },
      { x: 0, y: hall.height },
      { x: hall.width, y: hall.height },
    ];
    for (const c of corners) {
      const d = dist(wx, wy, c.x, c.y);
      if (d <= tolerance) {
        const cand: SnapHit = { x: c.x, y: c.y, source: 'hall-corner', label: SOURCE_LABEL['hall-corner'], dist: d };
        if (better(cand)) best = cand;
      }
    }
  }

  return best;
}

export const SNAP_COLORS: Record<SnapSource, string> = {
  'gang-endpoint': '#22c55e',
  'gang-intersection': '#fbbf24',
  'gang-perpendicular': '#06b6d4',
  'patharea-corner': '#a855f7',
  'path-waypoint': '#f59e0b',
  'object-anchor': '#ec4899',
  'hall-corner': '#94a3b8',
};
