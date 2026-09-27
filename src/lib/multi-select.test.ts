import { describe, it, expect } from 'vitest';
import {
  verteileGleichmaessig,
  verteileMitAchsabstand,
  verteileMitLuecke,
  richteAus,
  dominanteAchse,
  type VerteilItem,
} from './multi-select';

/** Torreihe: 4 Tore à 3.75 m, unregelmäßig gesetzt (so sieht es nach dem Einfügen aus). */
const unregelmaessig: VerteilItem[] = [
  { id: 1, pos: 0, size: 3.75 },
  { id: 2, pos: 7, size: 3.75 },
  { id: 3, pos: 9, size: 3.75 },
  { id: 4, pos: 30, size: 3.75 },
];

describe('verteileGleichmaessig', () => {
  it('erstes und letztes Tor bleiben stehen', () => {
    const r = verteileGleichmaessig(unregelmaessig);
    expect(r.has(1)).toBe(false);
    expect(r.has(4)).toBe(false);
  });

  it('erzeugt überall die gleiche Lücke', () => {
    const r = verteileGleichmaessig(unregelmaessig);
    const pos = unregelmaessig.map((i) => r.get(i.id) ?? i.pos);
    const luecken = [];
    for (let i = 1; i < pos.length; i++) {
      luecken.push(pos[i] - (pos[i - 1] + unregelmaessig[i - 1].size));
    }
    for (const l of luecken) expect(l).toBeCloseTo(luecken[0], 6);
  });

  it('unter 3 Elementen gibt es nichts zu verteilen', () => {
    expect(verteileGleichmaessig(unregelmaessig.slice(0, 2)).size).toBe(0);
  });

  it('ignoriert die Eingabereihenfolge, sortiert nach Position', () => {
    const gemischt = [unregelmaessig[2], unregelmaessig[0], unregelmaessig[3], unregelmaessig[1]];
    const a = verteileGleichmaessig(unregelmaessig);
    const b = verteileGleichmaessig(gemischt);
    expect([...b.entries()].sort()).toEqual([...a.entries()].sort());
  });
});

describe('verteileMitAchsabstand', () => {
  it('setzt Mitte-zu-Mitte exakt auf das Bauplanmaß', () => {
    const r = verteileMitAchsabstand(unregelmaessig, 5);
    const mitten = unregelmaessig.map((i) => (r.get(i.id) ?? i.pos) + i.size / 2);
    expect(mitten[1] - mitten[0]).toBeCloseTo(5);
    expect(mitten[2] - mitten[1]).toBeCloseTo(5);
    expect(mitten[3] - mitten[2]).toBeCloseTo(5);
  });

  it('erstes Element bleibt Fixpunkt', () => {
    const r = verteileMitAchsabstand(unregelmaessig, 5);
    expect(r.has(1)).toBe(false);
  });

  it('Achsabstand 0 oder negativ ändert nichts', () => {
    expect(verteileMitAchsabstand(unregelmaessig, 0).size).toBe(0);
    expect(verteileMitAchsabstand(unregelmaessig, -3).size).toBe(0);
  });
});

describe('verteileMitLuecke', () => {
  it('setzt den lichten Abstand zwischen den Kanten', () => {
    const r = verteileMitLuecke(unregelmaessig, 1.25);
    const pos = unregelmaessig.map((i) => r.get(i.id) ?? i.pos);
    for (let i = 1; i < pos.length; i++) {
      expect(pos[i] - (pos[i - 1] + unregelmaessig[i - 1].size)).toBeCloseTo(1.25);
    }
  });

  it('Lücke 0 legt die Tore auf Stoß', () => {
    const r = verteileMitLuecke(unregelmaessig, 0);
    const pos = unregelmaessig.map((i) => r.get(i.id) ?? i.pos);
    expect(pos[1]).toBeCloseTo(3.75);
    expect(pos[2]).toBeCloseTo(7.5);
    expect(pos[3]).toBeCloseTo(11.25);
  });

  it('rechnet mit unterschiedlich breiten Objekten', () => {
    const gemischt: VerteilItem[] = [
      { id: 1, pos: 0, size: 3 },
      { id: 2, pos: 10, size: 6 },
      { id: 3, pos: 20, size: 2 },
    ];
    const r = verteileMitLuecke(gemischt, 2);
    expect(r.get(2)).toBeCloseTo(5);  // 0 + 3 + 2
    expect(r.get(3)).toBeCloseTo(13); // 5 + 6 + 2
  });
});

describe('richteAus', () => {
  const versetzt: VerteilItem[] = [
    { id: 1, pos: 10, size: 4 },
    { id: 2, pos: 12, size: 2 },
    { id: 3, pos: 9, size: 6 },
  ];

  it('start: alle auf die kleinste führende Kante', () => {
    const r = richteAus(versetzt, 'start');
    expect(r.get(1)).toBeCloseTo(9);
    expect(r.get(2)).toBeCloseTo(9);
    expect(r.has(3)).toBe(false);
  });

  it('ende: alle auf die größte hintere Kante', () => {
    const r = richteAus(versetzt, 'ende'); // max Kante = 9+6 = 15
    expect(r.get(1)).toBeCloseTo(11);
    expect(r.get(2)).toBeCloseTo(13);
  });

  it('mitte: alle auf die gemittelte Mitte', () => {
    const r = richteAus(versetzt, 'mitte'); // Mitten 12, 13, 12 → 12.333
    const ziel = (12 + 13 + 12) / 3;
    expect((r.get(1) ?? versetzt[0].pos) + 2).toBeCloseTo(ziel);
    expect((r.get(2) ?? versetzt[1].pos) + 1).toBeCloseTo(ziel);
  });
});

describe('dominanteAchse', () => {
  it('Torreihe an der Nordwand spannt in x', () => {
    const boxes = [
      { x: 0, y: 0, width: 3.75, height: 0.5 },
      { x: 20, y: 0, width: 3.75, height: 0.5 },
      { x: 60, y: 0, width: 3.75, height: 0.5 },
    ];
    expect(dominanteAchse(boxes)).toBe('x');
  });

  it('Torreihe an der Ostwand spannt in y', () => {
    const boxes = [
      { x: 99, y: 0, width: 0.5, height: 3.75 },
      { x: 99, y: 20, width: 0.5, height: 3.75 },
      { x: 99, y: 40, width: 0.5, height: 3.75 },
    ];
    expect(dominanteAchse(boxes)).toBe('y');
  });
});
