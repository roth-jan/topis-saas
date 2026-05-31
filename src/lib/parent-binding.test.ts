import { describe, expect, it, beforeEach } from 'vitest';
import { useTopisStore } from './store';
import { defaultAnchorOffset, anchorPoint } from './path-anchor';
import type { TopisObject } from '@/types/topis';

describe('Parent-Bindung (Überladebrücke) + Wegpunkt-Side-Default', () => {
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

  it('updateObject auf Parent: Kind folgt mit gleicher Delta', () => {
    const store = useTopisStore;
    store.setState({
      objects: [
        { id: 1, type: 'tor', name: 'Tor 1', x: 10, y: 0, width: 3, height: 1, side: 'north' },
        { id: 2, type: 'entladebereich', name: 'Brücke', x: 10, y: 1, width: 3, height: 2, parentObjectId: 1 },
      ] as TopisObject[],
      objectIdCounter: 3,
    });
    store.getState().updateObject(1, { x: 20 });
    const after = store.getState().objects;
    expect(after.find(o => o.id === 1)?.x).toBe(20);
    expect(after.find(o => o.id === 2)?.x).toBe(20); // Kind ist um +10 mitgewandert
    expect(after.find(o => o.id === 2)?.y).toBe(1); // y unverändert
  });

  it('deleteObject auf Parent: Kind wird mitgelöscht', () => {
    const store = useTopisStore;
    store.setState({
      objects: [
        { id: 1, type: 'tor', name: 'Tor', x: 0, y: 0, width: 3, height: 1 },
        { id: 2, type: 'entladebereich', name: 'Brücke', x: 0, y: 1, width: 3, height: 2, parentObjectId: 1 },
        { id: 3, type: 'tor', name: 'Tor 2', x: 10, y: 0, width: 3, height: 1 },
      ] as TopisObject[],
      objectIdCounter: 4,
    });
    store.getState().deleteObject(1);
    const after = store.getState().objects;
    expect(after.map(o => o.id).sort()).toEqual([3]);
  });

  it('verschachtelte Kinder werden rekursiv gelöscht', () => {
    const store = useTopisStore;
    store.setState({
      objects: [
        { id: 1, type: 'tor', name: 'Tor', x: 0, y: 0, width: 3, height: 1 },
        { id: 2, type: 'entladebereich', name: 'Brücke', x: 0, y: 1, width: 3, height: 2, parentObjectId: 1 },
        { id: 3, type: 'stellplatz', name: 'SP', x: 0, y: 3, width: 1, height: 1, parentObjectId: 2 },
      ] as TopisObject[],
      objectIdCounter: 4,
    });
    store.getState().deleteObject(1);
    expect(store.getState().objects.length).toBe(0);
  });
});

describe('Wegpunkt-Default je Tor-Seite', () => {
  const tor = (side: 'north' | 'south' | 'east' | 'west'): TopisObject => ({
    id: 1, type: 'tor', name: 'T', x: 10, y: 5, width: 4, height: 2, side,
  } as TopisObject);

  it('Nord-Tor → Anker-Offset y=1.0 (innen)', () => {
    expect(defaultAnchorOffset(tor('north'))).toEqual({ x: 0.5, y: 1.0 });
  });

  it('Süd-Tor → y=0.0', () => {
    expect(defaultAnchorOffset(tor('south'))).toEqual({ x: 0.5, y: 0.0 });
  });

  it('West-Tor → x=1.0', () => {
    expect(defaultAnchorOffset(tor('west'))).toEqual({ x: 1.0, y: 0.5 });
  });

  it('Ost-Tor → x=0.0', () => {
    expect(defaultAnchorOffset(tor('east'))).toEqual({ x: 0.0, y: 0.5 });
  });

  it('anchorPoint respektiert Tor-Seite', () => {
    const t = tor('north');
    const p = anchorPoint(t);
    // x = 10 + 4*0.5 = 12, y = 5 + 2*1.0 = 7
    expect(p).toEqual({ x: 12, y: 7 });
  });

  it('explizit gesetztes wegpunktOffset hat Vorrang', () => {
    const t = { ...tor('north'), wegpunktOffset: { x: 0.5, y: 0.5 } };
    const p = anchorPoint(t as TopisObject);
    expect(p).toEqual({ x: 12, y: 6 });
  });

  it('Bereich ohne side → Mitte', () => {
    const b = { id: 1, type: 'bereich', name: 'B', x: 0, y: 0, width: 10, height: 10 } as TopisObject;
    expect(defaultAnchorOffset(b)).toEqual({ x: 0.5, y: 0.5 });
  });
});
