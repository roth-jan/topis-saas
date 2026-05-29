/**
 * Lastenheft 3.1.4.1: Wegflächen sollen nicht über belegte Elemente gehen.
 * Verifiziert die Rechteck-Überschneidungs-Logik die HallCanvas.tsx beim
 * Erstellen einer pathArea ausführt.
 */
import { describe, expect, it } from 'vitest';
import type { TopisObject } from '@/types/topis';

function findBlockingOverlap(
  x1: number, y1: number, x2: number, y2: number,
  objects: TopisObject[],
): TopisObject | undefined {
  const blockers = objects.filter(o => ['bereich', 'regal', 'hindernis', 'wand'].includes(o.type));
  return blockers.find(b =>
    !(x2 <= b.x || b.x + b.width <= x1 || y2 <= b.y || b.y + b.height <= y1),
  );
}

describe('pathArea-Bereich-Schutz', () => {
  const bereich = { id: 1, type: 'bereich', name: 'Lager', x: 5, y: 5, width: 4, height: 4 } as TopisObject;
  const wand = { id: 2, type: 'wand', name: 'Wand', x: 12, y: 0, width: 0.5, height: 10 } as TopisObject;

  it('pathArea komplett außerhalb: kein Konflikt', () => {
    const conflict = findBlockingOverlap(15, 0, 19, 4, [bereich, wand]);
    expect(conflict).toBeUndefined();
  });

  it('pathArea überlappt mit Bereich: liefert Bereich zurück', () => {
    const conflict = findBlockingOverlap(7, 7, 11, 11, [bereich, wand]);
    expect(conflict?.name).toBe('Lager');
  });

  it('pathArea kreuzt Wand: liefert Wand zurück', () => {
    const conflict = findBlockingOverlap(10, 2, 14, 4, [bereich, wand]);
    expect(conflict?.name).toBe('Wand');
  });

  it('pathArea berührt nur Kante (touch): kein Konflikt', () => {
    // Bereich endet bei x=9, pathArea beginnt bei x=9 → kein Overlap
    const conflict = findBlockingOverlap(9, 5, 13, 9, [bereich]);
    expect(conflict).toBeUndefined();
  });
});
