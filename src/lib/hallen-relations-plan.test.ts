import { describe, it, expect } from 'vitest';
import {
  aggregateRelationenProStellplatz,
  getFuellgradFarbe,
  filterByProzesse,
  getAlleProzesse,
  countRelationen,
} from './hallen-relations-plan';
import type { TopisObject, StellplatzRelation } from '@/types/topis';

// ---- Helper -----------------------------------------------------------------

function makeStellplatz(
  id: number,
  name: string,
  relationen: StellplatzRelation[],
  kapazitaetPackstuecke?: number
): TopisObject {
  return {
    id,
    type: 'stellplatz',
    x: 0,
    y: 0,
    width: 12,
    height: 5,
    name,
    relationen,
    kapazitaetMulti: kapazitaetPackstuecke
      ? { packstuecke: kapazitaetPackstuecke }
      : undefined,
  };
}

function makeRelation(
  id: number,
  prozess: string,
  relation: string,
  menge: number
): StellplatzRelation {
  return { id, prozess, relation, menge };
}

// ---- aggregateRelationenProStellplatz --------------------------------------

describe('aggregateRelationenProStellplatz', () => {
  it('aggregiert 5 Relationen auf 3 Stellplätze mit korrekten Prozess-Summen', () => {
    // SP1: SE-Berlin 100 + SE-Hamburg 50 + SA-München 80 = 230 (SE 150, SA 80)
    // SP2: SE-Berlin 40 = 40 (SE 40)
    // SP3: Cross-Dock-X 25 = 25 (Cross-Dock 25)
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP-01', [
        makeRelation(1, 'SE', 'Berlin', 100),
        makeRelation(2, 'SE', 'Hamburg', 50),
        makeRelation(3, 'SA', 'München', 80),
      ], 300),
      makeStellplatz(2, 'SP-02', [makeRelation(4, 'SE', 'Berlin', 40)], 200),
      makeStellplatz(3, 'SP-03', [makeRelation(5, 'Cross-Dock', 'X', 25)]),
    ];

    const agg = aggregateRelationenProStellplatz(objects);

    expect(agg).toHaveLength(3);

    const sp1 = agg.find((a) => a.stellplatzId === 1)!;
    expect(sp1.gesamtMenge).toBe(230);
    expect(sp1.prozesse).toEqual({ SE: 150, SA: 80 });
    expect(sp1.kapazitaet).toBe(300);
    expect(sp1.fuellgrad).toBeCloseTo(230 / 300, 5);
    expect(sp1.relationen).toHaveLength(3);

    const sp2 = agg.find((a) => a.stellplatzId === 2)!;
    expect(sp2.gesamtMenge).toBe(40);
    expect(sp2.prozesse).toEqual({ SE: 40 });
    expect(sp2.fuellgrad).toBeCloseTo(40 / 200, 5);

    const sp3 = agg.find((a) => a.stellplatzId === 3)!;
    expect(sp3.gesamtMenge).toBe(25);
    expect(sp3.kapazitaet).toBeUndefined();
    expect(sp3.fuellgrad).toBeUndefined();
  });

  it('ignoriert Nicht-Stellplatz-Objekte', () => {
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP-01', [makeRelation(1, 'SE', 'A', 10)]),
      {
        id: 2,
        type: 'tor',
        x: 0,
        y: 0,
        width: 3,
        height: 1,
        name: 'T1',
        relationen: [makeRelation(99, 'SE', 'X', 999)],
      },
    ];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(agg).toHaveLength(1);
    expect(agg[0].gesamtMenge).toBe(10);
  });

  it('liefert leere Aggregate für Stellplätze ohne Relationen', () => {
    const objects: TopisObject[] = [makeStellplatz(1, 'SP-01', [])];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(agg).toHaveLength(1);
    expect(agg[0].gesamtMenge).toBe(0);
    expect(agg[0].prozesse).toEqual({});
  });

  it('fällt auf "Stellplatz {id}" zurück, wenn name leer', () => {
    const objects: TopisObject[] = [makeStellplatz(42, '', [])];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(agg[0].stellplatzName).toBe('Stellplatz 42');
  });
});

// ---- getFuellgradFarbe ------------------------------------------------------

describe('getFuellgradFarbe', () => {
  it('liefert grün bei Füllgrad 0.5 mit Default-Schwellen', () => {
    expect(getFuellgradFarbe(0.5)).toBe('gruen');
  });

  it('liefert gelb bei Füllgrad 0.8 mit Default-Schwellen', () => {
    // Default gruenBis=0.7 → 0.8 > 0.7 aber ≤ 0.9 = gelb
    expect(getFuellgradFarbe(0.8)).toBe('gelb');
  });

  it('liefert rot bei Füllgrad 0.95 mit Default-Schwellen', () => {
    expect(getFuellgradFarbe(0.95)).toBe('rot');
  });

  it('respektiert benutzerdefinierte Schwellen', () => {
    const farben = { gruenBis: 0.4, gelbBis: 0.6 };
    expect(getFuellgradFarbe(0.3, farben)).toBe('gruen');
    expect(getFuellgradFarbe(0.5, farben)).toBe('gelb');
    expect(getFuellgradFarbe(0.7, farben)).toBe('rot');
  });

  it('respektiert Grenzfall genau auf Schwelle (≤)', () => {
    // Genau auf gruenBis → noch grün
    expect(getFuellgradFarbe(0.7)).toBe('gruen');
    // Genau auf gelbBis → noch gelb
    expect(getFuellgradFarbe(0.9)).toBe('gelb');
  });
});

// ---- filterByProzesse -------------------------------------------------------

describe('filterByProzesse', () => {
  it('blendet Stellplätze aus, deren Relationen alle ausgefiltert sind', () => {
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP-SE', [makeRelation(1, 'SE', 'A', 10)]),
      makeStellplatz(2, 'SP-SA', [makeRelation(2, 'SA', 'B', 20)]),
      makeStellplatz(3, 'SP-MIX', [
        makeRelation(3, 'SE', 'A', 5),
        makeRelation(4, 'SA', 'B', 15),
      ]),
    ];
    const agg = aggregateRelationenProStellplatz(objects);

    const nurSe = filterByProzesse(agg, new Set(['SE']));
    expect(nurSe).toHaveLength(2); // SP-SE und SP-MIX (mit nur SE-Relation)
    expect(nurSe.find((a) => a.stellplatzId === 2)).toBeUndefined();
    const mix = nurSe.find((a) => a.stellplatzId === 3)!;
    expect(mix.gesamtMenge).toBe(5);
    expect(mix.relationen).toHaveLength(1);
    expect(mix.prozesse).toEqual({ SE: 5 });
  });

  it('rechnet Füllgrad nach Filter neu', () => {
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP', [
        makeRelation(1, 'SE', 'A', 60),
        makeRelation(2, 'SA', 'B', 40),
      ], 100),
    ];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(agg[0].fuellgrad).toBe(1.0);

    const nurSe = filterByProzesse(agg, new Set(['SE']));
    expect(nurSe[0].fuellgrad).toBeCloseTo(0.6, 5);
  });

  it('liefert leeres Array, wenn keine Prozesse aktiv', () => {
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP', [makeRelation(1, 'SE', 'A', 10)]),
    ];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(filterByProzesse(agg, new Set())).toEqual([]);
  });
});

// ---- getAlleProzesse / countRelationen --------------------------------------

describe('getAlleProzesse', () => {
  it('liefert sortierte Liste eindeutiger Prozess-Namen', () => {
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP1', [
        makeRelation(1, 'SE', 'A', 1),
        makeRelation(2, 'SA', 'B', 1),
      ]),
      makeStellplatz(2, 'SP2', [
        makeRelation(3, 'SE', 'C', 1),
        makeRelation(4, 'Cross-Dock', 'D', 1),
      ]),
    ];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(getAlleProzesse(agg)).toEqual(['Cross-Dock', 'SA', 'SE']);
  });
});

describe('countRelationen', () => {
  it('summiert Anzahl Relationen über alle Stellplätze', () => {
    const objects: TopisObject[] = [
      makeStellplatz(1, 'SP1', [
        makeRelation(1, 'SE', 'A', 1),
        makeRelation(2, 'SA', 'B', 1),
      ]),
      makeStellplatz(2, 'SP2', [makeRelation(3, 'SE', 'C', 1)]),
      makeStellplatz(3, 'SP3', []),
    ];
    const agg = aggregateRelationenProStellplatz(objects);
    expect(countRelationen(agg)).toBe(3);
  });
});
