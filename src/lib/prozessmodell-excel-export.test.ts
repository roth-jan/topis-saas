import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { unzipSync, strFromU8 } from 'fflate';
import { exportiereMitOverrides } from './prozessmodell-excel-export';
import { ProzessWorkbook } from './prozessmodell-excel-engine';
import { buildAsModell } from './prozessmodell-excel-modell';

/** Synthetische Mappe: Konstante + Formel, wie die echten Input-Zellen. */
function syntheticXlsx(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const daten = XLSX.utils.aoa_to_sheet([
    ['Label', 'Wert'],
    ['Colli', 1000],
  ]);
  const modell = XLSX.utils.aoa_to_sheet([['Ergebnis']]);
  modell['A2'] = { t: 'n', f: 'Dateneingabe!B2*2', v: 2000 };
  modell['!ref'] = 'A1:A2';
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['x']]), 'Übersicht');
  XLSX.utils.book_append_sheet(wb, daten, 'Dateneingabe');
  XLSX.utils.book_append_sheet(wb, modell, 'Modell');
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return out;
}

describe('exportiereMitOverrides (Zip-Patch)', () => {
  it('ersetzt den Konstanten-Wert, Formeln bleiben erhalten', () => {
    const buf = syntheticXlsx();
    const { datei, ersetzteZellen, nichtGefunden } = exportiereMitOverrides(buf, [
      { sheet: 'Dateneingabe', addr: 'B2', value: 5555 },
    ]);
    expect(ersetzteZellen).toBe(1);
    expect(nichtGefunden).toHaveLength(0);

    const re = XLSX.read(datei, { cellFormula: true });
    expect(re.Sheets['Dateneingabe']['B2'].v).toBe(5555);
    // Formel unangetastet
    expect(re.Sheets['Modell']['A2'].f).toBe('Dateneingabe!B2*2');
    // Neuberechnung beim Öffnen erzwungen (direkt im Workbook-XML prüfen)
    const entpackt = unzipSync(datei);
    expect(strFromU8(entpackt['xl/workbook.xml'])).toContain('fullCalcOnLoad="1"');
  });

  it('meldet unauffindbare Zellen statt sie zu verschlucken', () => {
    const { ersetzteZellen, nichtGefunden } = exportiereMitOverrides(syntheticXlsx(), [
      { sheet: 'Dateneingabe', addr: 'Z99', value: 1 },
      { sheet: 'GibtEsNicht', addr: 'A1', value: 1 },
    ]);
    expect(ersetzteZellen).toBe(0);
    expect(nichtGefunden).toHaveLength(2);
  });

  it('ohne Overrides bleibt der Inhalt unverändert lesbar', () => {
    const { datei, ersetzteZellen } = exportiereMitOverrides(syntheticXlsx(), []);
    expect(ersetzteZellen).toBe(0);
    const re = XLSX.read(datei, { cellFormula: true });
    expect(re.Sheets['Dateneingabe']['B2'].v).toBe(1000);
  });
});

// --- Integration gegen die echte Beintner-Excel (Kundendaten, nicht im Repo) ---
const CANDIDATES = [
  process.env.TOPIS_AS_XLSX,
  join(homedir(), '.openclaw/workspace/topis/prozessmodell-engine/2026-06.xlsx'),
].filter(Boolean) as string[];
const XLSX_PATH = CANDIDATES.find((p) => existsSync(p));

describe.skipIf(!XLSX_PATH)('Export-Roundtrip mit echter AS-Excel', () => {
  it('Colli-Override exportieren → neu einlesen → Engine rechnet den neuen Stand', () => {
    const buf = toArrayBuffer(readFileSync(XLSX_PATH!));
    const wb = ProzessWorkbook.fromArrayBuffer(buf);
    const vorher = buildAsModell(wb);
    const colli = vorher.bloecke[0].mengen.find((m) => m.name === 'Colli')!;
    expect(colli.origin).toBeTruthy();

    // Override setzen wie im UI, dann exportieren
    wb.setOverride(colli.origin!.sheet, colli.origin!.addr, 99999);
    const { datei, ersetzteZellen, nichtGefunden } = exportiereMitOverrides(buf, wb.listOverrides());
    expect(ersetzteZellen).toBe(1);
    expect(nichtGefunden).toHaveLength(0);

    // Reimport: die exportierte Datei muss OHNE Overrides den neuen Wert rechnen
    const wb2 = ProzessWorkbook.fromArrayBuffer(toArrayBuffer(Buffer.from(datei)));
    const nachher = buildAsModell(wb2);
    const colli2 = nachher.bloecke[0].mengen.find((m) => m.name === 'Colli')!;
    expect(colli2.wert).toBe(99999);
    // MA-Stunden folgen dem neuen Wert (mehr Colli → mehr Stunden als 6376)
    expect(nachher.maStundenProzesse).toBeGreaterThan(vorher.maStundenProzesse);
    // Alle 18 Blöcke weiterhin da (nichts strukturell beschädigt)
    expect(nachher.bloecke).toHaveLength(18);
  });
});

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
