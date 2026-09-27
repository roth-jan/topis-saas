/**
 * Der Kunden-Check darf die Eingaben des Kunden nicht verändern.
 *
 * Beide Fälle stammen aus der Browser-Prüfung durch Codex am 27.09.2026 (P1) und
 * waren vor dem Fix reproduzierbar falsch. Sie sind hier als Regressions-Locks
 * festgehalten, weil sie einem Kunden direkt falsche Zahlen zeigen — und zwar
 * still, ohne Fehlermeldung.
 */
import { describe, it, expect } from 'vitest';
import { generateRecordsFromEckdaten, generateDemoRecords } from './eckdaten-analyse';
import { generateAutoLayout } from './auto-layout-generator';
import type { Eckdaten } from './eckdaten-analyse';

const eck = (colliProTag: number, flaecheQm: number, tore = 40): Eckdaten => ({
  tore, colliProTag, flaecheQm, fte: 20, hallenName: 'Prüfhalle', prozessTyp: 'se',
} as Eckdaten);

const summeColli = (recs: { colli?: number }[]) => recs.reduce((s, r) => s + (r.colli ?? 0), 0);

describe('Tagesmenge bleibt die eingegebene Tagesmenge', () => {
  // Vorher: jedes Tor bekam in jeder Stunde mindestens 1 Colli → 40 Tore × 18 Stunden
  // = 720 Colli Untergrenze. Eingabe 100 ergab 720 (7,2-fach), Eingabe 200 ebenfalls 720.
  for (const menge of [50, 100, 200, 1000, 4000, 8000, 15000]) {
    it(`${menge} Colli/Tag ergibt exakt ${menge} Colli`, () => {
      expect(summeColli(generateRecordsFromEckdaten(eck(menge, 5000)))).toBe(menge);
    });
  }

  it('gilt auch bei vielen Toren und kleiner Menge', () => {
    expect(summeColli(generateRecordsFromEckdaten(eck(120, 5000, 115)))).toBe(120);
  });

  it('doppelte Eingabe ergibt doppelte Menge', () => {
    const einfach = summeColli(generateRecordsFromEckdaten(eck(2000, 5000)));
    const doppelt = summeColli(generateRecordsFromEckdaten(eck(4000, 5000)));
    expect(doppelt).toBe(einfach * 2);
  });

  it('erzeugt keine Scan-Datensätze über 0 Colli', () => {
    const recs = generateRecordsFromEckdaten(eck(100, 5000));
    expect(recs.every((r) => (r.colli ?? 0) > 0)).toBe(true);
  });

  it('behält das Nachtschicht-Profil bei (frühe Stunden tragen am meisten)', () => {
    const recs = generateRecordsFromEckdaten(eck(4000, 5000));
    const proStunde = new Map<number, number>();
    for (const r of recs) {
      const h = Number(r.scanzeit.slice(0, 2));
      proStunde.set(h, (proStunde.get(h) ?? 0) + (r.colli ?? 0));
    }
    const spitze = [...proStunde.entries()].sort((a, b) => b[1] - a[1])[0][0];
    expect(spitze).toBeGreaterThanOrEqual(3);
    expect(spitze).toBeLessThanOrEqual(7);
  });
});

describe('Hallenfläche bestimmt die erzeugte Halle', () => {
  // Vorher wurde die Fläche gar nicht verwendet: 50.000 m² ergaben 90 × 31,5 m = 2.835 m².
  for (const flaeche of [2000, 5000, 12000, 50000]) {
    it(`${flaeche} m² ergibt eine Halle von rund ${flaeche} m²`, () => {
      const recs = generateRecordsFromEckdaten(eck(4000, flaeche));
      const { hall } = generateAutoLayout(recs, { flaecheQm: flaeche });
      const ist = hall.width * hall.height;
      expect(ist / flaeche).toBeGreaterThan(0.95);
      expect(ist / flaeche).toBeLessThan(1.05);
    });
  }

  it('hält die Tiefe im realistischen Bereich', () => {
    const recs = generateRecordsFromEckdaten(eck(4000, 50000));
    const { hall } = generateAutoLayout(recs, { flaecheQm: 50000 });
    expect(hall.height).toBeGreaterThanOrEqual(30);
    expect(hall.height).toBeLessThanOrEqual(80);
  });

  it('macht die Halle nie schmaler als die Torreihe es braucht', () => {
    // 80 Tore auf zwei Wände = 40 je Wand à 4,5 m = 180 m Mindestlänge,
    // die angegebene Fläche wäre mit 30 m Tiefe nur 100 m lang.
    const recs = generateRecordsFromEckdaten(eck(4000, 3000, 80));
    const { hall } = generateAutoLayout(recs, { flaecheQm: 3000 });
    expect(hall.width).toBeGreaterThanOrEqual(180);
  });

  it('ohne Flächenangabe bleibt die bisherige Schätzung', () => {
    const recs = generateRecordsFromEckdaten(eck(4000, 5000));
    const { hall } = generateAutoLayout(recs);
    expect(hall.width).toBeGreaterThan(0);
    expect(hall.height).toBeGreaterThanOrEqual(30);
  });
});

describe('Demo-Daten bleiben unangetastet', () => {
  it('die Vorlage liefert weiterhin plausible Mengen', () => {
    const { records, eckdaten } = generateDemoRecords();
    const tage = new Set(records.map((r) => r.scandatum)).size;
    const proTag = summeColli(records) / tage;
    expect(proTag).toBeGreaterThan(eckdaten.colliProTag * 0.9);
    expect(proTag).toBeLessThan(eckdaten.colliProTag * 1.1);
  });
});
