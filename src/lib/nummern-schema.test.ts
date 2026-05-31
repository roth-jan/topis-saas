/** Lastenheft 3.1.2 — Nummerierungs-Schemata fuer Mehrfach-Insert */
import { describe, it, expect } from 'vitest';

// Inline Re-Implementation (Quelle: MultiInsertDialog.tsx)
type NummernSchema = '1' | 'A1' | '1A' | 'A';

function numberToAlpha(n: number): string {
  let s = '';
  let x = n;
  do {
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26) - 1;
  } while (x >= 0);
  return s;
}

function generateLabel(schema: NummernSchema, prefix: string, startNum: number, i: number, defaultsName: string): string {
  const idx = startNum + i;
  if (schema === '1') {
    return prefix ? `${prefix}${idx}` : `${defaultsName} ${idx}`;
  }
  if (schema === 'A') {
    return prefix + numberToAlpha(idx - 1);
  }
  if (schema === 'A1') {
    const letter = prefix || 'A';
    return `${letter}${idx}`;
  }
  if (schema === '1A') {
    const num = prefix || '1';
    return `${num}${numberToAlpha(i)}`;
  }
  return `${defaultsName} ${idx}`;
}

describe('Nummern-Schema (Lastenheft 3.1.2)', () => {
  it('Schema "1": 1,2,3 mit Prefix → T1, T2, T3', () => {
    expect(generateLabel('1', 'T', 1, 0, 'Tor')).toBe('T1');
    expect(generateLabel('1', 'T', 1, 1, 'Tor')).toBe('T2');
    expect(generateLabel('1', 'T', 1, 2, 'Tor')).toBe('T3');
  });

  it('Schema "A1": A1, A2, A3', () => {
    expect(generateLabel('A1', 'A', 1, 0, 'Tor')).toBe('A1');
    expect(generateLabel('A1', 'A', 1, 1, 'Tor')).toBe('A2');
    expect(generateLabel('A1', 'A', 1, 2, 'Tor')).toBe('A3');
  });

  it('Schema "1A": 1A, 1B, 1C', () => {
    expect(generateLabel('1A', '1', 1, 0, 'Tor')).toBe('1A');
    expect(generateLabel('1A', '1', 1, 1, 'Tor')).toBe('1B');
    expect(generateLabel('1A', '1', 1, 2, 'Tor')).toBe('1C');
  });

  it('Schema "A": A, B, C, ..., Z, AA, AB', () => {
    expect(generateLabel('A', '', 1, 0, 'Tor')).toBe('A');
    expect(generateLabel('A', '', 1, 1, 'Tor')).toBe('B');
    expect(generateLabel('A', '', 1, 25, 'Tor')).toBe('Z');
    expect(generateLabel('A', '', 1, 26, 'Tor')).toBe('AA');
    expect(generateLabel('A', '', 1, 27, 'Tor')).toBe('AB');
  });

  it('Default-Schema "1" ohne Prefix → "Tor 1", "Tor 2"', () => {
    expect(generateLabel('1', '', 1, 0, 'Tor')).toBe('Tor 1');
    expect(generateLabel('1', '', 1, 1, 'Tor')).toBe('Tor 2');
  });
});
