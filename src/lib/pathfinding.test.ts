import { describe, it, expect } from 'vitest';
import { buildGangGraph, findPath } from './pathfinding';
import type { Gang, FFZ } from '@/types/topis';

const makeGang = (id: number, points: { x: number; y: number }[], breite = 3): Gang => ({
  id,
  name: `Gang ${id}`,
  points,
  breite,
  color: '#000',
} as unknown as Gang);

describe('buildGangGraph', () => {
  it('leerer Input → leerer Graph', () => {
    const g = buildGangGraph([]);
    expect(g.nodes).toHaveLength(0);
    expect(g.edges).toHaveLength(0);
  });

  it('einzelner Gang mit 2 Punkten → 2 Nodes + 2 Edges (bidirektional)', () => {
    const g = buildGangGraph([makeGang(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }])]);
    expect(g.nodes).toHaveLength(2);
    expect(g.edges).toHaveLength(2);
    expect(g.edges[0].distance).toBeCloseTo(10, 5);
  });

  it('Kreuzung zweier Gänge erzeugt Kreuzungsknoten verbunden mit beiden Gängen', () => {
    const horizontal = makeGang(1, [{ x: 0, y: 5 }, { x: 10, y: 5 }]);
    const vertikal = makeGang(2, [{ x: 5, y: 0 }, { x: 5, y: 10 }]);
    const g = buildGangGraph([horizontal, vertikal]);
    // 4 Endpunkte + 1 Kreuzung = 5 Nodes
    expect(g.nodes.length).toBeGreaterThanOrEqual(5);
    // Kreuzungsknoten bei (5, 5)
    const kreuzung = g.nodes.find(
      (n) => Math.abs(n.x - 5) < 0.5 && Math.abs(n.y - 5) < 0.5,
    );
    expect(kreuzung).toBeDefined();
  });

  it('FFZ-Filter: Gang mit breite < mindestBreite wird ignoriert', () => {
    const ffzBreit = { mindestBreite: 3.5 } as unknown as FFZ;
    const schmal = makeGang(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }], 2.0);
    const breit = makeGang(2, [{ x: 0, y: 5 }, { x: 10, y: 5 }], 4.0);
    const g = buildGangGraph([schmal, breit], ffzBreit);
    // Nur der breite Gang übrig (2 Nodes)
    expect(g.nodes).toHaveLength(2);
    expect(g.gaenge).toHaveLength(1);
    expect(g.gaenge[0].id).toBe(2);
  });
});

describe('findPath — A* über Gang-Graph', () => {
  it('leeres Graph → null', () => {
    const g = buildGangGraph([]);
    expect(findPath(0, 0, 10, 0, g)).toBeNull();
  });

  it('direkter Gang: Start → Ende findet Pfad mit korrekter Distanz', () => {
    const g = buildGangGraph([makeGang(1, [{ x: 0, y: 0 }, { x: 20, y: 0 }])]);
    const result = findPath(0, 0, 20, 0, g);
    expect(result).not.toBeNull();
    expect(result!.distance).toBeCloseTo(20, 1);
    expect(result!.path.length).toBeGreaterThanOrEqual(2);
  });

  it('L-förmiger Pfad: horizontal → vertikal über Kreuzung', () => {
    const horizontal = makeGang(1, [{ x: 0, y: 0 }, { x: 10, y: 0 }]);
    const vertikal = makeGang(2, [{ x: 10, y: 0 }, { x: 10, y: 10 }]);
    const g = buildGangGraph([horizontal, vertikal]);
    const result = findPath(0, 0, 10, 10, g);
    expect(result).not.toBeNull();
    // 10m horizontal + 10m vertikal = 20m
    expect(result!.distance).toBeCloseTo(20, 1);
  });
});
