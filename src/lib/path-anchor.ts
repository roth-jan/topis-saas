import type { TopisObject } from '@/types/topis';

/**
 * Whitelist of object types that may act as path endpoint anchors.
 * Bug A (28.05.): Walls, doors, columns, obstacles must NOT be picked up
 * as path anchors. Only goods-handling targets count.
 */
export const VALID_ANCHOR_TYPES: ReadonlySet<string> = new Set([
  'tor',
  'bereich',
  'stellplatz',
  'sonderplatz',
]);

/**
 * Returns true if the object is eligible as a path endpoint anchor.
 * Whitelist + explicit "messpunkt" tag (TMS scan points count too).
 */
export function isValidAnchorObject(obj: TopisObject): boolean {
  // Lastenheft Wegpunkt-Property: explizit deaktiviert?
  if (obj.wegpunktRolle === 'keiner') return false;
  if (VALID_ANCHOR_TYPES.has(obj.type)) return true;
  if (obj.tags?.includes('messpunkt')) return true;
  return false;
}

/**
 * Prüft ob Element als Startpunkt eines Wegs zugelassen ist.
 * Lastenheft 3.1.4.2: Element muss als Startpunkt definiert sein, damit von
 * dort aus Wege gezeichnet werden können.
 */
export function isValidStartAnchor(obj: TopisObject): boolean {
  if (!isValidAnchorObject(obj)) return false;
  const rolle = obj.wegpunktRolle ?? 'beides';
  return rolle === 'beides' || rolle === 'start';
}

/**
 * Prüft ob Element als Endpunkt eines Wegs zugelassen ist.
 */
export function isValidEndAnchor(obj: TopisObject): boolean {
  if (!isValidAnchorObject(obj)) return false;
  const rolle = obj.wegpunktRolle ?? 'beides';
  return rolle === 'beides' || rolle === 'ende';
}

/**
 * Liefert das implizite Anker-Offset je Tor-Seite (Lastenheft 3.1.2):
 * Nord-Tor sitzt an der Nord-Außenwand → Stapler startet INNEN (y=1.0)
 * Süd-Tor → y=0.0; West-Tor → x=1.0; Ost-Tor → x=0.0
 * Für andere Objekte (Bereich/Stellplatz) bleibt Mitte (0.5/0.5).
 */
export function defaultAnchorOffset(obj: TopisObject): { x: number; y: number } {
  if (obj.type === 'tor' && obj.side) {
    switch (obj.side) {
      case 'north': return { x: 0.5, y: 1.0 };
      case 'south': return { x: 0.5, y: 0.0 };
      case 'west':  return { x: 1.0, y: 0.5 };
      case 'east':  return { x: 0.0, y: 0.5 };
    }
  }
  return { x: 0.5, y: 0.5 };
}

/**
 * Liefert die physische Anker-Position (Welt-Koordinaten) für einen Wegpunkt.
 * Explizit gesetzter wegpunktOffset hat Vorrang; sonst kommt der seitenabhängige
 * Default (Nord-Tor → Innenseite, etc.).
 */
export function anchorPoint(obj: TopisObject): { x: number; y: number } {
  const off = obj.wegpunktOffset ?? defaultAnchorOffset(obj);
  return {
    x: obj.x + obj.width * off.x,
    y: obj.y + obj.height * off.y,
  };
}

/**
 * Find the nearest valid anchor object to a world coordinate, within tolerance.
 * Used to bind path waypoints (start/end) to objects.
 */
export function findNearestAnchor(
  objects: TopisObject[],
  wx: number,
  wy: number,
  tolerance: number = 3,
  rolle: 'start' | 'ende' | 'beides' = 'beides',
): TopisObject | null {
  let nearest: TopisObject | null = null;
  let minDist = tolerance;

  for (const obj of objects) {
    if (rolle === 'start' ? !isValidStartAnchor(obj) :
        rolle === 'ende'  ? !isValidEndAnchor(obj)  :
                            !isValidAnchorObject(obj)) continue;

    // Wegpunkt-Anker statt geometrischer Mitte (Lastenheft 3.1.4.2)
    const anker = anchorPoint(obj);
    const dist = Math.sqrt((wx - anker.x) ** 2 + (wy - anker.y) ** 2);

    const insideOrNear =
      wx >= obj.x - tolerance && wx <= obj.x + obj.width + tolerance &&
      wy >= obj.y - tolerance && wy <= obj.y + obj.height + tolerance;

    if (insideOrNear && dist < minDist) {
      minDist = dist;
      nearest = obj;
    }
  }
  return nearest;
}
