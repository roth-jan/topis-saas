import { describe, expect, it } from 'vitest';
import { findSnap } from './canvas-snap';
import type { Gang, PathArea, Path, TopisObject } from '@/types/topis';

const g = (id: number, points: { x: number; y: number }[]): Gang =>
  ({ id, name: `G${id}`, points, breite: 3, typ: 'quergang', farbe: '#000' } as Gang);

describe('canvas-snap findSnap', () => {
  it('keine Quellen → null', () => {
    expect(findSnap({ wx: 5, wy: 5 })).toBeNull();
  });

  it('Gang-Endpunkt schlägt PathArea-Ecke wenn beide gleich nah (Magnet-Bonus)', () => {
    const gaenge = [g(1, [{ x: 5, y: 5 }, { x: 15, y: 5 }])];
    const pa: PathArea = { id: 1, name: 'X', x: 5.1, y: 5, width: 10, height: 4, color: '#000' };
    const r = findSnap({ wx: 5, wy: 5, gaenge, pathAreas: [pa] });
    expect(r?.source).toBe('gang-endpoint');
  });

  it('PathArea-Ecke wenn nur diese Quelle erlaubt', () => {
    const pa: PathArea = { id: 1, name: 'X', x: 10, y: 10, width: 5, height: 5, color: '#000' };
    const r = findSnap({ wx: 10.3, wy: 10.2, pathAreas: [pa], sources: ['patharea-corner'] });
    expect(r?.source).toBe('patharea-corner');
    expect(r?.x).toBeCloseTo(10, 1);
  });

  it('Path-Waypoint snapt', () => {
    const path: Path = { id: 1, name: 'P', waypoints: [{ x: 20, y: 20, objectId: null }], color: '#000' } as Path;
    const r = findSnap({ wx: 20.4, wy: 20.4, paths: [path], sources: ['path-waypoint'] });
    expect(r?.source).toBe('path-waypoint');
  });

  it('Object-Anker mit wegpunktOffset', () => {
    const tor: TopisObject = { id: 1, type: 'tor', name: 'Tor 1', x: 10, y: 0, width: 4, height: 2, wegpunktOffset: { x: 0.5, y: 1 } } as TopisObject;
    // Anker = (10 + 4*0.5, 0 + 2*1) = (12, 2)
    const r = findSnap({ wx: 12.2, wy: 2.1, objects: [tor], sources: ['object-anchor'] });
    expect(r?.source).toBe('object-anchor');
    expect(r?.x).toBeCloseTo(12, 1);
    expect(r?.y).toBeCloseTo(2, 1);
  });

  it('Hallen-Ecke', () => {
    const r = findSnap({ wx: 0.3, wy: 0.3, hall: { width: 40, height: 20 }, sources: ['hall-corner'] });
    expect(r?.source).toBe('hall-corner');
    expect(r?.x).toBe(0);
    expect(r?.y).toBe(0);
  });

  it('sources-Filter respektiert: nur patharea-corner erlaubt → Gang ignoriert', () => {
    const gaenge = [g(1, [{ x: 5, y: 5 }, { x: 15, y: 5 }])];
    const pa: PathArea = { id: 1, name: 'X', x: 20, y: 20, width: 5, height: 5, color: '#000' };
    const r = findSnap({ wx: 5.3, wy: 5.1, gaenge, pathAreas: [pa], sources: ['patharea-corner'] });
    // weil Gang nicht in sources ist, kommt nichts in tolerance vom Pathfile rein → null
    expect(r).toBeNull();
  });

  it('Object-Anker mit wegpunktRolle=keiner wird ignoriert', () => {
    const tor: TopisObject = { id: 1, type: 'tor', name: 'Tor 1', x: 10, y: 0, width: 4, height: 2, wegpunktRolle: 'keiner' } as TopisObject;
    const r = findSnap({ wx: 12, wy: 1, objects: [tor], sources: ['object-anchor'] });
    expect(r).toBeNull();
  });
});
