import { describe, it, expect } from 'vitest';
import { validateParams, paramsToLayout, parseCanonical, findLayoutCollisions, LayoutParams, AISLE_FRACTIONS, AISLE_HALF, AISLE_H_HALF } from './nl-layout';

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

  it('warnt bei sehr enger (aber positiver) Torlücke', () => {
    // Achsabstand 3.7 bei Tor-Breite 3.5 → Lücke 0.2 m → Warnung, kein Fehler.
    const r = validateParams({ action: 'createHall', hall: { lengthM: 210, widthM: 58 }, gates: [{ count: 5, side: 'north', spacingM: 3.7 }] });
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => /eng|lücke/i.test(w))).toBe(true);
  });

  it('FEHLER bei überlappenden Toren nur bei EXPLIZITER zu breiter Tor-Breite', () => {
    // Explizite Breite 3.5 m bei Achsabstand 1.0 m → Überlappung → Fehler.
    const r = validateParams({ action: 'createHall', hall: { lengthM: 210, widthM: 58 }, gates: [{ count: 5, side: 'north', torBreiteM: 3.5, spacingM: 1.0 }] });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /überlapp/i.test(e))).toBe(true);
  });

  it('OHNE explizite Breite passt sich die Tor-Breite dem Achsabstand an (keine Überlappung)', () => {
    // „Abstand 3" ohne Breite: Tore werden 3.0 m breit (min(3.5, 3)), Lücke 0 → ok, kein Fehler.
    const r = validateParams({ action: 'createHall', hall: { lengthM: 210, widthM: 58 }, gates: [{ count: 40, side: 'north', lueckeM: 3 }] });
    expect(r.ok).toBe(true);
    const { objects } = paramsToLayout(r.filled);
    expect(objects.every((o) => o.type === 'tor' && o.width === 3)).toBe(true);
  });

  it('Tor-Breite + Lücke: Pitch = Breite + Lücke, Kapazität geprüft', () => {
    // Jans Szenario: 50 Tore à 4 m + 3 m Lücke = 347 m > 200 m → Fehler.
    const r = validateParams({
      action: 'createHall', hall: { lengthM: 200, widthM: 100 },
      gates: [{ count: 50, side: 'north', torBreiteM: 4, lueckeM: 3 }],
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /347|brauchen|nur 200/.test(e))).toBe(true);
  });

  it('Tor-Breite wird gebaut (nicht auf 3.5 hart)', () => {
    const { objects } = paramsToLayout(validateParams({
      action: 'createHall', hall: { lengthM: 200, widthM: 100 },
      gates: [{ count: 5, side: 'north', torBreiteM: 4, lueckeM: 3 }],
    }).filled);
    expect(objects.every((o) => o.type === 'tor' && o.width === 4)).toBe(true);
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
  it('parst „Halle 210x58, 50 Tore Nord Abstand 3,75" (Abstand ohne Breite = Achsabstand)', () => {
    const p = parseCanonical('Halle 210x58, 50 Tore Nord Abstand 3,75')!;
    expect(p.hall.lengthM).toBe(210);
    expect(p.hall.widthM).toBe(58);
    expect(p.gates).toHaveLength(1);
    expect(p.gates![0]).toMatchObject({ count: 50, side: 'north', lueckeM: 3.75 });
    // Ohne Tor-Breite meint „Abstand" den Achsabstand → Pitch bleibt 3.75 (AS-konform, passt in 210 m).
    const v = validateParams(p);
    expect(v.ok).toBe(true);
    expect(v.filled.gates![0].spacingM).toBeCloseTo(3.75, 6);
  });

  it('Tor-Breite + „Abstand zum nächsten Tor" (Lücke): Pitch = Breite + Lücke', () => {
    const p = parseCanonical('Halle 200x100, 50 Tore Nord, jedes Tor 4 m breit mit 3 m Abstand zum nächsten Tor')!;
    expect(p.gates![0]).toMatchObject({ count: 50, side: 'north', torBreiteM: 4, lueckeM: 3 });
    const v = validateParams(p);
    // 50 × 4 + 49 × 3 = 347 m > 200 m → Fehler.
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => /nur 200|brauchen/.test(e))).toBe(true);
  });

  it('P0: mehrere Torseiten — Nord UND Süd', () => {
    const p = parseCanonical('Halle 210x58, 50 Tore Nord, 50 Tore Süd')!;
    expect(p.gates).toHaveLength(2);
    expect(p.gates!.map((g) => g.side)).toEqual(['north', 'south']);
    expect(p.gates!.every((g) => g.count === 50)).toBe(true);
  });

  it('P0: unbezogene Zusatzmaße werden NICHT als Halle genommen, sondern gemeldet', () => {
    const p = parseCanonical('Halle 210x58, Bürocontainer 6x3, 20 Tore Nord')!;
    expect(p.hall.lengthM).toBe(210); // erstes Maß = Halle
    expect(p.ignored?.some((x) => x.includes('6x3'))).toBe(true);
  });

  it('Stellplatz-Maß neben "Stellplätze" wird als Maß erkannt (nicht ignoriert)', () => {
    const p = parseCanonical('Halle 210x58, Stellplätze 12x3, 20 Tore Nord')!;
    expect(p.hall.lengthM).toBe(210);
    expect(p.stellplatzLaengeM).toBe(12);
    expect(p.stellplatzBreiteM).toBe(3);
    expect(p.ignored?.some((x) => x.includes('12x3'))).toBeFalsy();
  });

  it('P0: nicht unterstützte Elemente werden gemeldet (nicht still geschluckt)', () => {
    const p = parseCanonical('Halle 100x50, 10 Tore Nord, 3 Fahrgänge, Bereiche, Sicherheitsabstand 2m')!;
    const ign = (p.ignored ?? []).join(' | ');
    expect(ign).toContain('Gänge');
    expect(ign).toContain('Bereiche');
    expect(ign).toContain('Sicherheitsabstände');
  });

  it('bare Abstand „115 Tore Nord 3,75" (ohne Schlüsselwort) → Achsabstand', () => {
    const p = parseCanonical('Halle 210x58, 115 Tore Nord 3,75')!;
    expect(p.gates![0].lueckeM).toBe(3.75);
    // Ohne Tor-Breite = Achsabstand → validiert zu spacingM 3.75.
    expect(validateParams(p).filled.gates![0].spacingM).toBeCloseTo(3.75, 6);
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

  it('#2: Sonderflächen — Parser + Generierung (Typen + Namen)', () => {
    const p = parseCanonical('Halle 120x50, 10 Tore Nord, 3 Kommissionierflächen, 4 Wertverschläge, 2 AV-Plätze')!;
    expect(p.flaechen).toEqual(expect.arrayContaining([
      { art: 'kommissionierflaeche', count: 3 },
      { art: 'wertverschlag', count: 4 },
      { art: 'av_platz', count: 2 },
    ]));
    const { objects } = paramsToLayout(validateParams(p).filled);
    expect(objects.filter((o) => o.type === 'kommissionierflaeche').length).toBe(3);
    expect(objects.filter((o) => o.type === 'wertverschlag').length).toBe(4);
    expect(objects.filter((o) => o.type === 'av_platz').length).toBe(2);
    expect(objects.find((o) => o.type === 'wertverschlag')?.name).toBe('Wertverschlag 1');
  });

  it('#3: Nummerierungsschema seite (N1,S1) / alpha (A,B,C) / startNr', () => {
    const seite = paramsToLayout(validateParams({
      action: 'createHall', hall: { lengthM: 100, widthM: 50 },
      gates: [{ count: 3, side: 'north', spacingM: 6 }, { count: 2, side: 'south', spacingM: 6 }],
      nummerierung: 'seite',
    }).filled).objects.filter((o) => o.type === 'tor').map((o) => o.name);
    expect(seite).toEqual(['N1', 'N2', 'N3', 'S1', 'S2']);

    const alpha = paramsToLayout(validateParams({
      action: 'createHall', hall: { lengthM: 100, widthM: 50 },
      gates: [{ count: 3, side: 'north', spacingM: 6 }], nummerierung: 'alpha',
    }).filled).objects.map((o) => o.name);
    expect(alpha).toEqual(['A', 'B', 'C']);

    const start = paramsToLayout(validateParams({
      action: 'createHall', hall: { lengthM: 100, widthM: 50 },
      gates: [{ count: 2, side: 'north', spacingM: 6 }], startNr: 10,
    }).filled).objects.map((o) => o.name);
    expect(start).toEqual(['Tor 10', 'Tor 11']);
  });

  it('#3: Parser erkennt „nach Seite" + „ab Nummer 10"', () => {
    expect(parseCanonical('Halle 100x50, 10 Tore Nord, nach Seite nummeriert')!.nummerierung).toBe('seite');
    expect(parseCanonical('Halle 100x50, 10 Tore Nord, ab Nummer 10')!.startNr).toBe(10);
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

describe('nl-layout — Cross-Dock (Stellplätze je Tor)', () => {
  // Jans Abnahme-Szenario: N/S-Tore, ein Stellplatz vor jedem Tor (12×3), 2 Bereiche, 6m Mittelgang.
  const scenario: LayoutParams = {
    action: 'createHall', hall: { lengthM: 150, widthM: 42 },
    gates: [{ count: 20, side: 'north', spacingM: 6 }, { count: 20, side: 'south', spacingM: 6 }],
    stellplaetzeJeTor: true, stellplatzLaengeM: 12, stellplatzBreiteM: 3,
    bereiche: 2, mittelgangM: 6,
  };

  it('baut genau einen Stellplatz je Tor mit korrekten Maßen (Länge in die Halle)', () => {
    const { filled } = validateParams(scenario);
    const { objects } = paramsToLayout(filled);
    const tore = objects.filter((o) => o.type === 'tor');
    const sp = objects.filter((o) => o.type === 'stellplatz');
    expect(tore).toHaveLength(40);
    expect(sp).toHaveLength(40); // je Tor genau einer
    // Breite entlang der Wand = 3, Tiefe in die Halle = 12.
    expect(sp.every((s) => s.width === 3 && s.height === 12)).toBe(true);
  });

  it('Stellplatz sitzt zentriert vor seinem Tor und außerhalb des Mittelgangs', () => {
    const { filled } = validateParams(scenario);
    const { objects } = paramsToLayout(filled);
    const tor = objects.find((o) => o.type === 'tor' && o.side === 'north')!;
    const sp = objects.find((o) => o.type === 'stellplatz' && o.y < 21)!;
    // Zentriert: gleiche Mitte-X wie das Tor.
    expect(sp.x + sp.width / 2).toBeCloseTo(tor.x + tor.width / 2, 1);
    // Mittelgang 6m mittig (y 18..24) bleibt frei.
    expect(sp.y + sp.height).toBeLessThanOrEqual(18 + 0.01);
  });

  it('baut genau 2 Bereiche (Nord-/Süd-Band), keine Grid-Stellplätze', () => {
    const { filled } = validateParams(scenario);
    const { objects } = paramsToLayout(filled);
    const bereiche = objects.filter((o) => o.type === 'bereich');
    expect(bereiche).toHaveLength(2);
    expect(bereiche[0].name).toBe('Bereich 1');
    expect(bereiche[1].name).toBe('Bereich 2');
    // Nord-Band oberhalb, Süd-Band unterhalb des Mittelgangs.
    expect(bereiche.some((b) => b.y < 18)).toBe(true);
    expect(bereiche.some((b) => b.y >= 24)).toBe(true);
  });

  it('End-to-End: freie Sprache → Cross-Dock-Halle', () => {
    const p = parseCanonical('Halle 150x42, 20 Tore Nord, 20 Tore Süd, ein Stellplatz je Tor 12x3, 2 Bereiche, 6 m Mittelgang')!;
    expect(p.stellplaetzeJeTor).toBe(true);
    expect(p.stellplatzLaengeM).toBe(12);
    expect(p.mittelgangM).toBe(6);
    const v = validateParams(p);
    expect(v.ok).toBe(true);
    const { objects } = paramsToLayout(v.filled);
    expect(objects.filter((o) => o.type === 'stellplatz')).toHaveLength(40);
    expect(objects.filter((o) => o.type === 'bereich')).toHaveLength(2);
  });

  it('benannte Zonen (Wareneingang West / Warenausgang Ost) werden gebaut, benannt + kollisionsfrei', () => {
    const p = parseCanonical('Halle 210x58, 50 Tore Nord Abstand 3,75, 50 Tore Süd Abstand 3,75, Wareneingang im Westen, Warenausgang im Osten, ein Stellplatz je Tor 12x3, 6 m Mittelgang')!;
    expect(p.zonen).toEqual([
      { name: 'Wareneingang', side: 'west' },
      { name: 'Warenausgang', side: 'east' },
    ]);
    const { objects } = paramsToLayout(validateParams(p).filled);
    const zonen = objects.filter((o) => o.type === 'bereich');
    expect(zonen.map((z) => z.name).sort()).toEqual(['Warenausgang', 'Wareneingang']);
    // KEINE halbe Halle mehr — Zonen sind moderat dimensioniert (≤ Default 20×15).
    expect(zonen.every((z) => z.width <= 20.01 && z.height <= 15.01)).toBe(true);
    // West-Zone links vom Warenausgang (Ost).
    const we = zonen.find((z) => z.name === 'Wareneingang')!;
    const wa = zonen.find((z) => z.name === 'Warenausgang')!;
    expect(we.x).toBeLessThan(wa.x);
    // Stellplätze je Tor bleiben erhalten; nichts überlappt.
    expect(objects.filter((o) => o.type === 'stellplatz')).toHaveLength(100);
    expect(findLayoutCollisions(objects)).toHaveLength(0);
  });

  it('explizite Zonenmaße (20×15) werden geehrt bzw. ehrlich verkleinert (nie halbe Halle)', () => {
    // Kleine, leere Halle → 20×15 passt exakt.
    const p = parseCanonical('Halle 80x40, 4 Tore Nord, Wareneingang West 20x15')!;
    expect(p.zonen?.[0]).toEqual({ name: 'Wareneingang', side: 'west', laengeM: 20, breiteM: 15 });
    const { objects } = paramsToLayout(validateParams(p).filled);
    const we = objects.find((o) => o.type === 'bereich')!;
    expect(we.width).toBeCloseTo(20, 1);
    expect(we.height).toBeCloseTo(15, 1);
    expect(findLayoutCollisions(objects)).toHaveLength(0);
  });

  it('Zonen liegen als Hintergrund VOR den Toren (unshift → zuerst gezeichnet)', () => {
    const p = parseCanonical('Halle 210x58, 50 Tore Nord Abstand 3,75, 50 Tore Süd Abstand 3,75, Wareneingang West, Warenausgang Ost, ein Stellplatz je Tor 12x3')!;
    const { objects } = paramsToLayout(validateParams(p).filled);
    expect(objects[0].type).toBe('bereich'); // Zone zuerst → hinter allem
    expect(objects[0].name).toBe('Wareneingang');
  });

  it('Grid-Modus bleibt erhalten, wenn NICHT je Tor', () => {
    const { filled } = validateParams({
      action: 'createHall', hall: { lengthM: 120, widthM: 50 },
      gates: [{ count: 10, side: 'north', spacingM: 6 }], bereiche: 2, stellplaetze: 6,
    });
    const { objects } = paramsToLayout(filled);
    expect(objects.filter((o) => o.type === 'bereich').length).toBeGreaterThan(0);
    expect(objects.filter((o) => o.type === 'stellplatz').length).toBeGreaterThan(0);
  });
});
