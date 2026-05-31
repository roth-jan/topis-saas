import { describe, expect, it } from 'vitest';
import { findGangClusters, generateConnectors } from './gang-insel-verbinder';
import type { Gang } from '@/types/topis';

const g = (id: number, points: { x: number; y: number }[]): Gang =>
  ({ id, name: `G${id}`, points, breite: 3, typ: 'quergang', farbe: '#000' } as Gang);

describe('findGangClusters', () => {
  it('zwei nicht verbundene Gänge → 2 Cluster', () => {
    const r = findGangClusters([g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }]), g(2, [{ x: 50, y: 50 }, { x: 60, y: 50 }])]);
    expect(r.length).toBe(2);
  });

  it('Gänge mit Endpunkt-Berührung → 1 Cluster', () => {
    const r = findGangClusters([g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }]), g(2, [{ x: 10, y: 0 }, { x: 10, y: 10 }])]);
    expect(r.length).toBe(1);
  });

  it('kreuzende Gänge ohne Endpunkt-Berührung → 1 Cluster', () => {
    const r = findGangClusters([g(1, [{ x: 0, y: 5 }, { x: 10, y: 5 }]), g(2, [{ x: 5, y: 0 }, { x: 5, y: 10 }])]);
    expect(r.length).toBe(1);
  });
});

describe('generateConnectors', () => {
  it('zwei nicht verbundene Gänge in Reichweite → 1 Connector zwischen nächsten Endpunkten', () => {
    const r = generateConnectors([
      g(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }]),
      g(2, [{ x: 15, y: 0 }, { x: 25, y: 0 }]),
    ]);
    expect(r.length).toBe(1);
    expect(r[0].points[0]).toEqual({ x: 10, y: 0 });
    expect(r[0].points[1]).toEqual({ x: 15, y: 0 });
  });

  it('drei isolierte Inseln → 2 Connectoren bis alles verbunden', () => {
    const r = generateConnectors([
      g(1, [{ x: 0, y: 0 }, { x: 5, y: 0 }]),
      g(2, [{ x: 10, y: 0 }, { x: 15, y: 0 }]),
      g(3, [{ x: 20, y: 0 }, { x: 25, y: 0 }]),
    ]);
    expect(r.length).toBe(2);
  });

  it('Inseln zu weit auseinander → kein Connector', () => {
    const r = generateConnectors([
      g(1, [{ x: 0, y: 0 }, { x: 5, y: 0 }]),
      g(2, [{ x: 100, y: 0 }, { x: 105, y: 0 }]),
    ], { maxConnectorDistance: 20 });
    expect(r.length).toBe(0);
  });

  it('Connector-Name beginnt mit "Auto: Verbinder"', () => {
    const r = generateConnectors([
      g(1, [{ x: 0, y: 0 }, { x: 5, y: 0 }]),
      g(2, [{ x: 10, y: 0 }, { x: 15, y: 0 }]),
    ]);
    expect(r[0].name).toMatch(/^Auto: Verbinder/);
  });
});
