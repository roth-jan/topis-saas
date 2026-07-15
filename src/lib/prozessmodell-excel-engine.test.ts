import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ProzessWorkbook } from './prozessmodell-excel-engine';
import { buildAsModell } from './prozessmodell-excel-modell';

/**
 * Verifikation der rechnenden AS-Prozessmodell-Engine gegen die Python-Referenz
 * (`address_engine.py`): alle 18 Blöcke Δ = 0 (Min/Colli) + MA-Stundenbedarf Σ 6375,9 h.
 *
 * Die Beintner-Excel (`2026-06.xlsx`) ist KUNDENDATEN und wird NICHT ins Repo committet.
 * Lokal (Datei vorhanden) laufen die Assertions, in CI werden sie übersprungen.
 */
const CANDIDATES = [
  process.env.TOPIS_AS_XLSX,
  join(homedir(), '.openclaw/workspace/topis/prozessmodell-engine/2026-06.xlsx'),
  '/tmp/topis-sp/2026-06.xlsx',
].filter(Boolean) as string[];
const XLSX_PATH = CANDIDATES.find((p) => existsSync(p));

/** Erwartungswerte aus `address_engine.py` (Δ = 0 gegen die Excel-Endzahlen). */
const ERWARTET_MIN_COLLI: [string, number][] = [
  ['Entladung Fernverkehr', 2.144761],
  ['Entladung Malta', 2.492245],
  ['Entladung Italien', 1.835948],
  ['Beladung Shuttle für Halle 1A', 0.0],
  ['Entladung Shuttle für Halle 1A', 0.0],
  ['Verteilung auf Relationsplätze', 0.0],
  ['Beladung kleiner NV', 0.665302],
  ['Beladung großer NV', 2.184615],
  ['Entladung kleiner NV (Standard)', 1.275120],
  ['Entladung kleiner NV (Zusatz Kunde)', 1.241141],
  ['Entladung großer NV (Standard)', 1.779642],
  ['Entladung großer NV (Zusatz Kunde)', 1.976311],
  ['Entladung Hofbrücken Logistik', 1.763779],
  ['Überhanghandling', 1.983005],
  ['Beladung FV', 1.298175],
  ['Beladung Shuttle in Halle 6', -0.776668],
  ['Entladung Shuttle in Halle 1', 4.199156],
  ['Beladung Kunden-WAB', 40.456573],
];

describe.skipIf(!XLSX_PATH)('AS-Prozessmodell-Engine (rechnet aus Rohdaten)', () => {
  const load = () => ProzessWorkbook.fromArrayBuffer(toArrayBuffer(readFileSync(XLSX_PATH!)));

  it('erkennt alle 18 Prozessblöcke', () => {
    const modell = buildAsModell(load());
    expect(modell.bloecke.length).toBe(18);
  });

  it('reproduziert alle 18 Block-Min/Colli exakt (Δ < 1e-4)', () => {
    const modell = buildAsModell(load());
    for (let i = 0; i < ERWARTET_MIN_COLLI.length; i++) {
      const [teil, soll] = ERWARTET_MIN_COLLI[i];
      const blk = modell.bloecke[i];
      expect(blk.name).toContain(teil.split(' (')[0].slice(0, 12));
      expect(Math.abs(blk.minProColli - soll)).toBeLessThan(1e-4);
    }
  });

  it('reproduziert den MA-Stundenbedarf (Prozesse) Σ 6375,9 h (Δ < 0,05)', () => {
    const modell = buildAsModell(load());
    expect(Math.abs(modell.maStundenProzesse - 6375.891782)).toBeLessThan(0.05);
  });

  it('splittet Min/Colli je Abteilung (Entladung FV: Summe der Teile = Block)', () => {
    const modell = buildAsModell(load());
    const fv = modell.bloecke[0];
    const summeTeile = Object.values(fv.proAbteilung).reduce((a, b) => a + b, 0);
    expect(Math.abs(summeTeile - fv.minProColli)).toBeLessThan(1e-9);
  });

  it('rechnet bei geänderter Menge live neu (Colli verdoppeln senkt Min/Colli nicht linear, aber ändert MA-Stunden)', () => {
    const wb = load();
    const vorher = buildAsModell(wb);
    const fv0 = vorher.bloecke[0];
    const colli = fv0.mengen.find((m) => m.name === 'Colli');
    expect(colli?.origin).toBeTruthy();
    const maStundenVorher = vorher.uebersicht[0].prozesse[0].maStunden;
    // Colli verdoppeln → MA-Stunden Prozess 1 steigen (Menge × Min/Colli)
    wb.setOverride(colli!.origin!.sheet, colli!.origin!.addr, colli!.wert * 2);
    const nachher = buildAsModell(wb);
    const maStundenNachher = nachher.uebersicht[0].prozesse[0].maStunden;
    expect(maStundenNachher).toBeGreaterThan(maStundenVorher);
  });
});

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
