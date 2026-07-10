import { describe, it, expect } from 'vitest';
import {
  berechneMinProColli,
  berechneMABedarf,
  berechneWegzeit,
  ffzToMix,
} from './prozessrechner';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from './data/prozessmodell-se';
import type { FFZ } from '@/types/topis';

describe('berechneMinProColli — SE Referenz (AS Gersthofen)', () => {
  it('liefert gekapselte Baseline ~2.040 Min/Colli mit Standard-SE-Parametern', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    // Doku-Referenz AS Gersthofen: 1.917 (vor Zusatz-Schritten "Gefäß öffnen" + "Rampe andocken").
    // Aktuelle Baseline mit allen 12 Entlader-Steps: 2.040. Regression-Lock.
    expect(ergebnis.minProColli).toBeCloseTo(2.04, 1);
  });

  it('liefert drei Abteilungen (Entlader, Scanner, Verteiler) mit positiven Zeiten', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    expect(ergebnis.abteilungen).toHaveLength(3);
    const [entlader, scanner, verteiler] = ergebnis.abteilungen;
    expect(entlader.abteilung).toBe('entlader');
    expect(scanner.abteilung).toBe('scanner');
    expect(verteiler.abteilung).toBe('verteiler');
    for (const abt of ergebnis.abteilungen) {
      expect(abt.minProColli).toBeGreaterThan(0);
    }
  });

  it('Anteile summieren sich auf 1.0', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    const sum = ergebnis.abteilungen.reduce((s, a) => s + a.anteilGesamt, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('Verteilweg-Änderung propagiert (längerer Weg → höheres Min/Colli)', () => {
    const baseline = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    const doppelt = SE_STANDARD_PARAMETER.map((p) =>
      p.id === 'verteilweg' ? { ...p, aktuellerWert: 277.6 } : p,
    );
    const mitLangemWeg = berechneMinProColli(PROZESSMODELL_SE, doppelt);
    expect(mitLangemWeg.minProColli).toBeGreaterThan(baseline.minProColli);
  });

  it('FFZ-Mix überschreibt Fallback-Parameter', () => {
    const nurStapler: FFZ[] = [
      {
        id: 1,
        name: 'Stapler',
        geschwindigkeit: 2.86,
        colliProBewegung: 1.2,
        anteil: 1.0,
        mindestBreite: 2.5,
        typ: 'stapler',
      } as unknown as FFZ,
    ];
    const mix = ffzToMix(nurStapler);
    const ergebnis = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER, mix);
    expect(ergebnis.minProColli).toBeGreaterThan(0);
    // Stapler ist schneller (2.86 vs 2.44) → Wegzeit sinkt gegenüber Baseline.
    // Der Batch-Faktor bleibt in beiden Fällen der kalibrierte colliProFahrt (3.39).
    const baseline = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    expect(Math.abs(ergebnis.minProColli - baseline.minProColli)).toBeGreaterThan(0.01);
  });

  it('Mix-Pfad und Fallback-Pfad liegen bei Standardparametern nah beieinander', () => {
    // Der Default-Mix (80% Schnelläufer / 20% Stapler) darf die Kalibrierung nicht
    // verschieben: colliProFahrt (3.39) muss auch im Mix-Pfad als Batch-Faktor greifen.
    // Vor dem Fix teilte der Mix-Pfad nur durch colliProBewegung (1.4/1.2) →
    // Verteiler ~1.5 statt ~0.75 Min/Colli.
    const mitMix = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER, ffzToMix([]));
    const ohneMix = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    expect(Math.abs(mitMix.minProColli - ohneMix.minProColli)).toBeLessThan(0.05);
  });

  it('AS-2026-Demo-Parameter (Verteilweg 176m + Default-Mix) bleiben nahe der Kalibrierung', () => {
    // Entspricht den parameterOverrides der Demo-Halle (schmid-halle6-2026.ts).
    // Referenz 1.917 galt für 138.8m (2020); mit 176m (Anbau) sind ~2.17 plausibel.
    // Regression-Lock gegen den Drift, bei dem die Demo 3.286 Min/Colli anzeigte.
    const demoOverrides: Record<string, number> = {
      colliProTag: 3970,
      verteilweg: 176,
      schnellaeuferGeschwindigkeit: 2.44,
      colliProFahrt: 3.39,
      arbeitsminProStunde: 52.9,
      staplerGeschwindigkeit: 2.86,
    };
    const demoParameter = SE_STANDARD_PARAMETER.map((p) =>
      demoOverrides[p.id] !== undefined ? { ...p, aktuellerWert: demoOverrides[p.id] } : p,
    );
    const ergebnis = berechneMinProColli(PROZESSMODELL_SE, demoParameter, ffzToMix([]));
    expect(ergebnis.minProColli).toBeCloseTo(2.17, 1);
    const verteiler = ergebnis.abteilungen.find((a) => a.abteilung === 'verteiler')!;
    expect(verteiler.minProColli).toBeLessThan(1.0);
  });
});

describe('berechneMABedarf', () => {
  it('berechnet FTE aus Colli/Tag × Min/Colli / Arbeitsmin/Stunde / 8h', () => {
    const { stunden, fte } = berechneMABedarf(15000, 1.917, 52.9, 8);
    expect(stunden).toBeCloseTo((15000 * 1.917) / 52.9, 4);
    expect(fte).toBeCloseTo(stunden / 8, 4);
  });

  it('benutzt Defaults (52.9 min/h, 8h/Tag) wenn nicht übergeben', () => {
    const ohne = berechneMABedarf(15000, 1.917);
    const mit = berechneMABedarf(15000, 1.917, 52.9, 8);
    expect(ohne.fte).toBeCloseTo(mit.fte, 6);
  });
});

describe('berechneWegzeit', () => {
  it('gibt 0 zurück bei Geschwindigkeit ≤ 0 (Division-durch-0-Schutz)', () => {
    expect(berechneWegzeit(100, 0)).toBe(0);
    expect(berechneWegzeit(100, -1)).toBe(0);
  });

  it('Standard: 138.8m / 2.44 m/s ≈ 56.9 sek', () => {
    expect(berechneWegzeit(138.8, 2.44)).toBeCloseTo(56.9, 1);
  });
});
