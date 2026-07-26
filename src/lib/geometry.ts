// Kleine, wiederverwendbare Geometrie-Helfer (kein Store-/Typen-Zwang).
// Wird vom KI-Generator (kollisionsfreie Platzierung + Kollisionsprüfung) genutzt.

export interface Rect { x: number; y: number; width: number; height: number }

/** AABB-Überlappung mit optionalem Sicherheits-/Toleranzabstand. */
export function rectsOverlap(a: Rect, b: Rect, margin = 0): boolean {
  return !(
    a.x + a.width + margin <= b.x ||
    b.x + b.width + margin <= a.x ||
    a.y + a.height + margin <= b.y ||
    b.y + b.height + margin <= a.y
  );
}

/** Liegt `r` (mit margin) frei, d.h. überlappt keines der Hindernisse? */
export function isFree(r: Rect, obstacles: Rect[], margin = 0): boolean {
  return !obstacles.some((o) => rectsOverlap(r, o, margin));
}

/**
 * Findet die erste kollisionsfreie Position für ein Rechteck der Größe w×h innerhalb
 * [0..hallWidth]×[0..hallHeight], die keine Hindernisse (mit margin) und keine der
 * gesperrten Zonen (z.B. Mittelgang) überlappt. Rasterabtastung (step). Null wenn kein Platz.
 */
export function findFreeSpot(
  w: number, h: number, hallWidth: number, hallHeight: number,
  obstacles: Rect[], opts: { margin?: number; step?: number; blocked?: Rect[]; preferX?: number; preferY?: number } = {},
): Rect | null {
  const margin = opts.margin ?? 0;
  const step = opts.step ?? 1;
  const blocked = opts.blocked ?? [];
  if (w > hallWidth || h > hallHeight) return null;
  const maxX = hallWidth - w;
  const maxY = hallHeight - h;
  // Kandidaten nach Nähe zur Wunschposition sortieren (falls angegeben).
  const px = opts.preferX ?? 0;
  const py = opts.preferY ?? 0;
  const candidates: Rect[] = [];
  for (let y = 0; y <= maxY + 1e-6; y += step) {
    for (let x = 0; x <= maxX + 1e-6; x += step) {
      candidates.push({ x: Math.min(x, maxX), y: Math.min(y, maxY), width: w, height: h });
    }
  }
  candidates.sort((a, b) => (Math.abs(a.x - px) + Math.abs(a.y - py)) - (Math.abs(b.x - px) + Math.abs(b.y - py)));
  for (const c of candidates) {
    if (isFree(c, obstacles, margin) && isFree(c, blocked, 0)) return c;
  }
  return null;
}

/** Alle überlappenden Paare aus einer Objektliste (mit margin=0 = echte Überlappung). */
export function findOverlaps<T extends Rect & { name?: string }>(items: T[], margin = 0): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (rectsOverlap(items[i], items[j], margin)) pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
}
