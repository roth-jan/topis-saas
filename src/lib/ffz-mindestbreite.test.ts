import { describe, expect, it } from 'vitest';
import { computeAllPaths, buildGangGraph } from './pathfinding';
import type { Gang, TopisObject, FFZ } from '@/types/topis';

describe('FFZ-Mindestbreite filtert Gänge', () => {
  const tor1 = { id: 1, type: 'tor', name: 'Tor 1', x: 0, y: 0, width: 3, height: 1 } as TopisObject;
  const tor2 = { id: 2, type: 'tor', name: 'Tor 2', x: 20, y: 0, width: 3, height: 1 } as TopisObject;
  const stapler: FFZ = {
    id: 1, name: 'Stapler', typ: 'stapler', geschwindigkeit: 10, mindestBreite: 3.5,
    aufnahmeZeit: 5, abgabeZeit: 5, cluster: [],
  } as unknown as FFZ;

  it('schmaler 2 m-Gang: Stapler (3.5 m Mindestbreite) findet keinen Pfad', () => {
    const schmal: Gang[] = [{ id: 1, name: 'Schmaler Gang', points: [{ x: 0, y: 5 }, { x: 25, y: 5 }], breite: 2, typ: 'hauptgang', farbe: '#000' }];
    const graph = buildGangGraph(schmal, stapler);
    expect(graph.nodes.length).toBe(0); // alle Gänge gefiltert
    const r = computeAllPaths([tor1], [tor2], schmal, stapler);
    expect(r[0].result).toBeNull();
  });

  it('breiter 4 m-Gang: Stapler findet Pfad', () => {
    const breit: Gang[] = [{ id: 1, name: 'Breiter Gang', points: [{ x: 0, y: 5 }, { x: 25, y: 5 }], breite: 4, typ: 'hauptgang', farbe: '#000' }];
    const r = computeAllPaths([tor1], [tor2], breit, stapler);
    expect(r[0].result).not.toBeNull();
  });

  it('ohne FFZ: 2 m-Gang ist OK', () => {
    const schmal: Gang[] = [{ id: 1, name: 'Schmaler Gang', points: [{ x: 0, y: 5 }, { x: 25, y: 5 }], breite: 2, typ: 'hauptgang', farbe: '#000' }];
    const r = computeAllPaths([tor1], [tor2], schmal);
    expect(r[0].result).not.toBeNull();
  });
});
