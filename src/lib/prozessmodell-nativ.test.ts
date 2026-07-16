import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ProzessWorkbook } from './prozessmodell-excel-engine';
import { buildAsModell } from './prozessmodell-excel-modell';
import { konvertiereExcelZuNativ } from './prozessmodell-konverter';
import {
  rechneNativesModell,
  setzeKnotenWert,
  setzeSchrittFeld,
  neuerSchritt,
  loescheSchritt,
  exportDiffs,
  hatStrukturAenderung,
  type NativesProzessmodell,
} from './prozessmodell-nativ';

// ---------------------------------------------------------------------------
// Synthetisches Mini-Modell (CI-sicher, ohne Kundendatei)
// ---------------------------------------------------------------------------

function miniModell(): NativesProzessmodell {
  return {
    version: 1,
    name: 'Mini',
    monat: '01/2026',
    arbeitstage: 20,
    arbeitsminProStunde: 50,
    knoten: [
      { id: '_xE6', name: 'Colli', region: 'menge', blockId: 'b0', wert: 10000, expr: null, origin: { sheet: 'Dateneingabe', addr: 'C7' } },
      { id: '_xF6', name: null, region: 'intern', blockId: null, wert: null, expr: '_xE6/_AT', origin: null },
      { id: '_xE20', name: 'Anteil Stapler', region: 'parameter', blockId: 'b0', wert: 0.8, expr: null, origin: { sheet: 'Prozessmodell', addr: 'E20' } },
    ],
    bloecke: [
      {
        id: 'b0',
        name: 'SE: Test-Entladung',
        basisExpr: '_xF6',
        schritte: [
          // Fixzeit-Schritt: 60 Sek je Colli, Anteil aus Parameter
          { id: '_s50', nr: 1, name: 'Entladen', abteilung: 'Entlader', wegM: null, geschwMs: null, standardSek: 60, anteil: '_xE20', haeufigkeitExpr: '_s50*(_xF6)' },
          // Wege-Schritt: 100 m bei 2 m/s + 10 Sek, jede 2. Einheit
          { id: '_s51', nr: 2, name: 'Verteilen', abteilung: 'Verteiler', wegM: 100, geschwMs: 2, standardSek: 10, anteil: 0.5, haeufigkeitExpr: '_s51*(_xF6)' },
        ],
      },
    ],
    uebersicht: [{ sektion: 'SE', name: 'Test-Entladung', mengeExpr: '_xE6', blockId: 'b0' }],
    sonstige: [],
    nextId: 1,
  };
}

describe('rechneNativesModell (synthetisch)', () => {
  it('rechnet J/M/N wie die Referenzstruktur', () => {
    const { modell, warnungen } = rechneNativesModell(miniModell());
    expect(warnungen).toHaveLength(0);
    const b = modell.bloecke[0];
    // Schritt 1: J = 60/60 = 1 Min; M = 0.8 × 500 = 400; N = 1×400/500 = 0.8
    expect(b.schritte[0].minProColli).toBeCloseTo(0.8, 10);
    // Schritt 2: J = (100/2 + 10)/60 = 1 Min; N = 1×250/500 = 0.5
    expect(b.schritte[1].minProColli).toBeCloseTo(0.5, 10);
    expect(b.minProColli).toBeCloseTo(1.3, 10);
    expect(b.proAbteilung['Entlader']).toBeCloseTo(0.8, 10);
    // MA-h = 10000 × 1.3 / 50 = 260
    expect(modell.maStundenProzesse).toBeCloseTo(260, 10);
  });

  it('Knoten-Edit rechnet durch (Menge + Parameter)', () => {
    let m = miniModell();
    m = setzeKnotenWert(m, '_xE6', 20000); // Colli verdoppeln → MA-h verdoppeln (Min/Colli konstant)
    expect(rechneNativesModell(m).modell.maStundenProzesse).toBeCloseTo(520, 8);
    m = setzeKnotenWert(m, '_xE20', 0.4); // Anteil halbieren → Schritt 1 N halbiert
    expect(rechneNativesModell(m).modell.bloecke[0].schritte[0].minProColli).toBeCloseTo(0.4, 10);
  });

  it('abgeleitete Knoten sind nicht überschreibbar', () => {
    const m = setzeKnotenWert(miniModell(), '_xF6', 999);
    expect(rechneNativesModell(m).modell.maStundenProzesse).toBeCloseTo(260, 8);
  });

  it('Schritt-Zeit ändern wirkt sofort', () => {
    const m = setzeSchrittFeld(miniModell(), '_s50', 'standardSek', 120);
    // J = 2 Min → N = 1.6
    expect(rechneNativesModell(m).modell.bloecke[0].schritte[0].minProColli).toBeCloseTo(1.6, 10);
  });

  it('Schritt löschen friert Referenzen ein statt still 0 zu rechnen (Review-Fund #1)', () => {
    let m = miniModell();
    // Schritt 2 bezieht seinen Anteil per Referenz von Schritt 1 (wie im echten AS-Import)
    m = setzeSchrittFeld(m, '_s51', 'anteil', '_s50');
    const vorher = rechneNativesModell(m);
    expect(vorher.warnungen).toEqual([]);
    const anteilS51Vorher = vorher.modell.bloecke[0].schritte[1].anteil; // = 0.8 (von _s50)

    m = loescheSchritt(m, '_s50');
    const nachher = rechneNativesModell(m);
    // KEINE Warnungen (Referenz wurde eingefroren) und der Anteil bleibt 0.8
    expect(nachher.warnungen).toEqual([]);
    expect(nachher.modell.bloecke[0].schritte[0].anteil).toBeCloseTo(anteilS51Vorher, 10);
    expect(nachher.modell.bloecke[0].schritte[0].minProColli).toBeGreaterThan(0);
  });

  it('Zahlgrenze beim Einfrieren: _s5 trifft nicht _s50', () => {
    let m = miniModell();
    // Kunstfall: Ausdruck enthält _s50 UND einen längeren Namen _s501 existiert nicht —
    // prüfe dass Ersetzen von _s50 den Teilstring in _s51 (andere ID) nicht anfasst.
    m = setzeSchrittFeld(m, '_s51', 'anteil', '_s50+0.1');
    m = loescheSchritt(m, '_s50');
    const s = m.bloecke[0].schritte[0];
    expect(s.anteil).toBe('(0.8)+0.1');
  });

  it('Block ohne Basis warnt statt still 0 (Review-Fund #25)', () => {
    const m = miniModell();
    m.bloecke[0].basisExpr = null;
    const erg = rechneNativesModell(m);
    expect(erg.modell.bloecke[0].minProColli).toBe(0);
    expect(erg.warnungen.some((w) => w.includes('keine Mengen-Basis'))).toBe(true);
  });

  it('Schritt anlegen + löschen', () => {
    let m = neuerSchritt(miniModell(), 'b0', '_s50');
    expect(m.bloecke[0].schritte).toHaveLength(3);
    const neu = m.bloecke[0].schritte[1];
    expect(neu.id).toBe('_n1');
    m = setzeSchrittFeld(m, neu.id, 'standardSek', 30);
    // Neuer Schritt: J = 0.5 Min, Anteil 1, Häufigkeit = Basis → N = 0.5
    const erg = rechneNativesModell(m);
    expect(erg.warnungen).toHaveLength(0);
    expect(erg.modell.bloecke[0].minProColli).toBeCloseTo(1.8, 10);
    m = loescheSchritt(m, neu.id);
    expect(rechneNativesModell(m).modell.bloecke[0].minProColli).toBeCloseTo(1.3, 10);
  });

  it('exportDiffs liefert nur geänderte Eingaben, Strukturänderung wird erkannt', () => {
    const basis = miniModell();
    let m = setzeKnotenWert(basis, '_xE6', 12345);
    expect(exportDiffs(m, basis)).toEqual([{ sheet: 'Dateneingabe', addr: 'C7', value: 12345 }]);
    expect(hatStrukturAenderung(m, basis)).toBe(false);
    m = neuerSchritt(m, 'b0');
    expect(hatStrukturAenderung(m, basis)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GATE: echte Beintner-Excel → nativ → 18/18 Δ=0 + Σ 6375,9 h
// ---------------------------------------------------------------------------

const CANDIDATES = [
  process.env.TOPIS_AS_XLSX,
  join(homedir(), '.openclaw/workspace/topis/prozessmodell-engine/2026-06.xlsx'),
].filter(Boolean) as string[];
const XLSX_PATH = CANDIDATES.find((p) => existsSync(p));

describe.skipIf(!XLSX_PATH)('GATE: natives Modell reproduziert die Excel exakt', () => {
  const laden = () => {
    const buf = readFileSync(XLSX_PATH!);
    return ProzessWorkbook.fromArrayBuffer(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );
  };

  it('alle 18 Blöcke Δ < 1e-6 gegen die adressbasierte Referenz', () => {
    const wb = laden();
    const referenz = buildAsModell(wb); // adressbasiert = bewiesene Referenz
    const { modell: nativ, warnungen } = konvertiereExcelZuNativ(wb);
    const erg = rechneNativesModell(nativ);

    expect(erg.modell.bloecke).toHaveLength(18);
    const probleme: string[] = [];
    for (let i = 0; i < 18; i++) {
      const delta = Math.abs(erg.modell.bloecke[i].minProColli - referenz.bloecke[i].minProColli);
      if (delta >= 1e-6) {
        probleme.push(
          `${referenz.bloecke[i].name}: nativ=${erg.modell.bloecke[i].minProColli.toFixed(6)} referenz=${referenz.bloecke[i].minProColli.toFixed(6)} Δ=${delta.toExponential(2)}`,
        );
      }
    }
    expect(probleme, probleme.join('\n') + '\nKonverter-Warnungen: ' + warnungen.join(' | ') + '\nRechner-Warnungen: ' + erg.warnungen.slice(0, 10).join(' | ')).toEqual([]);
  });

  it('MA-Stundenbedarf Σ 6375,9 h (Δ < 0,05)', () => {
    const { modell: nativ } = konvertiereExcelZuNativ(laden());
    const erg = rechneNativesModell(nativ);
    expect(Math.abs(erg.modell.maStundenProzesse - 6375.891782)).toBeLessThan(0.05);
  });

  it('Abteilungs-Split konsistent (Block 1: Σ Teile = Block)', () => {
    const { modell: nativ } = konvertiereExcelZuNativ(laden());
    const erg = rechneNativesModell(nativ);
    const fv = erg.modell.bloecke[0];
    const teile = Object.values(fv.proAbteilung).reduce((a, b) => a + b, 0);
    expect(Math.abs(teile - fv.minProColli)).toBeLessThan(1e-9);
  });

  it('natives Editieren: Verteilweg-Parameter wirkt auf den Verteiler-Split', () => {
    const wb = laden();
    const { modell: nativ } = konvertiereExcelZuNativ(wb);
    // ø Verteilweg (F39, Block 1) suchen — sichtbarer Parameter
    const vw = nativ.knoten.find((k) => k.name === 'ø Verteilweg' && k.blockId === 'b0');
    expect(vw, 'ø Verteilweg als Knoten gefunden').toBeTruthy();
    const vorher = rechneNativesModell(nativ).modell.bloecke[0];
    const nachher = rechneNativesModell(setzeKnotenWert(nativ, vw!.id, 200)).modell.bloecke[0];
    expect(nachher.proAbteilung['Verteiler']).toBeGreaterThan(vorher.proAbteilung['Verteiler']);
    expect(nachher.proAbteilung['Scanner']).toBeCloseTo(vorher.proAbteilung['Scanner'], 9);
  });

  it('Roundtrip JSON: serialisieren + parsen ändert nichts am Ergebnis', () => {
    const { modell: nativ } = konvertiereExcelZuNativ(laden());
    const kopie = JSON.parse(JSON.stringify(nativ)) as NativesProzessmodell;
    expect(rechneNativesModell(kopie).modell.maStundenProzesse).toBeCloseTo(
      rechneNativesModell(nativ).modell.maStundenProzesse,
      9,
    );
  });
});
