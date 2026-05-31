/**
 * Verifiziert: addPathArea/updatePathArea/deletePathArea pflegen die
 * Auto-Gänge und Connector synchron.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { useTopisStore } from './store';

describe('pathArea-Sync mit Auto-Gängen und Connector', () => {
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

  it('addPathArea: erste Wegfläche erzeugt Auto-Gang ohne Connector', () => {
    const store = useTopisStore;
    store.getState().addPathArea({ name: 'Hauptgang', x: 0, y: 8, width: 40, height: 4, color: '#000' });
    const state = store.getState();
    expect(state.pathAreas.length).toBe(1);
    expect(state.gaenge.length).toBe(1);
    expect(state.gaenge[0].name).toMatch(/^Auto:/);
    expect(state.gaenge[0].autoFromPathAreaId).toBe(state.pathAreas[0].id);
  });

  it('addPathArea: zweite Wegfläche disconnected → Connector dazwischen', () => {
    const store = useTopisStore;
    store.getState().addPathArea({ name: 'A', x: 0, y: 8, width: 10, height: 4, color: '#000' });
    store.getState().addPathArea({ name: 'B', x: 14, y: 8, width: 10, height: 4, color: '#000' });
    const state = store.getState();
    expect(state.pathAreas.length).toBe(2);
    // 2 Auto-Gänge (je 1 pro pathArea) + mindestens 1 Connector
    expect(state.gaenge.length).toBeGreaterThanOrEqual(3);
    const connectors = state.gaenge.filter(g => g.name.startsWith('Auto: Verbinder'));
    expect(connectors.length).toBeGreaterThanOrEqual(1);
  });

  it('addPathArea: zweite Wegfläche bereits verbunden (Endpunkt-Berührung) → kein Connector', () => {
    const store = useTopisStore;
    // A horizontal x=0..10 y=8..12 → Mittellinie x=0..10 y=10
    store.getState().addPathArea({ name: 'A', x: 0, y: 8, width: 10, height: 4, color: '#000' });
    // B horizontal x=10..20 y=8..12 → Mittellinie x=10..20 y=10
    // Endpunkte (10,10) beider Mittellinien treffen sich → keine Lücke
    store.getState().addPathArea({ name: 'B', x: 10, y: 8, width: 10, height: 4, color: '#000' });
    const state = store.getState();
    const connectors = state.gaenge.filter(g => g.name.startsWith('Auto: Verbinder'));
    expect(connectors.length).toBe(0);
  });

  it('updatePathArea: bewegt Wegfläche → alter Auto-Gang weg, neuer da, Connector neu', () => {
    const store = useTopisStore;
    store.getState().addPathArea({ name: 'A', x: 0, y: 8, width: 10, height: 4, color: '#000' });
    store.getState().addPathArea({ name: 'B', x: 14, y: 8, width: 10, height: 4, color: '#000' });
    const beforeGangIds = store.getState().gaenge.map(g => g.id).sort();
    // B nach links rücken, sodass es A direkt berührt (keine Connector mehr nötig)
    const bId = store.getState().pathAreas[1].id;
    store.getState().updatePathArea(bId, { x: 10 });
    const after = store.getState();
    const afterGangIds = after.gaenge.map(g => g.id).sort();
    expect(beforeGangIds).not.toEqual(afterGangIds);
    const connectors = after.gaenge.filter(g => g.name.startsWith('Auto: Verbinder'));
    expect(connectors.length).toBe(0);
  });

  it('deletePathArea: Auto-Gang und zugehörige Connector werden entfernt', () => {
    const store = useTopisStore;
    store.getState().addPathArea({ name: 'A', x: 0, y: 8, width: 10, height: 4, color: '#000' });
    store.getState().addPathArea({ name: 'B', x: 14, y: 8, width: 10, height: 4, color: '#000' });
    expect(store.getState().gaenge.length).toBeGreaterThanOrEqual(3);
    const bId = store.getState().pathAreas[1].id;
    store.getState().deletePathArea(bId);
    const after = store.getState();
    expect(after.pathAreas.length).toBe(1);
    // Nur noch der Auto-Gang von A, kein Connector mehr
    expect(after.gaenge.length).toBe(1);
    expect(after.gaenge[0].name).toMatch(/^Auto:/);
  });
});
