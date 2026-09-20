import { describe, it, expect } from 'vitest';
import { hallOutline } from './hall-shape';

describe('hallOutline — Grundriss-Umrisse (Lastenheft 3.1.1.1)', () => {
  it('Rechteck: 4 Eckpunkte der Bounding-Box', () => {
    const p = hallOutline({ shape: 'rect', width: 100, height: 50 });
    expect(p).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 50 },
    ]);
  });

  it('leere Halle (0-Maß) → leeres Polygon', () => {
    expect(hallOutline({ shape: 'rect', width: 0, height: 50 })).toEqual([]);
    expect(hallOutline({ shape: 'L', width: 100, height: 0 })).toEqual([]);
  });

  it('L-Form: 6 Punkte, Aussparung oben rechts, bleibt in Bounding-Box', () => {
    const p = hallOutline({ shape: 'L', width: 100, height: 50 });
    expect(p).toHaveLength(6);
    // alle Punkte innerhalb [0..W]x[0..H]
    for (const pt of p) {
      expect(pt.x).toBeGreaterThanOrEqual(0);
      expect(pt.x).toBeLessThanOrEqual(100);
      expect(pt.y).toBeGreaterThanOrEqual(0);
      expect(pt.y).toBeLessThanOrEqual(50);
    }
    // linke untere Ecke vorhanden (voller Fuß)
    expect(p).toContainEqual({ x: 0, y: 50 });
    expect(p).toContainEqual({ x: 100, y: 50 });
  });

  it('T-Form: 8 Punkte, symmetrischer Steg um die Mitte', () => {
    const p = hallOutline({ shape: 'T', width: 100, height: 50 });
    expect(p).toHaveLength(8);
    const xs = p.map((q) => q.x).sort((a, b) => a - b);
    // Steg symmetrisch: kleinste/größte Stegkante spiegeln um 50
    const left = Math.min(...p.filter((q) => q.y === 50).map((q) => q.x));
    const right = Math.max(...p.filter((q) => q.y === 50).map((q) => q.x));
    expect(left + right).toBeCloseTo(100, 5);
    expect(xs[0]).toBe(0);
    expect(xs[xs.length - 1]).toBe(100);
  });

  it('U-Form: 8 Punkte, Öffnung oben mittig (voller Boden)', () => {
    const p = hallOutline({ shape: 'U', width: 100, height: 50 });
    expect(p).toHaveLength(8);
    expect(p).toContainEqual({ x: 0, y: 50 });
    expect(p).toContainEqual({ x: 100, y: 50 });
    // Aussparung berührt Oberkante (y=0) in der Mitte nicht als Fläche → zwei innere Kanten
    const topInner = p.filter((q) => q.y > 0 && q.y < 50);
    expect(topInner.length).toBeGreaterThanOrEqual(2);
  });

  it('C-Form: 8 Punkte, Öffnung nach rechts (linke Wand voll)', () => {
    const p = hallOutline({ shape: 'C', width: 100, height: 50 });
    expect(p).toHaveLength(8);
    // linke Kante durchgehend
    expect(p).toContainEqual({ x: 0, y: 0 });
    expect(p).toContainEqual({ x: 0, y: 50 });
  });
});
