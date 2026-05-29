import { describe, expect, it } from 'vitest';
import { findGangSnap, extendEndpointToNearbyGang, isGangIsolated } from './gang-snap';
import type { Gang } from '@/types/topis';

const g = (id: number, points: { x: number; y: number }[]): Gang => ({
  id, name: `G${id}`, points, breite: 3, typ: 'quergang', farbe: '#000',
} as Gang);

describe('findGangSnap', () => {
  it('weit weg → no snap', () => {
    const r = findGangSnap(50, 50, [g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }])], 2);
    expect(r.snapped).toBe(false);
  });

  it('nahe Endpunkt → endpoint snap', () => {
    const r = findGangSnap(10.5, 0.3, [g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }])], 2);
    expect(r.snapped).toBe(true);
    if (r.snapped) {
      expect(r.type).toBe('endpoint');
      expect(r.x).toBeCloseTo(10, 1);
    }
  });

  it('senkrecht auf Mitte einer Linie → perpendicular snap', () => {
    const r = findGangSnap(5, 1, [g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }])], 2);
    expect(r.snapped).toBe(true);
    if (r.snapped) {
      expect(r.type).toBe('perpendicular');
      expect(r.x).toBeCloseTo(5, 1);
      expect(r.y).toBeCloseTo(0, 1);
    }
  });

  it('endpoint hat Vorrang vor perpendicular wenn gleich nah', () => {
    // Cursor (10.5, 0.4): nahe Endpunkt (10,0) UND nahe Linie x=10..20 → endpoint gewinnt
    const gaenge = [g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }])];
    const r = findGangSnap(10.5, 0.4, gaenge, 2);
    expect(r.snapped).toBe(true);
    if (r.snapped) expect(r.type).toBe('endpoint');
  });

  it('Schnittpunkt zweier Gänge → intersection snap', () => {
    const gaenge = [
      g(1, [{ x: 0, y: 5 }, { x: 20, y: 5 }]),
      g(2, [{ x: 10, y: 0 }, { x: 10, y: 10 }]),
    ];
    const r = findGangSnap(10.5, 5.3, gaenge, 2);
    expect(r.snapped).toBe(true);
    if (r.snapped) {
      expect(r.type).toBe('intersection');
      expect(r.x).toBeCloseTo(10, 1);
      expect(r.y).toBeCloseTo(5, 1);
    }
  });
});

describe('extendEndpointToNearbyGang', () => {
  it('Endpunkt liegt 1 m vor Quergang → wird auf den Gang verlängert', () => {
    const stamm_end = { x: 10, y: 4 };
    const otherGaenge = [g(99, [{ x: 0, y: 5 }, { x: 20, y: 5 }])];
    const r = extendEndpointToNearbyGang(stamm_end, otherGaenge, 2);
    expect(r.extended).toBe(true);
    expect(r.x).toBeCloseTo(10, 1);
    expect(r.y).toBeCloseTo(5, 1);
  });

  it('Endpunkt zu weit weg → nicht verlängert', () => {
    const stamm_end = { x: 10, y: 2 };
    const otherGaenge = [g(99, [{ x: 0, y: 5 }, { x: 20, y: 5 }])];
    const r = extendEndpointToNearbyGang(stamm_end, otherGaenge, 2);
    expect(r.extended).toBe(false);
  });
});

describe('isGangIsolated', () => {
  it('isolierter Gang (kein Nachbar) → isoliert', () => {
    const neu = g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }]);
    const others = [g(2, [{ x: 50, y: 50 }, { x: 60, y: 60 }])];
    expect(isGangIsolated(neu, others, 0.5)).toBe(true);
  });

  it('Endpunkt trifft anderen Gang → nicht isoliert', () => {
    const neu = g(1, [{ x: 5, y: 0 }, { x: 5, y: 5 }]);
    const others = [g(2, [{ x: 0, y: 5 }, { x: 10, y: 5 }])];
    expect(isGangIsolated(neu, others, 0.5)).toBe(false);
  });

  it('Gang kreuzt anderen Gang in der Mitte → nicht isoliert', () => {
    const neu = g(1, [{ x: 5, y: 0 }, { x: 5, y: 10 }]);
    const others = [g(2, [{ x: 0, y: 5 }, { x: 10, y: 5 }])];
    expect(isGangIsolated(neu, others, 0.5)).toBe(false);
  });
});
