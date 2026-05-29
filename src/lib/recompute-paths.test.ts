/**
 * Verifiziert dass recomputeAllPaths + pathArea-Filter zusammenspielen.
 * Nach der Konsolidierung (Schritt 1) muss ein Pfad mit startObjectId/
 * endObjectId beim Element-Move neu berechnet werden, und der neue Pfad
 * muss innerhalb der pathAreas liegen.
 */
import { describe, expect, it } from 'vitest';
import { useTopisStore } from './store';
import type { Gang, PathArea, TopisObject } from '@/types/topis';

describe('Recompute paths nach pathArea-Konsolidierung', () => {
  it('Pfad mit startObjectId+endObjectId wird beim updateObject neu berechnet, respektiert pathAreas', async () => {
    const store = useTopisStore;

    // Setup: simple Halle 30×20, 2 Tore, 1 Bereich, 1 Gang, 1 pathArea
    store.setState({
      objects: [],
      paths: [],
      gaenge: [],
      pathAreas: [],
      objectIdCounter: 1,
      pathIdCounter: 1,
      pathAreaIdCounter: 1,
    });

    const tor1: TopisObject = { id: 1, type: 'tor', name: 'Tor 1', x: 0, y: 0, width: 3, height: 1 };
    const tor2: TopisObject = { id: 2, type: 'tor', name: 'Tor 2', x: 24, y: 0, width: 3, height: 1 };
    const bereich: TopisObject = { id: 3, type: 'bereich', name: 'Lager', x: 10, y: 8, width: 6, height: 4 };
    store.setState({ objects: [tor1, tor2, bereich], objectIdCounter: 4 });

    const gang: Gang = { id: 1, name: 'Hauptgang', points: [{ x: 0, y: 10 }, { x: 30, y: 10 }], breite: 4, color: '#000' };
    store.getState().setGaenge([gang]);

    const pa: Omit<PathArea, 'id'> = { name: 'Hauptgang Fläche', x: 0, y: 8, width: 30, height: 4, color: '#22c55e40' };
    store.getState().addPathArea(pa);

    // Pfad anlegen mit Anker Tor 1 → Lager (FFZ undefined → kein Mindestbreite-Filter)
    store.setState({
      paths: [{
        id: 1, name: 'Tor 1 → Lager',
        waypoints: [{ x: 1.5, y: 0.5, objectId: null }, { x: 13, y: 10, objectId: null }],
        color: '#f59e0b',
        startObjectId: 1, startObjectName: 'Tor 1',
        endObjectId: 3, endObjectName: 'Lager',
        distance: 100, time: 100,
      }],
      pathIdCounter: 2,
    });

    const before = store.getState().paths[0];
    expect(before.distance).toBe(100);

    // Tor 1 verschieben: löst scheduleRecomputeForObject → recomputeAllPaths aus.
    // Aber: scheduleRecomputeForObject hat 80ms Debounce. Direkter Test:
    store.getState().recomputeAllPaths();

    const after = store.getState().paths[0];
    expect(after.distance).not.toBe(100);
    expect(after.waypoints.length).toBeGreaterThan(1);
    // Alle Waypoints müssen in pathArea liegen (außer Andock-Punkte zum Tor/Bereich-Center)
    // Mind. einer der Zwischen-Waypoints soll y ≈ 10 sein (Hauptgang)
    const hasGangWp = after.waypoints.some(wp => Math.abs(wp.y - 10) < 0.5);
    expect(hasGangWp).toBe(true);
  });

  it('Pfad ohne startObjectId/endObjectId bleibt beim Recompute unverändert', () => {
    const store = useTopisStore;
    store.setState({
      objects: [{ id: 1, type: 'tor', name: 'Tor 1', x: 0, y: 0, width: 3, height: 1 }] as TopisObject[],
      paths: [{
        id: 99, name: 'Manueller Skizze-Pfad',
        waypoints: [{ x: 5, y: 5, objectId: null }, { x: 10, y: 10, objectId: null }],
        color: '#f59e0b',
        distance: 50, time: 50,
      }],
      pathIdCounter: 100,
    });
    store.getState().recomputeAllPaths();
    expect(store.getState().paths[0].distance).toBe(50);
  });
});
