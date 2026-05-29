import { describe, expect, it } from 'vitest';
import { generateWegflaecheNegativ } from './wegflaeche-negativ';
import type { TopisObject } from '@/types/topis';

function obj(p: Partial<TopisObject>): TopisObject {
  return { id: 1, name: '', type: 'bereich', x: 0, y: 0, width: 1, height: 1, ...p } as TopisObject;
}

describe('Negativ-Modus Wegfläche', () => {
  it('leere Halle → eine pathArea = Hallenfläche', () => {
    const r = generateWegflaecheNegativ(20, 10, []);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ x: 0, y: 0, width: 20, height: 10 });
  });

  it('ein Bereich in der Mitte → 4 Wegflächen drum herum', () => {
    const bereich = obj({ type: 'bereich', x: 8, y: 4, width: 4, height: 2, name: 'Lager' });
    const r = generateWegflaecheNegativ(20, 10, [bereich]);
    // erwartet: oben (Streifen y=0..4), unten (y=6..10), links (x=0..8, y=4..6), rechts (x=12..20, y=4..6)
    expect(r.length).toBeGreaterThanOrEqual(4);
    // keine Wegfläche darf den Bereich überlappen
    for (const w of r) {
      const overlap = !(w.x! + w.width! <= bereich.x || bereich.x + bereich.width <= w.x!
                     || w.y! + w.height! <= bereich.y || bereich.y + bereich.height <= w.y!);
      expect(overlap).toBe(false);
    }
  });

  it('mehrere Hindernisse hintereinander subtrahieren sich korrekt', () => {
    const a = obj({ id: 1, type: 'bereich', x: 5, y: 0, width: 5, height: 10 });
    const b = obj({ id: 2, type: 'wand', x: 0, y: 5, width: 5, height: 1 });
    const r = generateWegflaecheNegativ(20, 10, [a, b]);
    for (const w of r) {
      for (const blocker of [a, b]) {
        const overlap = !(w.x! + w.width! <= blocker.x || blocker.x + blocker.width <= w.x!
                       || w.y! + w.height! <= blocker.y || blocker.y + blocker.height <= w.y!);
        expect(overlap).toBe(false);
      }
    }
  });
});
