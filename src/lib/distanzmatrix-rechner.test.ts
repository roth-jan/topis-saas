import { describe, it, expect } from 'vitest';
import { berechneVerteilwegAusDistanzmatrix } from './distanzmatrix-rechner';
import { SCHMID_DISTANZMATRIX } from './data/schmid-distanzmatrix';
import type { Distanzmatrix } from '@/types/distanzmatrix';

describe('berechneVerteilwegAusDistanzmatrix — AS Schmid Halle 6', () => {
  it('liefert gewichteten Verteilweg ~122.7m (Baseline aus CLAUDE.md)', () => {
    const ergebnis = berechneVerteilwegAusDistanzmatrix(SCHMID_DISTANZMATRIX);
    // Referenz: 122.7m (12% unter gemessenem 138.8m wegen 36.4% Ø-Fallback-Quote).
    // Regression-Lock: wenn Matching-Logik bricht, fällt Wert weit daneben.
    expect(ergebnis.gewichteterWegM).toBeGreaterThan(118);
    expect(ergebnis.gewichteterWegM).toBeLessThan(128);
  });

  it('ordnet >60% der Colli einem Tor zu (dokumentiert: 63.6%)', () => {
    const ergebnis = berechneVerteilwegAusDistanzmatrix(SCHMID_DISTANZMATRIX);
    const matchQuote = ergebnis.abgedeckteColli / (ergebnis.abgedeckteColli + ergebnis.nichtZugeordnet);
    expect(matchQuote).toBeGreaterThan(0.6);
    expect(matchQuote).toBeLessThan(0.7);
  });

  it('summiert Colli zu gesamtColli (82.120)', () => {
    const ergebnis = berechneVerteilwegAusDistanzmatrix(SCHMID_DISTANZMATRIX);
    const sum = ergebnis.abgedeckteColli + ergebnis.nichtZugeordnet;
    expect(sum).toBe(82120);
    expect(ergebnis.gesamtColli).toBe(82120);
  });

  it('sortiert Details absteigend nach Colli-Volumen', () => {
    const ergebnis = berechneVerteilwegAusDistanzmatrix(SCHMID_DISTANZMATRIX);
    for (let i = 1; i < ergebnis.details.length; i++) {
      expect(ergebnis.details[i].colli).toBeLessThanOrEqual(ergebnis.details[i - 1].colli);
    }
  });
});

describe('berechneVerteilwegAusDistanzmatrix — Synthetische Minimal-Matrix', () => {
  const minimalDm: Distanzmatrix = {
    name: 'Test',
    entladezonen: [{ name: 'EZ 1', torVon: 1, torBis: 2 }],
    eintraege: [
      { vonName: 'EZ 1', nachName: 'Tor 1', distanzM: 50, distanzDoppeltM: 100, seRelationen: ['01'], saRelationen: [] },
      { vonName: 'EZ 1', nachName: 'Tor 2', distanzM: 100, distanzDoppeltM: 200, seRelationen: ['02'], saRelationen: [] },
    ],
    leerhubwagen: [
      { messpunkt: '5', ausgangsrelation: '01', colli: 300 },
      { messpunkt: '5', ausgangsrelation: '02', colli: 100 },
    ],
    gesamtColli: 400,
  };

  it('nutzt distanzDoppeltM (Hin+Rück) und gewichtet korrekt nach Colli', () => {
    const ergebnis = berechneVerteilwegAusDistanzmatrix(minimalDm);
    // (100 * 300 + 200 * 100) / 400 = 50000 / 400 = 125
    expect(ergebnis.gewichteterWegM).toBeCloseTo(125, 3);
    expect(ergebnis.nichtZugeordnet).toBe(0);
  });

  it('Prefix-Match: Relation "0100" matcht auf SE-Relation "01"', () => {
    const dmMitPrefix: Distanzmatrix = {
      ...minimalDm,
      leerhubwagen: [{ messpunkt: '5', ausgangsrelation: '0100', colli: 200 }],
      gesamtColli: 200,
    };
    const ergebnis = berechneVerteilwegAusDistanzmatrix(dmMitPrefix);
    expect(ergebnis.nichtZugeordnet).toBe(0);
    expect(ergebnis.details[0].tor).toBe('Tor 1');
  });

  it('Nicht zugeordnete Relationen fallen auf Durchschnittsdistanz der Standard-EZ zurück', () => {
    const dmUnbekannt: Distanzmatrix = {
      ...minimalDm,
      leerhubwagen: [{ messpunkt: '5', ausgangsrelation: 'UNKNOWN_RELATION', colli: 100 }],
      gesamtColli: 100,
    };
    const ergebnis = berechneVerteilwegAusDistanzmatrix(dmUnbekannt);
    expect(ergebnis.nichtZugeordnet).toBe(100);
    // Durchschnitt EZ 1 = (100 + 200) / 2 = 150
    expect(ergebnis.gewichteterWegM).toBeCloseTo(150, 3);
  });
});
