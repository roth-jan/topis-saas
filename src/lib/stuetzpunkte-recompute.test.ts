/**
 * Verifiziert: Pfad mit Stützpunkten überlebt Element-Move/Layout-Recompute
 * und wird zwischen den Stützpunkten neu A* gerechnet (nicht überschrieben).
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { useTopisStore } from './store';
import type { Gang, PathArea, TopisObject } from '@/types/topis';

describe('Stützpunkte überleben Recompute', () => {
  beforeEach(() => {
    useTopisStore.setState({
      objects: [],
      paths: [],
      gaenge: [],
      pathAreas: [],
      objectIdCounter: 1,
      pathIdCounter: 1,
      pathAreaIdCounter: 1,
    });
  });

  it('Pfad mit 3 Stützpunkten: A* zwischen jedem Paar, Stützpunkte bleiben erhalten', () => {
    const store = useTopisStore;
    // Setup: 3 Tore in einer L-Form, ein Gang-Netz das L-förmig durch die Halle führt
    const objects: TopisObject[] = [
      { id: 1, type: 'tor', name: 'Tor A', x: 0, y: 0, width: 2, height: 1 },
      { id: 2, type: 'tor', name: 'Tor B', x: 20, y: 0, width: 2, height: 1 },
      { id: 3, type: 'tor', name: 'Tor C', x: 20, y: 20, width: 2, height: 1 },
    ];
    const gaenge: Gang[] = [
      { id: 1, name: 'Top', points: [{ x: 0, y: 5 }, { x: 21, y: 5 }], breite: 3, typ: 'hauptgang', farbe: '#000' },
      { id: 2, name: 'Right', points: [{ x: 21, y: 5 }, { x: 21, y: 20 }], breite: 3, typ: 'hauptgang', farbe: '#000' },
    ];
    store.setState({ objects, objectIdCounter: 4, gaenge });

    const stuetzpunkte = [
      { x: 1, y: 0.5, objectId: null },
      { x: 21, y: 5, objectId: null },
      { x: 21, y: 20.5, objectId: null },
    ];
    store.setState({
      paths: [{
        id: 1, name: 'A → B → C',
        waypoints: stuetzpunkte.slice(),
        color: '#f59e0b',
        stuetzpunkte,
        distance: 100, time: 100,
      }],
      pathIdCounter: 2,
    });

    const before = store.getState().paths[0];
    expect(before.distance).toBe(100);
    expect(before.stuetzpunkte?.length).toBe(3);

    store.getState().recomputeAllPaths();

    const after = store.getState().paths[0];
    // Stützpunkte bleiben unverändert (User-Intention erhalten)
    expect(after.stuetzpunkte?.length).toBe(3);
    expect(after.stuetzpunkte?.[0]).toEqual(stuetzpunkte[0]);
    expect(after.stuetzpunkte?.[2]).toEqual(stuetzpunkte[2]);
    // Waypoints sind die zusammengesetzten A*-Routen, mehr als 3 Punkte
    expect(after.waypoints.length).toBeGreaterThanOrEqual(3);
    // Distance ist neu berechnet (nicht 100)
    expect(after.distance).not.toBe(100);
    expect(after.distance).toBeGreaterThan(0);
  });

  it('Pfad ohne Stützpunkte aber mit startObjectId/endObjectId: Variante B greift', () => {
    const store = useTopisStore;
    const objects: TopisObject[] = [
      { id: 1, type: 'tor', name: 'Start', x: 0, y: 0, width: 2, height: 1 },
      { id: 2, type: 'tor', name: 'Ende', x: 20, y: 0, width: 2, height: 1 },
    ];
    const gaenge: Gang[] = [{ id: 1, name: 'Direct', points: [{ x: 0, y: 5 }, { x: 21, y: 5 }], breite: 3, typ: 'hauptgang', farbe: '#000' }];
    store.setState({ objects, objectIdCounter: 3, gaenge });
    store.setState({
      paths: [{
        id: 1, name: 'Start→Ende',
        waypoints: [{ x: 1, y: 0.5, objectId: null }, { x: 21, y: 0.5, objectId: null }],
        startObjectId: 1, endObjectId: 2,
        distance: 999, time: 999,
      }],
      pathIdCounter: 2,
    });
    store.getState().recomputeAllPaths();
    const after = store.getState().paths[0];
    expect(after.distance).not.toBe(999);
    // ohne stuetzpunkte bleibt das Feld undefined
    expect(after.stuetzpunkte).toBeUndefined();
  });

  it('Stützpunkt-Recompute mit pathArea-Constraint: bleibt in Wegfläche', () => {
    const store = useTopisStore;
    store.setState({
      objects: [],
      gaenge: [{ id: 1, name: 'Mitte', points: [{ x: 0, y: 5 }, { x: 30, y: 5 }], breite: 3, typ: 'hauptgang', farbe: '#000' }],
      pathAreas: [{ id: 1, name: 'PA', x: 0, y: 4, width: 30, height: 3, color: '#000' } as PathArea],
    });
    const sp = [
      { x: 1, y: 5, objectId: null },
      { x: 15, y: 5, objectId: null },
      { x: 29, y: 5, objectId: null },
    ];
    store.setState({
      paths: [{
        id: 1, name: 'Drei',
        waypoints: sp.slice(),
        stuetzpunkte: sp,
        distance: 50, time: 50,
      }],
      pathIdCounter: 2,
    });
    store.getState().recomputeAllPaths();
    const after = store.getState().paths[0];
    // Alle Waypoints sollten im pathArea-Rechteck liegen (y zwischen 4 und 7)
    for (const wp of after.waypoints) {
      expect(wp.y).toBeGreaterThanOrEqual(4);
      expect(wp.y).toBeLessThanOrEqual(7);
    }
  });
});
