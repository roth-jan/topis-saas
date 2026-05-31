import { describe, it, expect } from 'vitest';
import {
  verladerAuslastung,
  verladerBedarf,
  gruppiereVerladerNachSchicht,
  schichtLabel,
} from './verlader-rechner';
import type { Verlader } from '@/types/topis';

function v(partial: Partial<Verlader>): Verlader {
  return {
    id: partial.id ?? 1,
    name: partial.name ?? 'Test',
    schicht: partial.schicht,
    ffzId: partial.ffzId,
    bedientToreIds: partial.bedientToreIds ?? [],
    bedientStellplatzIds: partial.bedientStellplatzIds ?? [],
    kapazitaetProStunde: partial.kapazitaetProStunde,
    notiz: partial.notiz,
  };
}

describe('verladerAuslastung', () => {
  it('rechnet 100% wenn Volumen exakt der Tageskapazität entspricht', () => {
    // 50 Colli/h × 8h = 400 Colli/Tag → 400 Aufträge = 100%
    const a = verladerAuslastung(v({ kapazitaetProStunde: 50 }), 400);
    expect(a).toBeCloseTo(100, 5);
  });

  it('rechnet 50% bei halber Auslastung', () => {
    const a = verladerAuslastung(v({ kapazitaetProStunde: 50 }), 200);
    expect(a).toBeCloseTo(50, 5);
  });

  it('kann über 100% gehen (Überlast)', () => {
    const a = verladerAuslastung(v({ kapazitaetProStunde: 50 }), 600);
    expect(a).toBeCloseTo(150, 5);
  });

  it('liefert 0 wenn kapazitaetProStunde fehlt', () => {
    expect(verladerAuslastung(v({}), 100)).toBe(0);
  });

  it('liefert 0 wenn kapazitaetProStunde = 0', () => {
    expect(verladerAuslastung(v({ kapazitaetProStunde: 0 }), 100)).toBe(0);
  });

  it('liefert 0 bei negativem Volumen', () => {
    expect(verladerAuslastung(v({ kapazitaetProStunde: 50 }), -10)).toBe(0);
  });

  it('berücksichtigt benutzerdefinierte Arbeitsstunden', () => {
    // 50 Colli/h × 4h = 200 → 200 Aufträge = 100%
    const a = verladerAuslastung(v({ kapazitaetProStunde: 50 }), 200, 4);
    expect(a).toBeCloseTo(100, 5);
  });

  it('liefert 0 bei arbeitsstunden = 0', () => {
    expect(verladerAuslastung(v({ kapazitaetProStunde: 50 }), 100, 0)).toBe(0);
  });
});

describe('verladerBedarf', () => {
  it('rundet 1.1 Verlader auf 2 auf', () => {
    // 440 Colli/Tag, 50 Colli/h, 8h → 440/(50×8)=1.1 → 2
    expect(verladerBedarf(440, 50, 8)).toBe(2);
  });

  it('liefert genau 1 Verlader bei perfekter Auslastung', () => {
    expect(verladerBedarf(400, 50, 8)).toBe(1);
  });

  it('liefert 0 bei colliProTag = 0', () => {
    expect(verladerBedarf(0, 50, 8)).toBe(0);
  });

  it('liefert 0 bei kapProH = 0', () => {
    expect(verladerBedarf(100, 0, 8)).toBe(0);
  });

  it('liefert 0 bei arbeitsstunden = 0', () => {
    expect(verladerBedarf(100, 50, 0)).toBe(0);
  });

  it('skaliert mit Arbeitsstunden', () => {
    // 800 Colli/Tag, 50 Colli/h, 16h → 1, 8h → 2, 4h → 4
    expect(verladerBedarf(800, 50, 16)).toBe(1);
    expect(verladerBedarf(800, 50, 8)).toBe(2);
    expect(verladerBedarf(800, 50, 4)).toBe(4);
  });

  it('kleinste Aufträge brauchen mindestens 1 Verlader', () => {
    expect(verladerBedarf(1, 50, 8)).toBe(1);
  });
});

describe('gruppiereVerladerNachSchicht', () => {
  it('sortiert Verlader in passende Schicht-Buckets', () => {
    const list: Verlader[] = [
      v({ id: 1, schicht: 'frueh' }),
      v({ id: 2, schicht: 'spaet' }),
      v({ id: 3, schicht: 'nacht' }),
      v({ id: 4, schicht: 'tag' }),
      v({ id: 5, schicht: 'frueh' }),
    ];
    const g = gruppiereVerladerNachSchicht(list);
    expect(g.frueh).toHaveLength(2);
    expect(g.spaet).toHaveLength(1);
    expect(g.nacht).toHaveLength(1);
    expect(g.tag).toHaveLength(1);
  });

  it('weist Verlader ohne Schicht der Tagschicht zu', () => {
    const list: Verlader[] = [v({ id: 1 }), v({ id: 2, schicht: 'frueh' })];
    const g = gruppiereVerladerNachSchicht(list);
    expect(g.tag).toHaveLength(1);
    expect(g.tag[0].id).toBe(1);
    expect(g.frueh).toHaveLength(1);
  });

  it('liefert leere Buckets für leere Eingabe', () => {
    const g = gruppiereVerladerNachSchicht([]);
    expect(g.frueh).toEqual([]);
    expect(g.spaet).toEqual([]);
    expect(g.nacht).toEqual([]);
    expect(g.tag).toEqual([]);
  });
});

describe('schichtLabel', () => {
  it('liefert deutsche Labels', () => {
    expect(schichtLabel('frueh')).toBe('Frühschicht');
    expect(schichtLabel('spaet')).toBe('Spätschicht');
    expect(schichtLabel('nacht')).toBe('Nachtschicht');
    expect(schichtLabel('tag')).toBe('Tagschicht');
  });
});
