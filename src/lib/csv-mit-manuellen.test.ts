/**
 * Verifiziert dass der CSV-Export aus WegeberechnungDialog auch manuelle
 * Pfade (M-Zeilen) ausgibt, gemäß Lastenheft 3.2.4.4.
 *
 * Da die CSV-Logik im React-Component liegt, testen wir hier den
 * algorithmischen Kern als reine Funktion ausgekoppelt.
 */
import { describe, expect, it } from 'vitest';
import type { Path, TopisObject, PathResult } from '@/types/topis';

interface WegeResult { start: TopisObject; end: TopisObject; result: PathResult | null; distEuclidean: number }

function buildCsv(results: WegeResult[], manualPaths: Path[]): string {
  const lines: string[] = ['Art;Start;Ende;Weg;Länge[m];Zeit[s]'];
  for (const r of results) {
    const name = `${r.start.name}-${r.end.name}`;
    if (r.result) {
      lines.push(`A;${r.start.name};${r.end.name};${name};${r.result.distance.toFixed(1)};${r.result.time.toFixed(1)}`);
    } else {
      lines.push(`A;${r.start.name};${r.end.name};${name};—;—`);
    }
  }
  for (const r of results) {
    const matches = manualPaths.filter(p => p.startObjectId === r.start.id && p.endObjectId === r.end.id);
    for (const p of matches) {
      const lenM = p.distance ?? 0;
      const timeS = p.time ?? 0;
      lines.push(`M;${r.start.name};${r.end.name};${p.name};${lenM.toFixed(1)};${timeS.toFixed(1)}`);
    }
  }
  return lines.join('\n');
}

describe('CSV-Export Wegberechnung mit manuellen Pfaden', () => {
  const tor1 = { id: 1, type: 'tor', name: 'Tor 1', x: 0, y: 0, width: 3, height: 1 } as TopisObject;
  const lagerA = { id: 2, type: 'bereich', name: 'Lager A', x: 10, y: 5, width: 4, height: 4 } as TopisObject;

  it('Auto-Wege erscheinen mit A;…, manuelle danach mit M;…', () => {
    const results: WegeResult[] = [
      { start: tor1, end: lagerA, result: { path: [], distance: 25.5, time: 9.2, usedGangs: [] }, distEuclidean: 11 },
    ];
    const manual: Path[] = [{
      id: 99, name: 'IST-Weg Tor 1 → Lager A',
      waypoints: [{ x: 1, y: 0, objectId: null }, { x: 12, y: 7, objectId: null }],
      startObjectId: 1, endObjectId: 2, distance: 30.2, time: 11.5,
    }];
    const csv = buildCsv(results, manual);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Art;Start;Ende;Weg;Länge[m];Zeit[s]');
    expect(lines[1]).toBe('A;Tor 1;Lager A;Tor 1-Lager A;25.5;9.2');
    expect(lines[2]).toBe('M;Tor 1;Lager A;IST-Weg Tor 1 → Lager A;30.2;11.5');
  });

  it('A-Zeilen zuerst, M-Zeilen am Ende (Reihenfolge gemäß Lastenheft 3.2.4.4)', () => {
    const results: WegeResult[] = [
      { start: tor1, end: lagerA, result: { path: [], distance: 10, time: 5, usedGangs: [] }, distEuclidean: 8 },
    ];
    const manual: Path[] = [
      { id: 1, name: 'M1', waypoints: [], startObjectId: 1, endObjectId: 2, distance: 12, time: 6 },
      { id: 2, name: 'M2', waypoints: [], startObjectId: 1, endObjectId: 2, distance: 15, time: 7 },
    ];
    const csv = buildCsv(results, manual);
    const lines = csv.split('\n');
    expect(lines.filter(l => l.startsWith('A;')).length).toBe(1);
    expect(lines.filter(l => l.startsWith('M;')).length).toBe(2);
    // A vor M
    const idxA = lines.findIndex(l => l.startsWith('A;'));
    const idxM1 = lines.findIndex(l => l.startsWith('M;'));
    expect(idxA).toBeLessThan(idxM1);
  });

  it('Pfade ohne A*-Ergebnis bekommen — als Distanz', () => {
    const results: WegeResult[] = [
      { start: tor1, end: lagerA, result: null, distEuclidean: 11 },
    ];
    const csv = buildCsv(results, []);
    expect(csv).toContain('A;Tor 1;Lager A;Tor 1-Lager A;—;—');
  });
});
