import { describe, it, expect } from 'vitest';
import { berechneMinProColli } from './prozessrechner';
import {
  PROZESSMODELL_GEIS_NUERNBERG,
  GEIS_NUERNBERG_SE_PARAMETER,
} from './data/prozessmodell-geis-nuernberg';
import {
  PROZESSMODELL_NOERPEL_ULM,
  NOERPEL_ULM_SE_PARAMETER,
} from './data/prozessmodell-noerpel-ulm';

/**
 * Validierungs-Tests gegen echte Beratungsprojekte.
 * Commit e8f64637 (2026-03-16) hat beide Modelle mit Δ 0.0% gegen die manuellen
 * Referenzwerte validiert. Diese Tests fangen Regressionen der Kalibrier-Methodik.
 */

describe('Kunden-Validierung: Geis TuL Nürnberg (SE)', () => {
  it('liefert 1.95 Min/Colli ±0.5% (manuelle Referenz 2014)', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_GEIS_NUERNBERG, GEIS_NUERNBERG_SE_PARAMETER);
    expect(ergebnis.minProColli).toBeGreaterThan(1.94);
    expect(ergebnis.minProColli).toBeLessThan(1.96);
  });

  it('Abteilungen: Entlader ~0.79 + Scanner ~0.61 + Verteiler ~0.55', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_GEIS_NUERNBERG, GEIS_NUERNBERG_SE_PARAMETER);
    const entlader = ergebnis.abteilungen.find((a) => a.abteilung === 'entlader');
    const scanner = ergebnis.abteilungen.find((a) => a.abteilung === 'scanner');
    const verteiler = ergebnis.abteilungen.find((a) => a.abteilung === 'verteiler');
    expect(entlader?.minProColli).toBeCloseTo(0.79, 1);
    expect(scanner?.minProColli).toBeCloseTo(0.61, 1);
    expect(verteiler?.minProColli).toBeCloseTo(0.55, 1);
  });
});

describe('Kunden-Validierung: Nörpel Ulm (SE)', () => {
  it('liefert 2.19 Min/Colli ±0.5% (manuelle Referenz 2016)', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_NOERPEL_ULM, NOERPEL_ULM_SE_PARAMETER);
    expect(ergebnis.minProColli).toBeGreaterThan(2.18);
    expect(ergebnis.minProColli).toBeLessThan(2.20);
  });

  it('Abteilungen: Entlader ~1.11 + Scanner ~0.13 + Verteiler ~0.95', () => {
    const ergebnis = berechneMinProColli(PROZESSMODELL_NOERPEL_ULM, NOERPEL_ULM_SE_PARAMETER);
    const entlader = ergebnis.abteilungen.find((a) => a.abteilung === 'entlader');
    const scanner = ergebnis.abteilungen.find((a) => a.abteilung === 'scanner');
    const verteiler = ergebnis.abteilungen.find((a) => a.abteilung === 'verteiler');
    expect(entlader?.minProColli).toBeCloseTo(1.11, 1);
    expect(scanner?.minProColli).toBeCloseTo(0.13, 1);
    expect(verteiler?.minProColli).toBeCloseTo(0.95, 1);
  });
});
