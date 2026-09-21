import { describe, expect, it } from 'vitest';
import { zahl, prozent, datum } from './format';

describe('format — deutsche Darstellung', () => {
  it('Dezimalkomma + Tausenderpunkt', () => {
    expect(zahl(2.105, 2)).toBe('2,11');
    expect(zahl(3983)).toBe('3.983');
    expect(zahl(158.46, 1)).toBe('158,5');
  });
  it('Prozent mit Vorzeichen', () => {
    expect(prozent(0.453, { vorzeichen: true })).toBe('+45 %');
    expect(prozent(-0.31, { vorzeichen: true })).toBe('-31 %');
  });
  it('ISO-Datum → deutsch', () => {
    expect(datum('2026-01-13')).toBe('13.01.2026');
    expect(datum('?')).toBe('?');
  });
});
