import { describe, it, expect } from 'vitest';
import { validateParams, paramsToLayout, parseCanonical, LayoutParams, AISLE_FRACTIONS, AISLE_HALF, AISLE_H_HALF } from './nl-layout';

describe('nl-layout — validateParams', () => {
  it('akzeptiert gültige Halle + Tor-Reihe, füllt Defaults (Offset = halbe Torbreite)', () => {
    const p: LayoutParams = {
      action: 'createHall',
      hall: { lengthM: 210, widthM: 58, name: 'Halle 6' },
      gates: [{ count: 20, side: 'north' }],
      unit: 'm',
    };
    const r = validateParams(p);
    expect(r.ok).toBe(true);
    expect(r.filled.gates?.[0].spacingM).toBe(4.5);
    // zentriert: (210 - 19*4.5)/2 = 62.25
    expect(r.filled.gates?.[0].firstOffsetM).toBeCloseTo(62.25, 2);
  });

  it('rechnet Fuß in Meter um', () => {
    const r = validateParams({ action: 'createHall', hall: { lengthM: 100, widthM: 50 }, unit: 'ft' });
    expect(r.filled.unit).toBe('m');
    expect(r.filled.hall.lengthM).toBeCloseTo(30.48, 2);
  });

  it('blockt, wenn die Tor-Reihe nicht auf die Wand passt', () => {
    const r = validateParams({
      action: 'createHall',
      hall: { lengthM: 210, widthM: 58 },
      gates: [{ count: 115, side: 'north', spacingM: 3.75 }],
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('Wand'))).toBe(true);
  });

  it('warnt bei ungewöhnlich engem Torabstand', () => {
    const r = validateParams({ action: 'createHall', hall: { lengthM: 210, widthM: 58 }, gates: [{ count: 5, side: 'north', spacingM: 1.0 }] });
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.includes('eng'))).toBe(true);
  });

  it('validiert mehrere Torreihen unabhängig', () => {
    const r = validateParams({
      action: 'createHall',
      hall: { lengthM: 210, widthM: 58 },
      gates: [{ count: 40, side: 'north', spacingM: 4 }, { count: 40, side: 'south', spacingM: 4 }],
    });
    expect(r.ok).toBe(true);
    expect(r.filled.gates).toHaveLength(2);
  });
});

describe('nl-layout — parseCanonical', () => {
  it('parst „Halle 210x58, 50 Tore Nord Abstand 3,75"', () => {
    const p = parseCanonical('Halle 210x58, 50 Tore Nord Abstand 3,75')!;
    expect(p.hall.lengthM).toBe(210);
    expect(p.hall.widthM).toBe(58);
    expect(p.gates).toHaveLength(1);
    expect(p.gates![0]).toMatchObject({ count: 50, side: 'north', spacingM: 3.75 });
  });

  it('P0: mehrere Torseiten — Nord UND Süd', () => {
    const p = parseCanonical('Halle 210x58, 50 Tore Nord, 50 Tore Süd')!;
    expect(p.gates).toHaveLength(2);
    expect(p.gates!.map((g) => g.side)).toEqual(['north', 'south']);
    expect(p.gates!.every((g) => g.count === 50)).toBe(true);
  });

  it('P0: weitere Maße werden NICHT als Halle genommen, sondern gemeldet', () => {
    const p = parseCanonical('Halle 210x58, Stellplätze 12x3, 20 Tore Nord')!;
    expect(p.hall.lengthM).toBe(210); // erstes Maß = Halle
    expect(p.ignored?.some((x) => x.includes('12x3'))).toBe(true);
    expect(p.ignored?.some((x) => x.includes('Stellplätze'))).toBe(true);
  });

  it('P0: nicht unterstützte Elemente werden gemeldet (nicht still geschluckt)', () => {
    const p = parseCanonical('Halle 100x50, 10 Tore Nord, 3 Fahrgänge, Bereiche, Sicherheitsabstand 2m')!;
    const ign = (p.ignored ?? []).join(' | ');
    expect(ign).toContain('Gänge');
    expect(ign).toContain('Bereiche');
    expect(ign).toContain('Sicherheitsabstände');
  });

  it('bare Abstand „115 Tore Nord 3,75" (ohne Schlüsselwort)', () => {
    const p = parseCanonical('Halle 210x58, 115 Tore Nord 3,75')!;
    expect(p.gates![0].spacingM).toBe(3.75);
  });

  it('gibt null ohne erkennbare Maße', () => {
    expect(parseCanonical('bau mir irgendwas')).toBeNull();
  });
});

describe('nl-layout — paramsToLayout (Geometrie exakt)', () => {
  it('P1: exakter Achsabstand + zentrierte Reihe (gleicher Randabstand)', () => {
    const { filled } = validateParams({
      action: 'createHall', hall: { lengthM: 210, widthM: 58 },
      gates: [{ count: 4, side: 'north', spacingM: 3.75 }],
    });
    const { objects } = paramsToLayout(filled);
    expect(objects).toHaveLength(4);
    const xs = objects.map((o) => o.x);
    // Abstände exakt 3,75 m
    expect(xs[1] - xs[0]).toBeCloseTo(3.75, 6);
    expect(xs[2] - xs[1]).toBeCloseTo(3.75, 6);
    expect(xs[3] - xs[2]).toBeCloseTo(3.75, 6);
    // zentriert: linker Randabstand ≈ rechter Randabstand
    const leftMargin = xs[0];
    const rightMargin = 210 - (xs[3] + 3.5);
    expect(leftMargin).toBeGreaterThan(1); // nicht mehr bei 0
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(0.01);
  });

  it('P1/#2: Torreihe zentriert (nicht bei x=0)', () => {
    const { filled } = validateParams({
      action: 'createHall', hall: { lengthM: 100, widthM: 50 },
      gates: [{ count: 5, side: 'north', spacingM: 5 }],
    });
    const { objects } = paramsToLayout(filled);
    // 5 Tore, rowLen 20, offset (100-20)/2=40 → erstes Tor-Zentrum bei 40, x=38.25
    expect(objects[0].x).toBeCloseTo(38.25, 2);
  });

  it('KI baut Bereiche + Stellplätze im Innenraum', () => {
    const { filled } = validateParams({
      action: 'createHall', hall: { lengthM: 120, widthM: 50 },
      gates: [{ count: 6, side: 'north', spacingM: 6 }],
      bereiche: 4, stellplaetze: 6,
    });
    const { objects } = paramsToLayout(filled);
    const b = objects.filter((o) => o.type === 'bereich');
    const s = objects.filter((o) => o.type === 'stellplatz');
    expect(b.length).toBe(4);
    expect(s.length).toBe(6);
    // Innenraum: nicht an der Wand (Margin)
    expect(b.every((o) => o.x >= 5 && o.y >= 5)).toBe(true);
    expect(b[0].name).toBe('Bereich 1');
    expect(s[0].name).toBe('Stellplatz 1');
  });

  it('#1: Innenraum-Objekte kreuzen KEINE Fahrgänge (kreuzungsfrei + Sicherheitsabstand)', () => {
    const W = 200, H = 60;
    const { filled } = validateParams({
      action: 'createHall', hall: { lengthM: W, widthM: H },
      gates: [{ count: 20, side: 'north', spacingM: 6 }],
      bereiche: 8, stellplaetze: 20,
    });
    const { objects } = paramsToLayout(filled);
    const interior = objects.filter((o) => o.type === 'bereich' || o.type === 'stellplatz');
    expect(interior.length).toBeGreaterThan(0);
    const aisleXs = AISLE_FRACTIONS.map((f) => W * f);
    const aisleY = H / 2;
    for (const o of interior) {
      // kein Überlapp mit vertikalen Quergängen
      for (const ax of aisleXs) {
        const overlapX = o.x < ax + AISLE_HALF && o.x + o.width > ax - AISLE_HALF;
        expect(overlapX).toBe(false);
      }
      // kein Überlapp mit zentralem Längsgang
      const overlapY = o.y < aisleY + AISLE_H_HALF && o.y + o.height > aisleY - AISLE_H_HALF;
      expect(overlapY).toBe(false);
    }
  });

  it('parseCanonical erkennt Bereiche + Stellplätze (nicht mehr „ignoriert")', () => {
    const p = parseCanonical('Halle 120x50, 10 Tore Nord, 6 Bereiche, 20 Stellplätze')!;
    expect(p.bereiche).toBe(6);
    expect(p.stellplaetze).toBe(20);
    expect((p.ignored ?? []).join(' ')).not.toContain('Bereiche');
    expect((p.ignored ?? []).join(' ')).not.toContain('Stellplätze');
  });

  it('mehrere Torreihen: fortlaufende Nummern, korrekte Seiten', () => {
    const { filled } = validateParams({
      action: 'createHall', hall: { lengthM: 210, widthM: 58 },
      gates: [{ count: 3, side: 'north', spacingM: 5 }, { count: 2, side: 'south', spacingM: 5 }],
    });
    const { objects } = paramsToLayout(filled);
    expect(objects).toHaveLength(5);
    expect(objects.filter((o) => o.side === 'north')).toHaveLength(3);
    expect(objects.filter((o) => o.side === 'south')).toHaveLength(2);
    expect(objects.map((o) => o.name)).toEqual(['Tor 1', 'Tor 2', 'Tor 3', 'Tor 4', 'Tor 5']);
    expect(objects[4].meta?.code).toBe('MP5');
  });

  it('Westwand: Tore hochkant (1.5×3.5), x=0', () => {
    const { filled } = validateParams({ action: 'createHall', hall: { lengthM: 100, widthM: 50 }, gates: [{ count: 4, side: 'west', spacingM: 5 }] });
    const { objects } = paramsToLayout(filled);
    expect(objects.every((o) => o.width === 1.5 && o.height === 3.5 && o.side === 'west' && o.x === 0)).toBe(true);
  });

  it('End-to-End: parseCanonical → validate → paramsToLayout (Nord+Süd)', () => {
    const p = parseCanonical('Halle 210x58, 30 Tore Nord Abstand 5, 30 Tore Süd Abstand 5')!;
    const v = validateParams(p);
    expect(v.ok).toBe(true);
    const { objects } = paramsToLayout(v.filled);
    expect(objects).toHaveLength(60);
    expect(objects.filter((o) => o.side === 'south')).toHaveLength(30);
  });

  it('ohne gates: nur Halle', () => {
    const { filled } = validateParams({ action: 'createHall', hall: { lengthM: 80, widthM: 40 } });
    const { objects } = paramsToLayout(filled);
    expect(objects).toHaveLength(0);
  });
});
