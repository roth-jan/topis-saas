import { describe, it, expect } from 'vitest';
import { validateParams, paramsToLayout, parseCanonical, LayoutParams } from './nl-layout';

describe('nl-layout — validateParams', () => {
  it('akzeptiert gültige Halle + Tor-Reihe, füllt Defaults', () => {
    const p: LayoutParams = {
      action: 'createHall',
      hall: { lengthM: 210, widthM: 58, name: 'Halle 6' },
      gates: { count: 20, side: 'north' },
      unit: 'm',
    };
    const r = validateParams(p);
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.filled.gates?.spacingM).toBe(4.5);      // Default Tor-Breite +1
    expect(r.filled.gates?.firstOffsetM).toBe(1.0);  // Default
  });

  it('rechnet Fuß in Meter um', () => {
    const p: LayoutParams = {
      action: 'createHall',
      hall: { lengthM: 100, widthM: 50 },
      unit: 'ft',
    };
    const r = validateParams(p);
    expect(r.filled.unit).toBe('m');
    expect(r.filled.hall.lengthM).toBeCloseTo(30.48, 2);
    expect(r.filled.hall.widthM).toBeCloseTo(15.24, 2);
  });

  it('blockt, wenn die Tor-Reihe nicht auf die Wand passt (still-falsch-Schutz)', () => {
    const p: LayoutParams = {
      action: 'createHall',
      hall: { lengthM: 210, widthM: 58 },
      gates: { count: 115, side: 'north', spacingM: 3.75 }, // 115*3.75 ≈ 431 m > 210 m
    };
    const r = validateParams(p);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('Wand'))).toBe(true);
  });

  it('warnt bei ungewöhnlich engem Torabstand (Zahlendreher)', () => {
    const p: LayoutParams = {
      action: 'createHall',
      hall: { lengthM: 210, widthM: 58 },
      gates: { count: 5, side: 'north', spacingM: 1.0 },
    };
    const r = validateParams(p);
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.includes('eng'))).toBe(true);
  });

  it('meldet Fehler bei ungültigen Maßen', () => {
    const r = validateParams({ action: 'createHall', hall: { lengthM: 0, widthM: -5 } });
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('nl-layout — parseCanonical', () => {
  it('parst „Halle 210x58, 115 Tore Nord 3,75"', () => {
    const p = parseCanonical('Halle 210x58, 115 Tore Nord 3,75');
    expect(p).not.toBeNull();
    expect(p!.hall.lengthM).toBe(210);
    expect(p!.hall.widthM).toBe(58);
    expect(p!.gates?.count).toBe(115);
    expect(p!.gates?.side).toBe('north');
    expect(p!.gates?.spacingM).toBe(3.75);
  });

  it('parst „100 x 50 m, 20 Tore im Norden, Abstand 5"', () => {
    const p = parseCanonical('100 x 50 m, 20 Tore im Norden, Abstand 5');
    expect(p!.hall.lengthM).toBe(100);
    expect(p!.gates?.count).toBe(20);
    expect(p!.gates?.side).toBe('north');
    expect(p!.gates?.spacingM).toBe(5);
  });

  it('erkennt Seiten Süd/Ost/West + „im 3.75-m-Raster"', () => {
    expect(parseCanonical('80x40, 6 Tore Süd')!.gates?.side).toBe('south');
    expect(parseCanonical('80x40, 6 Tore Ost')!.gates?.side).toBe('east');
    const w = parseCanonical('80x40, 6 Tore West im 3,75-m-Raster');
    expect(w!.gates?.side).toBe('west');
    expect(w!.gates?.spacingM).toBe(3.75);
  });

  it('Halle ohne Tore: gates undefiniert', () => {
    const p = parseCanonical('Halle 120x60');
    expect(p!.hall.lengthM).toBe(120);
    expect(p!.gates).toBeUndefined();
  });

  it('gibt null ohne erkennbare Maße', () => {
    expect(parseCanonical('bau mir irgendwas')).toBeNull();
    expect(parseCanonical('')).toBeNull();
  });

  it('End-to-End: parseCanonical → validate → paramsToLayout', () => {
    const p = parseCanonical('Halle 100x50, 10 Tore Nord, Abstand 5')!;
    const v = validateParams(p);
    expect(v.ok).toBe(true);
    const { objects } = paramsToLayout(v.filled);
    expect(objects).toHaveLength(10);
    expect(objects.every((o) => o.side === 'north')).toBe(true);
  });
});

describe('nl-layout — paramsToLayout', () => {
  it('Nordwand: Tore quer, y=0, fester Achsabstand, korrekte Anzahl', () => {
    const { filled } = validateParams({
      action: 'createHall',
      hall: { lengthM: 100, widthM: 50 },
      gates: { count: 5, side: 'north', spacingM: 5, firstOffsetM: 2 },
    });
    const { hall, objects } = paramsToLayout(filled);
    expect(hall).toEqual({ width: 100, height: 50, name: 'Neue Halle' });
    expect(objects).toHaveLength(5);
    expect(objects.every((o) => o.type === 'tor')).toBe(true);
    expect(objects.every((o) => o.side === 'north' && o.y === 0)).toBe(true);
    expect(objects.every((o) => o.width === 3.5 && o.height === 1.5)).toBe(true);
    // Achsabstand 5 m: Mitten bei 2,7,12,... → x (linke Kante) = center-1.75
    const centers = objects.map((o) => o.x + o.width / 2);
    expect(centers[0]).toBeCloseTo(2, 5);
    expect(centers[1] - centers[0]).toBeCloseTo(5, 5);
    // fortlaufende Namen + messpunkt-Tag + Code (für Demo-Generator)
    expect(objects[0].name).toBe('Tor 1');
    expect(objects[4].meta?.code).toBe('MP5');
    expect(objects[0].tags).toContain('messpunkt');
  });

  it('Südwand: Tore am unteren Rand (y = height - Tiefe)', () => {
    const { filled } = validateParams({
      action: 'createHall',
      hall: { lengthM: 100, widthM: 50 },
      gates: { count: 3, side: 'south', spacingM: 5 },
    });
    const { objects } = paramsToLayout(filled);
    expect(objects.every((o) => o.side === 'south' && o.y === 50 - 1.5)).toBe(true);
  });

  it('Westwand: Tore hochkant (1.5×3.5), x=0', () => {
    const { filled } = validateParams({
      action: 'createHall',
      hall: { lengthM: 100, widthM: 50 },
      gates: { count: 4, side: 'west', spacingM: 5 },
    });
    const { objects } = paramsToLayout(filled);
    expect(objects.every((o) => o.width === 1.5 && o.height === 3.5)).toBe(true);
    expect(objects.every((o) => o.side === 'west' && o.x === 0)).toBe(true);
  });

  it('ohne gates: nur Halle, keine Objekte', () => {
    const { filled } = validateParams({ action: 'createHall', hall: { lengthM: 80, widthM: 40 } });
    const { hall, objects } = paramsToLayout(filled);
    expect(hall.width).toBe(80);
    expect(objects).toHaveLength(0);
  });
});
