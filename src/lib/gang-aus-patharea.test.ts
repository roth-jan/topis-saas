import { describe, expect, it } from 'vitest';
import { generateGaengeFromPathAreas } from './gang-aus-patharea';
import type { PathArea } from '@/types/topis';

const pa = (id: number, x: number, y: number, w: number, h: number): PathArea =>
  ({ id, name: `PA${id}`, x, y, width: w, height: h, color: '#000' } as PathArea);

describe('generateGaengeFromPathAreas', () => {
  it('breite Wegfläche → horizontaler Gang in der Mitte', () => {
    const r = generateGaengeFromPathAreas([pa(1, 0, 8, 40, 4)]);
    expect(r).toHaveLength(1);
    expect(r[0].points[0]).toEqual({ x: 0, y: 10 });
    expect(r[0].points[1]).toEqual({ x: 40, y: 10 });
    expect(r[0].breite).toBe(4);
  });

  it('hohe Wegfläche → vertikaler Gang', () => {
    const r = generateGaengeFromPathAreas([pa(1, 2, 0, 4, 20)]);
    expect(r).toHaveLength(1);
    expect(r[0].points[0]).toEqual({ x: 4, y: 0 });
    expect(r[0].points[1]).toEqual({ x: 4, y: 20 });
    expect(r[0].breite).toBe(4);
  });

  it('quadratische Wegfläche → Kreuz (2 Gänge)', () => {
    const r = generateGaengeFromPathAreas([pa(1, 0, 0, 6, 6)]);
    expect(r).toHaveLength(2);
    // horizontal
    expect(r[0].points[0]).toEqual({ x: 0, y: 3 });
    expect(r[0].points[1]).toEqual({ x: 6, y: 3 });
    // vertical
    expect(r[1].points[0]).toEqual({ x: 3, y: 0 });
    expect(r[1].points[1]).toEqual({ x: 3, y: 6 });
  });

  it('mehrere pathAreas → mehrere Gänge', () => {
    const r = generateGaengeFromPathAreas([
      pa(1, 0, 0, 40, 4),
      pa(2, 0, 10, 40, 4),
      pa(3, 18, 0, 4, 20),
    ]);
    expect(r).toHaveLength(3);
  });

  it('winzige Wegfläche < 0.5 m wird ignoriert', () => {
    const r = generateGaengeFromPathAreas([pa(1, 0, 0, 0.3, 0.3)]);
    expect(r).toHaveLength(0);
  });
});
