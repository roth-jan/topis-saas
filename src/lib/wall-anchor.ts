/**
 * Lastenheft 3.1.2: „Tore werden auf den Außenwänden positioniert und sind FEST
 * mit der Außenwand VERANKERT. Bedeutet: Tore können ausschließlich auf
 * Außenwänden positioniert werden, nicht frei in der Zeichnungsfläche ohne
 * Kontakt zur Wand."
 *
 * Lastenheft 3.1.2: Position als „Abstand von Eckpunkten S und E der Wand".
 *
 * Diese Library übersetzt zwischen:
 *  - Welt-Koordinaten (x, y) — wie alle TopisObjects gespeichert werden
 *  - Wand-Anker (wallIndex, abstandS, abstandE) — Lastenheft-konforme Position
 *
 * Bei Wand-Move/Resize wandern alle daran verankerten Tore automatisch mit.
 */

import type { Wall, TopisObject, Hall } from '@/types/topis';

/**
 * Leitet die Außenwand-Segmente aus der Hallen-Geometrie ab (Lastenheft 3.1.1.1:
 * „Grundriss, Außenwände" — die Halle wird durch ihre Außenwände definiert).
 *
 * Objekte leben im hallen-lokalen Koordinatensystem (0,0)→(width,height) — das
 * deckt sich mit der Hit-Detection und worldToScreen(0,0) als Hallen-Ursprung.
 * `offsetX/offsetY` betreffen nur die Canvas-Platzierung, nicht die Objekt-Welt.
 *
 * Reihenfolge (= wallIndex-Semantik, identisch zu den Tests + reanchorTore):
 *   0 Nord, 1 Ost, 2 Süd, 3 West — im Uhrzeigersinn.
 *
 * Hinweis: aktuell wird im Store ausschließlich shape 'rect' verwendet. Für
 * L/T/U/C wird vorerst das umschließende Rechteck geliefert (TODO: echte Kontur),
 * was besser ist als die bisherige leere Wandliste (= kein Tor verankerbar).
 */
export function deriveWalls(hall: Pick<Hall, 'width' | 'height'>): Wall[] {
  const { width: W, height: H } = hall;
  if (!(W > 0) || !(H > 0)) return [];
  return [
    { x1: 0, y1: 0, x2: W, y2: 0 }, // 0: Nord
    { x1: W, y1: 0, x2: W, y2: H }, // 1: Ost
    { x1: W, y1: H, x2: 0, y2: H }, // 2: Süd
    { x1: 0, y1: H, x2: 0, y2: 0 }, // 3: West
  ];
}

export interface WallAnchor {
  wallIndex: number;
  abstandS: number; // Entfernung vom Eckpunkt S (Start) der Wand, in Metern
  abstandE: number; // Entfernung vom Eckpunkt E (End) der Wand, in Metern
}

export interface NearestWallResult extends WallAnchor {
  /** Senkrechte Distanz vom Klickpunkt zur Wand (m). */
  perpendicularDistance: number;
  /** Punkt auf der Wand, wo das Tor verankert wird (Tor-Mittelpunkt). */
  anchorPoint: { x: number; y: number };
  /** Wand-Seite — entspricht TopisObject.side. */
  side: 'north' | 'south' | 'east' | 'west' | null;
  /** Wand-Länge in Metern. */
  wallLength: number;
}

/** Senkrechter Lotfußpunkt von P auf Strecke [A,B]. Param t = 0..1. */
function projectOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { x: number; y: number; t: number; distance: number; length: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return { x: ax, y: ay, t: 0, distance: Math.hypot(px - ax, py - ay), length: 0 };
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (length * length)));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return { x, y, t, distance: Math.hypot(px - x, py - y), length };
}

/** Bestimmt die Seite einer Wand basierend auf ihrer Orientierung. */
function wallSide(wall: Wall): 'north' | 'south' | 'east' | 'west' | null {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const horizontal = Math.abs(dx) > Math.abs(dy);
  if (horizontal) {
    // y-Mittel: oberhalb der Hallenmitte = Nord, sonst Süd
    return (wall.y1 + wall.y2) / 2 < 0.5 ? 'north' : 'south';
  }
  return (wall.x1 + wall.x2) / 2 < 0.5 ? 'west' : 'east';
}

/** Findet die nächstgelegene Außenwand zu einem Klickpunkt.
 * Liefert wallIndex, S/E-Abstand und den Tor-Anker-Punkt. */
export function findNearestWall(
  px: number,
  py: number,
  walls: Wall[],
  maxDistance = 20,
): NearestWallResult | null {
  let best: NearestWallResult | null = null;
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const proj = projectOnSegment(px, py, w.x1, w.y1, w.x2, w.y2);
    if (proj.length === 0) continue;
    if (proj.distance > maxDistance) continue;
    if (best && proj.distance >= best.perpendicularDistance) continue;
    const abstandS = proj.t * proj.length;
    const abstandE = (1 - proj.t) * proj.length;
    best = {
      wallIndex: i,
      abstandS,
      abstandE,
      perpendicularDistance: proj.distance,
      anchorPoint: { x: proj.x, y: proj.y },
      side: wallSide(w),
      wallLength: proj.length,
    };
  }
  return best;
}

/** Aus einem Wand-Anker (wallIndex + abstandS) den Welt-Anker-Punkt herleiten,
 * unter Berücksichtigung der aktuellen Wand-Geometrie. */
export function anchorToWorldPoint(
  anchor: WallAnchor,
  walls: Wall[],
): { x: number; y: number; side: 'north' | 'south' | 'east' | 'west' | null; length: number } | null {
  const w = walls[anchor.wallIndex];
  if (!w) return null;
  const dx = w.x2 - w.x1;
  const dy = w.y2 - w.y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) return null;
  const t = Math.max(0, Math.min(1, anchor.abstandS / length));
  return {
    x: w.x1 + t * dx,
    y: w.y1 + t * dy,
    side: wallSide(w),
    length,
  };
}

/** Berechnet aus Tor-Anker-Punkt + Wand-Seite die Tor-Box-Position (x,y).
 * Ein Tor sitzt mit seiner Innenkante auf der Wand. */
export function torBoxFromAnchor(
  anchor: WallAnchor,
  walls: Wall[],
  width: number,
  height: number,
): { x: number; y: number; side: 'north' | 'south' | 'east' | 'west' | null } | null {
  const wp = anchorToWorldPoint(anchor, walls);
  if (!wp) return null;
  const { x: ax, y: ay, side } = wp;
  // Tor-Mittelpunkt = anchorPoint; Box = ax - width/2, ay je nach Seite
  let x = ax - width / 2;
  let y = ay - height / 2;
  // Innenkante an Wand: Box-Verschiebung so dass Tor-Außenseite auf der Wand sitzt
  if (side === 'north') y = ay; // Wand ist y=0-Linie, Tor geht nach innen
  else if (side === 'south') y = ay - height;
  else if (side === 'west') x = ax;
  else if (side === 'east') x = ax - width;
  return { x, y, side };
}

/** Berechnet aus Rampen-Anker + Wand-Seite die Rampen-Box-Position (x,y).
 * Lastenheft 3.1.2.2: Nahverkehrsrampen liegen AUSSEN am Hallengrundriss, direkt
 * an die Außenwand angedockt — also spiegelverkehrt zum Tor (Tor ragt nach innen,
 * Rampe nach außen). Die Wand-Kante ist die INNENkante der Rampe. */
export function rampeBoxFromAnchor(
  anchor: WallAnchor,
  walls: Wall[],
  width: number,
  height: number,
): { x: number; y: number; side: 'north' | 'south' | 'east' | 'west' | null } | null {
  const wp = anchorToWorldPoint(anchor, walls);
  if (!wp) return null;
  const { x: ax, y: ay, side } = wp;
  let x = ax - width / 2;
  let y = ay - height / 2;
  // Nach AUSSEN versetzt (Gegenteil der Tor-Verankerung):
  if (side === 'north') y = ay - height;      // Nordwand y=0 → Rampe oberhalb
  else if (side === 'south') y = ay;          // Südwand y=H → Rampe unterhalb
  else if (side === 'west') x = ax - width;   // Westwand x=0 → Rampe links
  else if (side === 'east') x = ax;           // Ostwand x=W → Rampe rechts
  return { x, y, side };
}

/** Validiert: Ist das Tor wirklich an einer Außenwand?
 * Wird beim Insert + Move geprüft. */
export function isValidTorPosition(tor: TopisObject, walls: Wall[]): boolean {
  if (tor.type !== 'tor') return true;
  if (!tor.aussenwandRef) return false; // Lastenheft 3.1.2 — Pflicht
  const wp = anchorToWorldPoint(tor.aussenwandRef, walls);
  return wp !== null;
}

/** Zieht alle verankerten Tore mit, wenn sich Wand-Geometrie ändert.
 * Behält die ursprüngliche side am Tor — die ist beim Insert gesetzt worden,
 * basierend auf dem aktuellen Hall-Kontext. */
export function reanchorTore(
  tore: TopisObject[],
  walls: Wall[],
): TopisObject[] {
  return tore.map((obj) => {
    // Tore ragen nach innen, Rampen nach außen (Lastenheft 3.1.2 / 3.1.2.2) —
    // beide folgen ihrer verankerten Wand bei Geometrie-Änderungen.
    const isTor = obj.type === 'tor';
    const isRampe = obj.type === 'rampe';
    if ((!isTor && !isRampe) || !obj.aussenwandRef) return obj;
    const wp = anchorToWorldPoint(obj.aussenwandRef, walls);
    if (!wp) return obj;
    const side = obj.side ?? wp.side; // ursprüngliche side beibehalten
    let x = wp.x - obj.width / 2;
    let y = wp.y - obj.height / 2;
    if (isRampe) {
      // nach außen
      if (side === 'north') y = wp.y - obj.height;
      else if (side === 'south') y = wp.y;
      else if (side === 'west') x = wp.x - obj.width;
      else if (side === 'east') x = wp.x;
    } else {
      // Tor: nach innen (unverändert)
      if (side === 'north') y = wp.y;
      else if (side === 'south') y = wp.y - obj.height;
      else if (side === 'west') x = wp.x;
      else if (side === 'east') x = wp.x - obj.width;
    }
    return { ...obj, x, y, side: side ?? obj.side };
  });
}
