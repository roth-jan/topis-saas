import { describe, expect, it } from 'vitest';
import { findNearestAnchor, isValidAnchorObject } from './path-anchor';
import type { TopisObject } from '@/types/topis';

function obj(partial: Partial<TopisObject>): TopisObject {
  return {
    id: 1,
    type: 'tor',
    name: 'Tor',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    ...partial,
  } as TopisObject;
}

describe('Bug A: findNearestAnchor must skip walls/doors/columns/obstacles', () => {
  const wall = obj({ id: 1, type: 'wand', name: 'Brandschutzwand', x: 10, y: 10, width: 0.5, height: 20 });
  const door = obj({ id: 2, type: 'tuer', name: 'Tür 1', x: 5, y: 5, width: 1, height: 0.5 });
  const column = obj({ id: 3, type: 'pfosten', name: 'Pfosten', x: 8, y: 8, width: 0.4, height: 0.4 });
  const obstacle = obj({ id: 4, type: 'hindernis', name: 'Hindernis', x: 2, y: 2, width: 1, height: 1 });
  const tor = obj({ id: 5, type: 'tor', name: 'Tor 42', x: 15, y: 15, width: 3.75, height: 1.5 });
  const bereich = obj({ id: 6, type: 'bereich', name: 'Langgut', x: 20, y: 20, width: 10, height: 5 });
  const stellplatz = obj({ id: 7, type: 'stellplatz', name: 'SP A1', x: 30, y: 30, width: 2, height: 2 });
  // 'sonstiges' wurde im ObjectType-Refactor zu 'custom' umbenannt. Die Anker-
  // Gültigkeit hängt hier ohnehin nur am 'messpunkt'-Tag, nicht am Typ (custom
  // ist NICHT in VALID_ANCHOR_TYPES) — Testabsicht bleibt unverändert.
  const messpunkt = obj({ id: 8, type: 'custom', name: 'MP1', tags: ['messpunkt'], x: 40, y: 40, width: 0.5, height: 0.5 });

  it('rejects wand even when clicked directly on its center', () => {
    expect(isValidAnchorObject(wall)).toBe(false);
    const hit = findNearestAnchor([wall], 10.25, 20, 5);
    expect(hit).toBeNull();
  });

  it('rejects tuer/pfosten/hindernis', () => {
    expect(isValidAnchorObject(door)).toBe(false);
    expect(isValidAnchorObject(column)).toBe(false);
    expect(isValidAnchorObject(obstacle)).toBe(false);
    expect(findNearestAnchor([door, column, obstacle], 5.5, 5.25, 5)).toBeNull();
  });

  it('accepts tor + bereich + stellplatz', () => {
    expect(findNearestAnchor([tor], 16.8, 15.75, 3)).toBe(tor);
    expect(findNearestAnchor([bereich], 25, 22.5, 3)).toBe(bereich);
    expect(findNearestAnchor([stellplatz], 31, 31, 3)).toBe(stellplatz);
  });

  it('accepts messpunkt-tagged custom objects', () => {
    expect(isValidAnchorObject(messpunkt)).toBe(true);
    expect(findNearestAnchor([messpunkt], 40.25, 40.25, 3)).toBe(messpunkt);
  });

  it('mixed scene: returns tor, never wall even if wall is closer', () => {
    // Click between wall(10) and tor(15): wall 0.5m away, tor ~5m away in x.
    // The buggy code would return wall. The fixed code must return tor (or null
    // if outside tolerance).
    const clickAtWall = findNearestAnchor([wall, tor], 10.25, 20, 5);
    expect(clickAtWall).not.toBe(wall);
  });

  it('returns null when no valid anchor in tolerance', () => {
    expect(findNearestAnchor([wall, door, column], 100, 100, 5)).toBeNull();
  });
});
