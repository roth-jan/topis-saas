import { describe, it, expect } from 'vitest';
import {
  extractKennzahlen,
  monatSortKey,
  sortiereMonate,
  berechneTrend,
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

function monatStub(monat: string, maStunden: number): CloudProzessmodellMonat {
  return {
    id: monat,
    owner: 'u1',
    monat,
    dateiname: `${monat}.xlsx`,
    datei_pfad: `u1/${monat.replace('/', '-')}.xlsx`,
    kennzahlen: { maStundenProzesse: maStunden } as ProzessKennzahlen,
    created_at: '',
    updated_at: '',
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
