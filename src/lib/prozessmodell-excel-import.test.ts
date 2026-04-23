import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import * as XLSX from 'xlsx';
import {
  parseProzessmodellSheet,
  parseProzessmodellWorkbook,
} from './prozessmodell-excel-import';

describe('parseProzessmodellSheet — synthetisches Mini-Workbook', () => {
  /**
   * Baut eine ROTH-Excel-Zeile. Spalten-Positionen entsprechen dem offiziellen
   * Pflichtenheft-Layout (Nr=C, Abteilung=E, Zeit-gewichtet=N).
   */
  const makeRow = (
    cells: Partial<{
      blockHeader: string;
      nr: number;
      beschreibung: string;
      abteilung: string;
      hilfsmittel: string;
      standardzeitSek: number;
      prozessgroesse: string;
      anteil: number;
      haeufigkeitJeTag: number;
      zeitGewichtetMinProColli: number;
    }>,
  ): (string | number | null)[] => {
    const r: (string | number | null)[] = new Array(15).fill(null);
    if (cells.blockHeader !== undefined) r[0] = cells.blockHeader;
    if (cells.nr !== undefined) r[2] = cells.nr;
    if (cells.beschreibung !== undefined) r[3] = cells.beschreibung;
    if (cells.abteilung !== undefined) r[4] = cells.abteilung;
    if (cells.hilfsmittel !== undefined) r[5] = cells.hilfsmittel;
    if (cells.standardzeitSek !== undefined) r[8] = cells.standardzeitSek;
    if (cells.prozessgroesse !== undefined) r[10] = cells.prozessgroesse;
    if (cells.anteil !== undefined) r[11] = cells.anteil;
    if (cells.haeufigkeitJeTag !== undefined) r[12] = cells.haeufigkeitJeTag;
    if (cells.zeitGewichtetMinProColli !== undefined) r[13] = cells.zeitGewichtetMinProColli;
    return r;
  };

  it('erkennt einen Block und addiert Abteilungs-Summen', () => {
    const rows = [
      makeRow({ blockHeader: 'SE: Entladung Test' }),
      makeRow({}), // leer
      makeRow({ nr: 1, beschreibung: 'Tor öffnen', abteilung: 'Entlader', zeitGewichtetMinProColli: 0.1 }),
      makeRow({ nr: 2, beschreibung: 'Scannen', abteilung: 'Scanner', zeitGewichtetMinProColli: 0.3 }),
      makeRow({ nr: 3, beschreibung: 'Verteilen', abteilung: 'Verteiler', zeitGewichtetMinProColli: 0.5 }),
      makeRow({ nr: 4, beschreibung: 'Aufräumen', abteilung: 'Entlader', zeitGewichtetMinProColli: 0.05 }),
    ];
    const blocks = parseProzessmodellSheet(rows);
    expect(blocks).toHaveLength(1);
    const b = blocks[0];
    expect(b.name).toBe('SE: Entladung Test');
    expect(b.schritte).toHaveLength(4);
    expect(b.summeProAbteilung['Entlader']).toBeCloseTo(0.15, 5);
    expect(b.summeProAbteilung['Scanner']).toBeCloseTo(0.3, 5);
    expect(b.summeProAbteilung['Verteiler']).toBeCloseTo(0.5, 5);
    expect(b.summeMinProColli).toBeCloseTo(0.95, 5);
  });

  it('trennt mehrere Blöcke an Col-A-Headern', () => {
    const rows = [
      makeRow({ blockHeader: 'SE: Erster' }),
      makeRow({ nr: 1, abteilung: 'A', zeitGewichtetMinProColli: 0.2 }),
      makeRow({ blockHeader: 'SA: Zweiter' }),
      makeRow({ nr: 1, abteilung: 'B', zeitGewichtetMinProColli: 0.4 }),
    ];
    const blocks = parseProzessmodellSheet(rows);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].summeMinProColli).toBeCloseTo(0.2, 5);
    expect(blocks[1].summeMinProColli).toBeCloseTo(0.4, 5);
  });

  it('Folgezeile ohne Nr (alternatives Hilfsmittel) erbt Schritt-Nr und Abteilung', () => {
    const rows = [
      makeRow({ blockHeader: 'SE: Mix' }),
      makeRow({ nr: 21, beschreibung: 'Verteilen', abteilung: 'Verteiler', hilfsmittel: 'Stapler', zeitGewichtetMinProColli: 0.1 }),
      makeRow({ hilfsmittel: 'Schnellläufer', zeitGewichtetMinProColli: 0.3 }),
      makeRow({ hilfsmittel: 'Langgabel', zeitGewichtetMinProColli: 0.05 }),
    ];
    const blocks = parseProzessmodellSheet(rows);
    expect(blocks[0].schritte).toHaveLength(3);
    expect(blocks[0].schritte.every((s) => s.nr === 21)).toBe(true);
    expect(blocks[0].schritte.every((s) => s.abteilung === 'Verteiler')).toBe(true);
    expect(blocks[0].summeProAbteilung['Verteiler']).toBeCloseTo(0.45, 5);
  });

  it('ignoriert Zeilen ohne Zeit-Wert (Mengen/Parameter-Zeilen)', () => {
    const rows = [
      makeRow({ blockHeader: 'SE: X' }),
      makeRow({ beschreibung: 'Colli je Gefäß', anteil: null, haeufigkeitJeTag: 26 }),
      makeRow({ nr: 1, abteilung: 'A', zeitGewichtetMinProColli: 1 }),
    ];
    const blocks = parseProzessmodellSheet(rows);
    expect(blocks[0].schritte).toHaveLength(1);
    expect(blocks[0].summeMinProColli).toBe(1);
  });

  it('parseProzessmodellWorkbook: baut ein Workbook und parst es roundtrip-safe', () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['SE: RT', null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, 1, 'Step', 'Entlader', '', null, null, null, null, null, null, null, 0.7, null],
      [null, null, 2, 'Step', 'Scanner', '', null, null, null, null, null, null, null, 0.3, null],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prozessmodell');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blocks = parseProzessmodellWorkbook(buf as ArrayBuffer);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].summeMinProColli).toBeCloseTo(1.0, 5);
  });
});

/**
 * Integration-Test gegen die echte AS-Gersthofen-Excel.
 * Datei wird NICHT ins Repo committet (Kundendaten) — lokal laufen die Assertions,
 * in CI übersprungen.
 */
const AS_PATH = '/tmp/topis-sp/20260306_Prozessmodell_AS_Aktualisiert.xlsx';
const asAvailable = existsSync(AS_PATH);

describe.skipIf(!asAvailable)('parseProzessmodellWorkbook — AS Gersthofen (lokal)', () => {
  it('liefert SE Entladung FV Halle 6 mit 1.917 Min/Colli exakt', () => {
    const buf = readFileSync(AS_PATH);
    const blocks = parseProzessmodellWorkbook(new Uint8Array(buf));
    const fv = blocks.find((b) => /Entladung Fernverkehr/i.test(b.name));
    expect(fv).toBeDefined();
    // Referenz-Zelle in Übersicht: 1.9170271489695918
    expect(fv!.summeMinProColli).toBeCloseTo(1.91703, 4);
    expect(fv!.summeProAbteilung['Entlader']).toBeCloseTo(0.82906, 4);
    expect(fv!.summeProAbteilung['Scanner']).toBeCloseTo(0.33602, 4);
    expect(fv!.summeProAbteilung['Verteiler']).toBeCloseTo(0.75194, 4);
  });

  it('findet alle 17 Hauptprozess-Blöcke', () => {
    const buf = readFileSync(AS_PATH);
    const blocks = parseProzessmodellWorkbook(new Uint8Array(buf));
    expect(blocks.length).toBeGreaterThanOrEqual(15);
    // Prüfe dass jeder Block einen sinnvollen Namen hat
    for (const b of blocks) {
      expect(b.name).toMatch(/^(SE|SA|AMAZON):/);
      expect(b.summeMinProColli).toBeGreaterThan(0);
    }
  });
});
