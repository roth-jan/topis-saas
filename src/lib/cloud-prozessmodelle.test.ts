import { describe, it, expect } from 'vitest';
import {
  extractKennzahlen,
  monatSortKey,
  sortiereMonate,
  berechneTrend,
  gruppiereNachKunde,
  type CloudProzessmodellMonat,
  type ProzessKennzahlen,
} from './cloud-prozessmodelle';
import type { AsProzessModell } from './prozessmodell-excel-modell';

function modellStub(maStunden: number, monat = '06/2026'): AsProzessModell {
  return {
    bloecke: [
      {
        name: 'SE: Entladung Fernverkehr',
        startRow: 3,
        headerRow: 49,
        endRow: 84,
        mengen: [],
        parameter: [],
        schritte: [],
        minProColli: 2.1448,
        proAbteilung: { Entlader: 0.83, Scanner: 0.33, Verteiler: 0.98 },
      },
    ],
    uebersicht: [
      {
        titel: 'Sammelguteingang',
        prozesse: [{ name: 'SE: Entladung FV', menge: 56780, minProColli: 2.1448, maStunden }],
        sonstige: [],
        summeProzesse: maStunden,
      },
    ],
    arbeitsminutenJeStunde: 52.9,
    maStundenProzesse: maStunden,
    monat,
  };
}

function monatStub(monat: string, maStunden: number, owner = 'u1', ownerEmail?: string): CloudProzessmodellMonat {
  return {
    id: `${owner}-${monat}`,
    owner,
    monat,
    dateiname: `${monat}.xlsx`,
    datei_pfad: `${owner}/${monat.replace('/', '-')}.xlsx`,
    kennzahlen: { maStundenProzesse: maStunden } as ProzessKennzahlen,
    modell: null,
    created_at: '',
    updated_at: '',
    owner_email: ownerEmail,
  };
}

describe('extractKennzahlen', () => {
  it('übernimmt MA-Stunden, Sektionen und Block-Splits', () => {
    const k = extractKennzahlen(modellStub(6375.9));
    expect(k.maStundenProzesse).toBe(6375.9);
    expect(k.sektionen[0].titel).toBe('Sammelguteingang');
    expect(k.sektionen[0].prozesse[0].maStunden).toBe(6375.9);
    expect(k.bloecke[0].proAbteilung['Verteiler']).toBe(0.98);
  });

  it('kopiert proAbteilung (keine Referenz auf das Modell)', () => {
    const m = modellStub(100);
    const k = extractKennzahlen(m);
    k.bloecke[0].proAbteilung['Entlader'] = 999;
    expect(m.bloecke[0].proAbteilung['Entlader']).toBe(0.83);
  });
});

describe('normalisiereMonat (Review-Fund #21)', () => {
  it('füllt einstellige Monate auf, trimmt, lässt Unklares unverändert', async () => {
    const { normalisiereMonat } = await import('./cloud-prozessmodelle');
    expect(normalisiereMonat('7/2026')).toBe('07/2026');
    expect(normalisiereMonat(' 07/2026 ')).toBe('07/2026');
    expect(normalisiereMonat('12/2026')).toBe('12/2026');
    expect(normalisiereMonat('Q3')).toBe('Q3');
  });
});

describe('monatSortKey / sortiereMonate', () => {
  it('sortiert MM/YYYY chronologisch über Jahresgrenzen', () => {
    const sorted = sortiereMonate([monatStub('01/2027', 1), monatStub('06/2026', 2), monatStub('12/2026', 3)]);
    expect(sorted.map((m) => m.monat)).toEqual(['06/2026', '12/2026', '01/2027']);
  });

  it('einstellige Monate werden korrekt eingeordnet', () => {
    expect(monatSortKey('6/2026')).toBe('2026-06');
    expect(monatSortKey('11/2026') > monatSortKey('6/2026')).toBe(true);
  });

  it('unbekanntes Format landet am Ende statt zu crashen', () => {
    const sorted = sortiereMonate([monatStub('Quartal 3', 1), monatStub('06/2026', 2)]);
    expect(sorted[0].monat).toBe('06/2026');
  });
});

describe('berechneTrend', () => {
  it('liefert Delta zum Vormonat, erster Monat null', () => {
    const trend = berechneTrend([monatStub('07/2026', 6100), monatStub('06/2026', 6375.9)]);
    expect(trend[0]).toEqual({ monat: '06/2026', maStunden: 6375.9, deltaVormonat: null });
    expect(trend[1].monat).toBe('07/2026');
    expect(trend[1].deltaVormonat).toBeCloseTo(-275.9, 5);
  });
});

describe('gruppiereNachKunde (Berater-Sicht)', () => {
  it('eigene Gruppe zuerst, Kunden alphabetisch danach', () => {
    const gruppen = gruppiereNachKunde(
      [
        monatStub('06/2026', 100, 'kunde-b', 'zeta@kunde.de'),
        monatStub('06/2026', 200, 'ich'),
        monatStub('06/2026', 300, 'kunde-a', 'alpha@kunde.de'),
      ],
      'ich',
    );
    expect(gruppen.map((g) => g.label)).toEqual(['Meine Monate', 'alpha@kunde.de', 'zeta@kunde.de']);
    expect(gruppen[0].eigene).toBe(true);
  });

  it('Nicht-Berater: genau eine eigene Gruppe', () => {
    const gruppen = gruppiereNachKunde([monatStub('06/2026', 1, 'ich'), monatStub('07/2026', 2, 'ich')], 'ich');
    expect(gruppen).toHaveLength(1);
    expect(gruppen[0].eigene).toBe(true);
    expect(gruppen[0].monate.map((m) => m.monat)).toEqual(['06/2026', '07/2026']);
  });

  it('fehlende E-Mail → Kunden-Kürzel statt Crash', () => {
    const gruppen = gruppiereNachKunde([monatStub('06/2026', 1, 'abcdef1234567890')], 'ich');
    expect(gruppen[0].label).toBe('Kunde abcdef12');
  });
});
