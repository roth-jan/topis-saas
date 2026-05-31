/**
 * Tests für den CSV-Import des Mengen-Modells (Lastenheft 3.2.1).
 *
 * Format: prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar
 *
 * Erwartetes Verhalten:
 *  - Header-Zeile wird erkannt + übersprungen
 *  - Komma als Dezimaltrenner wird akzeptiert
 *  - Ungültige Packstück-Typen → Skip + Warnung
 *  - 'append': hängt an
 *  - 'replace': ersetzt nur die in CSV genannten Prozesse, andere bleiben
 */

import { describe, expect, it } from 'vitest';
import {
  importMengenFromCsv,
  exportMengenAsCsv,
  type MengenSlice,
} from './mengen-store-actions';
import type { MengenEintrag } from '@/types/topis';

function emptySlice(): MengenSlice {
  return {
    prozesskategorien: [],
    prozesskategorieIdCounter: 1,
    mengenEintraege: [],
    mengenEintragIdCounter: 1,
  };
}

function sliceWithEntries(entries: MengenEintrag[]): MengenSlice {
  const maxId = entries.reduce((m, e) => Math.max(m, e.id), 0);
  return {
    prozesskategorien: [],
    prozesskategorieIdCounter: 1,
    mengenEintraege: entries,
    mengenEintragIdCounter: maxId + 1,
  };
}

describe('importMengenFromCsv', () => {
  it('erkennt + überspringt die Header-Zeile', () => {
    const csv = [
      'prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar',
      'SE;Entladen;EZ1-Tor10;5;palette;1,2;0,8;1,1;ja',
    ].join('\n');
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.patch.mengenEintraege).toHaveLength(1);
    expect(result.patch.mengenEintraege[0].prozess).toBe('SE');
  });

  it('verarbeitet CSV ohne Header-Zeile (autodetect)', () => {
    const csv = 'SE;Entladen;EZ1-Tor10;5;palette;1,2;0,8;1,1;ja';
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(1);
    expect(result.patch.mengenEintraege[0].relation).toBe('EZ1-Tor10');
  });

  it('akzeptiert Komma als Dezimaltrenner (deutscher CSV-Standard)', () => {
    const csv = [
      'prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar',
      'SE;;Tor1;3,50;palette;1,20;0,80;1,10;ja',
    ].join('\n');
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(1);
    const e = result.patch.mengenEintraege[0];
    expect(e.anzahl).toBeCloseTo(3.5, 5);
    expect(e.laenge).toBeCloseTo(1.2, 5);
    expect(e.breite).toBeCloseTo(0.8, 5);
    expect(e.hoehe).toBeCloseTo(1.1, 5);
  });

  it('akzeptiert auch Punkt als Dezimaltrenner', () => {
    const csv = [
      'prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar',
      'SE;;Tor2;7.25;palette;1.20;0.80;1.10;nein',
    ].join('\n');
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(1);
    const e = result.patch.mengenEintraege[0];
    expect(e.anzahl).toBeCloseTo(7.25, 5);
    expect(e.laenge).toBeCloseTo(1.2, 5);
    expect(e.stapelbar).toBe(false);
  });

  it('rundet Anzahl auf 2 Nachkommastellen (Lastenheft 3.2.1)', () => {
    const csv = 'SE;;Tor1;3,12345;palette;;;;';
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(1);
    expect(result.patch.mengenEintraege[0].anzahl).toBe(3.12);
  });

  it('überspringt Zeilen mit ungültigem Packstück-Typ und warnt', () => {
    const csv = [
      'prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar',
      'SE;;Tor1;5;palette;;;;',
      'SE;;Tor2;3;FANTASIE-TYP;;;;',
      'SE;;Tor3;2;colli;;;;',
    ].join('\n');
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/FANTASIE-TYP/);
    expect(result.patch.mengenEintraege.map((m) => m.relation)).toEqual(['Tor1', 'Tor3']);
  });

  it('Append-Modus: hängt neue Einträge an', () => {
    const existing: MengenEintrag = {
      id: 1, prozess: 'SE', relation: 'AltTor', anzahl: 99, typ: 'palette',
    };
    const slice = sliceWithEntries([existing]);
    const csv = 'SE;;NeuTor;5;palette;;;;';
    const result = importMengenFromCsv(slice, csv, 'append');
    expect(result.patch.mengenEintraege).toHaveLength(2);
    expect(result.patch.mengenEintraege[0]).toEqual(existing);
    expect(result.patch.mengenEintraege[1].relation).toBe('NeuTor');
    expect(result.patch.mengenEintraege[1].id).toBe(2);
  });

  it('Replace-Modus: ersetzt nur Einträge der in CSV genannten Prozesskategorien', () => {
    const existing: MengenEintrag[] = [
      { id: 1, prozess: 'SE', relation: 'AltSE-A', anzahl: 10, typ: 'palette' },
      { id: 2, prozess: 'SE', relation: 'AltSE-B', anzahl: 20, typ: 'palette' },
      { id: 3, prozess: 'SA', relation: 'AltSA-1', anzahl: 30, typ: 'colli' },
    ];
    const slice = sliceWithEntries(existing);
    const csv = [
      'prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar',
      'SE;;NeuSE;5;palette;;;;',
    ].join('\n');
    const result = importMengenFromCsv(slice, csv, 'replace');
    expect(result.imported).toBe(1);
    expect(result.ersetzteProzesse).toEqual(['SE']);
    // SE-Einträge weg, SA bleibt, neuer SE-Eintrag angehängt
    expect(result.patch.mengenEintraege).toHaveLength(2);
    const prozesse = result.patch.mengenEintraege.map((m) => m.prozess).sort();
    expect(prozesse).toEqual(['SA', 'SE']);
    const sa = result.patch.mengenEintraege.find((m) => m.prozess === 'SA');
    expect(sa?.relation).toBe('AltSA-1');
    const se = result.patch.mengenEintraege.find((m) => m.prozess === 'SE');
    expect(se?.relation).toBe('NeuSE');
  });

  it('Replace-Modus mit mehreren Prozessen ersetzt jeden gelisteten', () => {
    const existing: MengenEintrag[] = [
      { id: 1, prozess: 'SE', relation: 'A', anzahl: 1, typ: 'palette' },
      { id: 2, prozess: 'SA', relation: 'B', anzahl: 2, typ: 'palette' },
      { id: 3, prozess: 'Wareneingang', relation: 'C', anzahl: 3, typ: 'palette' },
    ];
    const slice = sliceWithEntries(existing);
    const csv = [
      'SE;;X;1;palette;;;;',
      'SA;;Y;2;colli;;;;',
    ].join('\n');
    const result = importMengenFromCsv(slice, csv, 'replace');
    expect(result.patch.mengenEintraege).toHaveLength(3);
    expect(result.patch.mengenEintraege.find((m) => m.prozess === 'Wareneingang')?.relation).toBe('C');
    expect(result.patch.mengenEintraege.find((m) => m.prozess === 'SE')?.relation).toBe('X');
    expect(result.patch.mengenEintraege.find((m) => m.prozess === 'SA')?.relation).toBe('Y');
  });

  it('parst stapelbar-Spalte in verschiedenen Schreibweisen', () => {
    const csv = [
      'SE;;A;1;palette;;;;ja',
      'SE;;B;1;palette;;;;nein',
      'SE;;C;1;palette;;;;true',
      'SE;;D;1;palette;;;;0',
      'SE;;E;1;palette;;;;',
    ].join('\n');
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(5);
    const e = result.patch.mengenEintraege;
    expect(e.find((m) => m.relation === 'A')?.stapelbar).toBe(true);
    expect(e.find((m) => m.relation === 'B')?.stapelbar).toBe(false);
    expect(e.find((m) => m.relation === 'C')?.stapelbar).toBe(true);
    expect(e.find((m) => m.relation === 'D')?.stapelbar).toBe(false);
    expect(e.find((m) => m.relation === 'E')?.stapelbar).toBeUndefined();
  });

  it('warnt bei fehlender Anzahl + Pflichtfeldern und überspringt', () => {
    const csv = [
      ';Subp;Rel;5;palette;;;;',
      'SE;;;5;palette;;;;',
      'SE;;Tor;keine-zahl;palette;;;;',
    ].join('\n');
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(3);
    expect(result.warnings).toHaveLength(3);
  });

  it('leere CSV liefert leeren Patch + Warnung', () => {
    const result = importMengenFromCsv(emptySlice(), '   \n\n  ', 'append');
    expect(result.imported).toBe(0);
    expect(result.warnings[0]).toMatch(/Leere CSV/);
  });

  it('Export → Re-Import liefert äquivalente Einträge (Roundtrip)', () => {
    const original: MengenEintrag[] = [
      { id: 1, prozess: 'SE', subprozess: 'Entladen', relation: 'EZ1-Tor10', anzahl: 5.5, typ: 'palette', laenge: 1.2, breite: 0.8, hoehe: 1.1, stapelbar: true },
      { id: 2, prozess: 'SA', relation: 'Tor20', anzahl: 3, typ: 'colli' },
    ];
    const csv = exportMengenAsCsv(original);
    const result = importMengenFromCsv(emptySlice(), csv, 'append');
    expect(result.imported).toBe(2);
    const r0 = result.patch.mengenEintraege[0];
    expect(r0.prozess).toBe('SE');
    expect(r0.subprozess).toBe('Entladen');
    expect(r0.relation).toBe('EZ1-Tor10');
    expect(r0.anzahl).toBeCloseTo(5.5, 5);
    expect(r0.typ).toBe('palette');
    expect(r0.laenge).toBeCloseTo(1.2, 5);
    expect(r0.stapelbar).toBe(true);
    const r1 = result.patch.mengenEintraege[1];
    expect(r1.prozess).toBe('SA');
    expect(r1.subprozess).toBeUndefined();
    expect(r1.typ).toBe('colli');
  });
});
