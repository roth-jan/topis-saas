import { describe, expect, it } from 'vitest';
import { mergeOfflineSafetyNet } from './nl-llm';
import { parseCanonical } from './nl-layout';

describe('nl-llm — Offline-Sicherheitsnetz über der LLM-Antwort (Astra 20.09.2026)', () => {
  it('ergänzt ignored (runde Halle) und ersetzt einseitige LLM-Torreihen durch die Offline-Obermenge', () => {
    const text = 'runde Halle 120x50, 10 Tore Nord und Süd Abstand 6';
    const llm = { action: 'createHall' as const, hall: { lengthM: 120, widthM: 50 }, gates: [{ count: 10, side: 'north' as const, spacingM: 6 }] };
    const out = mergeOfflineSafetyNet(llm, parseCanonical(text));
    expect(out.gates?.map((g) => g.side)).toEqual(['north', 'south']);
    expect(out.ignored?.some((i) => /Runde/.test(i))).toBe(true);
  });
  it('lässt LLM-Torreihen in Ruhe, wenn Stückzahlen abweichen (keine Obermenge)', () => {
    const llm = { action: 'createHall' as const, hall: { lengthM: 120, widthM: 50 }, gates: [{ count: 12, side: 'north' as const }] };
    const out = mergeOfflineSafetyNet(llm, parseCanonical('Halle 120x50, 10 Tore Nord und Süd'));
    expect(out.gates).toEqual(llm.gates);
  });
});
