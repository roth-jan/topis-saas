import type { TopisObject, PathArea } from '@/types/topis';

/**
 * Lastenheft 3.1.4.1 Variante 1 (Negativ-Modus):
 * „Der Nutzer wählt Flächen, die nicht als Weg dienen sollen, durch
 * rechteckiges Mouseover ab."
 *
 * Wir starten mit der gesamten Hallenfläche als eine Wegfläche und ziehen
 * dann die Bounding-Rechtecke aller belegenden Elemente ab (Bereich, Regal,
 * Hindernis, Wand). Resultat ist eine Liste von Rechtecken die das verbleibende
 * Wege-Polygon abdecken.
 *
 * Vorgehen: Rechtecks-Differenz per Sweep. Für jedes Hindernis splitten wir
 * die aktuelle Liste von freien Rechtecken so, dass das Hindernis ausgespart
 * bleibt. Einfacher als Polygon-Boolean weil pathAreas selbst nur Rechtecke
 * sein dürfen.
 */
export function generateWegflaecheNegativ(
  hallWidth: number,
  hallHeight: number,
  objects: TopisObject[],
  randAbstand: number = 0,
): Omit<PathArea, 'id'>[] {
  type Rect = { x: number; y: number; w: number; h: number };

  const blockerTypes = new Set(['bereich', 'regal', 'hindernis', 'wand']);
  const blockers: Rect[] = objects
    .filter(o => blockerTypes.has(o.type))
    .map(o => ({ x: o.x, y: o.y, w: o.width, h: o.height }));

  // Halle minus Randabstand
  const start: Rect = {
    x: randAbstand,
    y: randAbstand,
    w: hallWidth - 2 * randAbstand,
    h: hallHeight - 2 * randAbstand,
  };

  function subtract(r: Rect, b: Rect): Rect[] {
    const ix = Math.max(r.x, b.x);
    const iy = Math.max(r.y, b.y);
    const iw = Math.min(r.x + r.w, b.x + b.w) - ix;
    const ih = Math.min(r.y + r.h, b.y + b.h) - iy;
    if (iw <= 0 || ih <= 0) return [r]; // kein Überlapp
    const out: Rect[] = [];
    // oben
    if (iy > r.y) out.push({ x: r.x, y: r.y, w: r.w, h: iy - r.y });
    // unten
    if (iy + ih < r.y + r.h) out.push({ x: r.x, y: iy + ih, w: r.w, h: r.y + r.h - (iy + ih) });
    // links
    if (ix > r.x) out.push({ x: r.x, y: iy, w: ix - r.x, h: ih });
    // rechts
    if (ix + iw < r.x + r.w) out.push({ x: ix + iw, y: iy, w: r.x + r.w - (ix + iw), h: ih });
    return out.filter(rc => rc.w > 0.1 && rc.h > 0.1);
  }

  let free: Rect[] = [start];
  for (const b of blockers) {
    const next: Rect[] = [];
    for (const r of free) next.push(...subtract(r, b));
    free = next;
  }

  return free.map((r, i) => ({
    name: `Wegfläche ${i + 1} (Negativ-Modus)`,
    x: r.x,
    y: r.y,
    width: r.w,
    height: r.h,
    color: '#22c55e40',
  }));
}
