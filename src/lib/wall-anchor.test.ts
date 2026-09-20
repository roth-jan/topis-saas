import { describe, it, expect } from 'vitest';
import {
  findNearestWall,
  anchorToWorldPoint,
  torBoxFromAnchor,
  rampeBoxFromAnchor,
  reanchorTore,
  isValidTorPosition,
  deriveWalls,
} from './wall-anchor';
import type { Wall, TopisObject } from '@/types/topis';

const rechteckHalle: Wall[] = [
  { x1: 0, y1: 0, x2: 100, y2: 0 },   // Index 0: Nord
  { x1: 100, y1: 0, x2: 100, y2: 50 }, // Index 1: Ost
  { x1: 100, y1: 50, x2: 0, y2: 50 },  // Index 2: Süd
  { x1: 0, y1: 50, x2: 0, y2: 0 },     // Index 3: West
];

describe('findNearestWall', () => {
  it('Klick nahe Nord-Wand → wallIndex 0', () => {
    const r = findNearestWall(50, 1, rechteckHalle);
    expect(r).not.toBeNull();
    expect(r!.wallIndex).toBe(0);
    expect(r!.side).toBe('north');
    expect(r!.abstandS).toBeCloseTo(50);
    expect(r!.abstandE).toBeCloseTo(50);
  });

  it('Klick nahe Süd-Wand → wallIndex 2', () => {
    const r = findNearestWall(30, 49, rechteckHalle);
    expect(r!.wallIndex).toBe(2);
    expect(r!.side).toBe('south');
    // Süd-Wand verläuft 100→0, also S=Punkt(100,50), E=Punkt(0,50)
    expect(r!.abstandS).toBeCloseTo(70); // 100-30
  });

  it('Klick weit weg → null bei maxDistance', () => {
    expect(findNearestWall(50, 25, rechteckHalle, 5)).toBeNull();
  });

  it('Klick auf West-Wand → wallIndex 3, side=west', () => {
    const r = findNearestWall(1, 25, rechteckHalle);
    expect(r!.wallIndex).toBe(3);
    expect(r!.side).toBe('west');
  });
});

describe('anchorToWorldPoint', () => {
  it('liefert Punkt zurück und behält Seite', () => {
    const p = anchorToWorldPoint({ wallIndex: 0, abstandS: 30, abstandE: 70 }, rechteckHalle);
    expect(p).not.toBeNull();
    expect(p!.x).toBeCloseTo(30);
    expect(p!.y).toBeCloseTo(0);
    expect(p!.side).toBe('north');
  });

  it('null bei ungültigem wallIndex', () => {
    expect(anchorToWorldPoint({ wallIndex: 99, abstandS: 0, abstandE: 0 }, rechteckHalle)).toBeNull();
  });
});

describe('torBoxFromAnchor — Tor-Box-Position relativ zur Wand', () => {
  it('Nord-Wand: Tor-Innenkante = Wand', () => {
    const b = torBoxFromAnchor({ wallIndex: 0, abstandS: 30, abstandE: 70 }, rechteckHalle, 3.5, 1.5);
    expect(b).not.toBeNull();
    expect(b!.x).toBeCloseTo(30 - 3.5 / 2); // Mitte des Tores bei x=30
    expect(b!.y).toBe(0); // Innenkante auf y=0
    expect(b!.side).toBe('north');
  });

  it('Süd-Wand: Tor ragt nach innen (y < 50)', () => {
    const b = torBoxFromAnchor({ wallIndex: 2, abstandS: 30, abstandE: 70 }, rechteckHalle, 3.5, 1.5);
    expect(b!.side).toBe('south');
    expect(b!.y).toBeCloseTo(50 - 1.5);
  });
});

describe('reanchorTore — Wand-Move zieht Tore mit', () => {
  it('verschiebt verankertes Tor wenn Wand sich verschiebt (Nord-Tor)', () => {
    const tor: TopisObject = {
      id: 1, type: 'tor', name: 'T1', x: 30 - 3.5 / 2, y: 0, width: 3.5, height: 1.5, side: 'north',
      aussenwandRef: { wallIndex: 0, abstandS: 30, abstandE: 70 },
    };
    const verlaengerteWaende: Wall[] = [
      { x1: 0, y1: 10, x2: 100, y2: 10 }, // Nord-Wand jetzt bei y=10 statt y=0
      ...rechteckHalle.slice(1),
    ];
    const result = reanchorTore([tor], verlaengerteWaende);
    // side='north' bleibt erhalten: Tor-Innenkante (y) = Wand-y (10)
    expect(result[0].y).toBeCloseTo(10);
    expect(result[0].x).toBeCloseTo(30 - 3.5 / 2);
  });

  it('lässt unverankerte Objekte unverändert', () => {
    const obj: TopisObject = {
      id: 1, type: 'stellplatz', name: 'SP', x: 5, y: 5, width: 2, height: 2,
    };
    const result = reanchorTore([obj], rechteckHalle);
    expect(result[0]).toBe(obj);
  });
});

describe('deriveWalls — Außenwände aus Hallen-Geometrie (Lastenheft 3.1.1.1)', () => {
  it('rect-Halle 100×50 → 4 Wände im Uhrzeigersinn (N,O,S,W)', () => {
    const walls = deriveWalls({ width: 100, height: 50 });
    expect(walls).toHaveLength(4);
    // Reihenfolge/Richtung muss zur wallIndex-Konvention der Tests passen
    expect(walls[0]).toEqual({ x1: 0, y1: 0, x2: 100, y2: 0 });   // Nord
    expect(walls[1]).toEqual({ x1: 100, y1: 0, x2: 100, y2: 50 }); // Ost
    expect(walls[2]).toEqual({ x1: 100, y1: 50, x2: 0, y2: 50 });  // Süd
    expect(walls[3]).toEqual({ x1: 0, y1: 50, x2: 0, y2: 0 });     // West
  });

  it('entartete Halle (0-Maß) → keine Wände statt Müll-Segmente', () => {
    expect(deriveWalls({ width: 0, height: 50 })).toEqual([]);
    expect(deriveWalls({ width: 100, height: 0 })).toEqual([]);
  });

  it('Tor an der Nordkante einer abgeleiteten Halle ist verankerbar (Niko-Bug)', () => {
    // Reproduziert Schritt 4: Tor sitzt an der oberen Wand, muss erkannt werden.
    const walls = deriveWalls({ width: 150, height: 42 });
    const tor: TopisObject = { id: 1, type: 'tor', name: 'Tor 1', x: 70, y: 0, width: 3.5, height: 1.5 };
    const nearest = findNearestWall(tor.x + tor.width / 2, tor.y + tor.height / 2, walls, 30);
    expect(nearest).not.toBeNull();
    expect(nearest!.side).toBe('north');
    const anchored: TopisObject = {
      ...tor,
      aussenwandRef: { wallIndex: nearest!.wallIndex, abstandS: nearest!.abstandS, abstandE: nearest!.abstandE },
    };
    expect(isValidTorPosition(anchored, walls)).toBe(true);
  });
});

describe('rampeBoxFromAnchor — Rampen außen an der Wand (Lastenheft 3.1.2.2)', () => {
  const W = 100, H = 50;
  it('Nordwand: Rampe liegt OBERHALB (außen), Innenkante auf y=0', () => {
    const box = rampeBoxFromAnchor({ wallIndex: 0, abstandS: 50, abstandE: 50 }, rechteckHalle, 4, 8);
    expect(box).not.toBeNull();
    expect(box!.side).toBe('north');
    expect(box!.y).toBe(0 - 8);          // ragt nach außen (negativ)
    expect(box!.x).toBeCloseTo(50 - 4 / 2, 5); // mittig um Ankerpunkt
  });
  it('Südwand: Rampe liegt UNTERHALB (außen), Innenkante auf y=H', () => {
    const box = rampeBoxFromAnchor({ wallIndex: 2, abstandS: 50, abstandE: 50 }, rechteckHalle, 4, 8);
    expect(box!.side).toBe('south');
    expect(box!.y).toBe(H);              // beginnt an der Wand, geht nach außen
  });
  it('Ostwand: Rampe liegt RECHTS (außen), Innenkante auf x=W', () => {
    const box = rampeBoxFromAnchor({ wallIndex: 1, abstandS: 25, abstandE: 25 }, rechteckHalle, 6, 10);
    expect(box!.side).toBe('east');
    expect(box!.x).toBe(W);
  });
  it('Westwand: Rampe liegt LINKS (außen)', () => {
    const box = rampeBoxFromAnchor({ wallIndex: 3, abstandS: 25, abstandE: 25 }, rechteckHalle, 6, 10);
    expect(box!.side).toBe('west');
    expect(box!.x).toBe(0 - 6);
  });
  it('Tor vs. Rampe an derselben Nordwand liegen auf gegenüberliegenden Seiten', () => {
    const anchor = { wallIndex: 0, abstandS: 50, abstandE: 50 };
    const tor = torBoxFromAnchor(anchor, rechteckHalle, 4, 2);
    const rampe = rampeBoxFromAnchor(anchor, rechteckHalle, 4, 2);
    expect(tor!.y).toBe(0);       // Tor nach innen
    expect(rampe!.y).toBe(0 - 2); // Rampe nach außen
  });
});

describe('reanchorTore — zieht auch Rampen mit (Lastenheft 3.1.2.2)', () => {
  it('Rampe folgt der Wand nach außen bei Geometrie-Änderung', () => {
    const rampe: TopisObject = {
      id: 1, type: 'rampe', name: 'R1', x: 48, y: -8, width: 4, height: 8, side: 'north',
      aussenwandRef: { wallIndex: 0, abstandS: 50, abstandE: 50 },
    };
    const out = reanchorTore([rampe], rechteckHalle);
    expect(out[0].y).toBe(-8);            // bleibt außen
    expect(out[0].x).toBeCloseTo(48, 5);
  });
});

describe('isValidTorPosition — Lastenheft-Validierung', () => {
  it('Tor OHNE aussenwandRef ist ungültig', () => {
    const tor: TopisObject = { id: 1, type: 'tor', name: 'T', x: 50, y: 25, width: 3, height: 1 };
    expect(isValidTorPosition(tor, rechteckHalle)).toBe(false);
  });

  it('Tor MIT gültiger aussenwandRef ist gültig', () => {
    const tor: TopisObject = {
      id: 1, type: 'tor', name: 'T', x: 0, y: 0, width: 3, height: 1,
      aussenwandRef: { wallIndex: 0, abstandS: 30, abstandE: 70 },
    };
    expect(isValidTorPosition(tor, rechteckHalle)).toBe(true);
  });

  it('Nicht-Tor-Objekte sind immer gültig (nur Tore brauchen Wand-Anker)', () => {
    const sp: TopisObject = { id: 1, type: 'stellplatz', name: 'SP', x: 5, y: 5, width: 2, height: 2 };
    expect(isValidTorPosition(sp, rechteckHalle)).toBe(true);
  });
});
