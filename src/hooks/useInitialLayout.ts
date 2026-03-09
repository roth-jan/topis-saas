'use client';

import { useEffect, useRef } from 'react';
import { useTopisStore } from '@/lib/store';
import { TopisObject, Gang } from '@/types/topis';

/**
 * Andreas Schmid Gersthofen - Halle 6 IST-Stand (01.10.2018)
 *
 * Basierend auf:
 * - "Neu Halle 6 IST Stand 01.10.2018.pdf"
 * - "Halle_IA 12.02.2019.pdf"
 * - Lagerhalle.mdb (Hallenmodul)
 * - Messungen_DK.xlsx
 * - Wege_Halle6.xlsx
 *
 * Halle: 150.80m × 42m
 * Tore: 85 gesamt (Süd 1-38, Ost 39-46, Nord 47-85)
 * Sektionen Nord: 8, 7, 6, 5, 4
 * Sektionen Süd: 1, 1A, 2, 3, EX
 * Kette/Band: Zentral durch die Halle
 * Entladezonen: EZ 1 (Tore 19-26), EZ 2 (Tore 65-73), EZ 3 (Tore 78-80)
 */
function createSchmidHalle6(): {
  objects: Omit<TopisObject, 'id'>[];
  gaenge: Gang[];
  hall: { width: number; height: number; name: string };
} {
  const objects: Omit<TopisObject, 'id'>[] = [];
  const W = 151, H = 42;
  const torW = 3, torD = 1.5;

  // ============================================================
  // SÜDSEITE - Tore 1-38 (links nach rechts)
  // Pitch: ~3.9m, Lücke zwischen Tor 22 und 23 (Ketteneinfahrt)
  // ============================================================
  // Tore 1-22 (linke Hälfte)
  for (let i = 0; i < 22; i++) {
    objects.push({
      type: 'tor', x: 1 + i * 3.85, y: H - torD,
      width: torW, height: torD,
      name: `Tor ${i + 1}`, torNummer: i + 1,
    });
  }
  // Tore 23-38 (rechte Hälfte, nach Lücke)
  for (let i = 0; i < 16; i++) {
    objects.push({
      type: 'tor', x: 93 + i * 3.55, y: H - torD,
      width: torW, height: torD,
      name: `Tor ${23 + i}`, torNummer: 23 + i,
    });
  }

  // ============================================================
  // OSTSEITE - Tore 39-46 (vertikal, rechte Wand)
  // ============================================================
  for (let i = 0; i < 8; i++) {
    objects.push({
      type: 'tor', x: W - torD, y: 33 - i * 3.5,
      width: torD, height: torW,
      name: `Tor ${39 + i}`, torNummer: 39 + i,
    });
  }

  // ============================================================
  // NORDSEITE - Tore 47-85 (rechts nach links, 47=rechts, 85=links)
  // 39 Tore, Pitch: ~3.84m
  // ============================================================
  for (let i = 0; i < 39; i++) {
    // 85 ist links (i=0), 47 ist rechts (i=38)
    objects.push({
      type: 'tor', x: 1 + i * 3.84, y: 0,
      width: torW, height: torD,
      name: `Tor ${85 - i}`, torNummer: 85 - i,
    });
  }

  // ============================================================
  // KUNDENZONEN SÜDEN (entlang Südtore)
  // AS, Logistix, Murphy, Strauss, A.Sigl | VT, G.Sigl, EX
  // ============================================================
  const kundenSued = [
    { name: 'AS',       color: '#ef4444', x: 1,   w: 15 },   // Tore 1-4
    { name: 'Logistix', color: '#3b82f6', x: 16,  w: 12 },   // Tore 5-7
    { name: 'Murphy',   color: '#a855f7', x: 28,  w: 12 },   // Tore 8-10
    { name: 'Strauss',  color: '#f59e0b', x: 40,  w: 15 },   // Tore 11-14
    { name: 'A.Sigl',   color: '#ec4899', x: 55,  w: 12 },   // Tore 15-18
    { name: 'VT',       color: '#8b5cf6', x: 118, w: 12 },   // Tore ~30-32
    { name: 'G.Sigl',   color: '#06b6d4', x: 130, w: 12 },   // Tore ~33-36
  ];
  kundenSued.forEach(k => {
    objects.push({
      type: 'bereich', x: k.x, y: H - 3.5, width: k.w, height: 2,
      name: k.name, color: k.color,
    });
  });

  // ============================================================
  // KUNDENZONEN NORDEN (entlang Nordtore)
  // AS Überschneidung, Strauss, VT, Fischer & VT, Fischer, G.Sigl, Huber
  // ============================================================
  const kundenNord = [
    { name: 'AS Ü.79',        color: '#ef4444', x: 1,   w: 18 },  // Tore 85-79
    { name: 'Strauss',         color: '#f59e0b', x: 20,  w: 8 },   // Tore 78-77
    { name: 'VT',              color: '#8b5cf6', x: 29,  w: 8 },   // Tore 76-75
    { name: 'Fischer&VT 70/71',color: '#14b8a6', x: 38,  w: 22 },  // Tore 74-70
    { name: 'Fischer',         color: '#14b8a6', x: 78,  w: 20 },  // Tore 64-60
    { name: 'G.Sigl',          color: '#06b6d4', x: 100, w: 20 },  // Tore 59-52
    { name: 'Huber',           color: '#22c55e', x: 122, w: 27 },  // Tore 51-47
  ];
  kundenNord.forEach(k => {
    objects.push({
      type: 'bereich', x: k.x, y: 1.5, width: k.w, height: 2,
      name: k.name, color: k.color,
    });
  });

  // ============================================================
  // STELLPLATZ-SEKTIONEN NORDHÄLFTE (Sektionen 8, 7, 6, 5, 4)
  // Zwei Reihen pro Sektion, getrennt durch Regalgang
  // ============================================================
  const sektionenNord = [
    { name: 'Sektion 8', x: 2,   w: 26 },
    { name: 'Sektion 7', x: 31,  w: 30 },
    { name: 'Sektion 6', x: 80,  w: 18 },
    { name: 'Sektion 5', x: 101, w: 18 },
    { name: 'Sektion 4', x: 122, w: 24 },
  ];
  sektionenNord.forEach(s => {
    // Obere Stellplatzreihe (nahe Nordtore)
    objects.push({
      type: 'stellplatz', x: s.x, y: 4, width: s.w, height: 6,
      name: s.name + ' oben', color: '#334155',
    });
    // Untere Stellplatzreihe
    objects.push({
      type: 'stellplatz', x: s.x, y: 11, width: s.w, height: 6,
      name: s.name + ' unten', color: '#334155',
    });
  });

  // ============================================================
  // STELLPLATZ-SEKTIONEN SÜDHÄLFTE (Sektionen 1, 1A, 2, 3)
  // ============================================================
  const sektionenSued = [
    { name: 'Sektion 1',  x: 2,   w: 26 },
    { name: 'Sektion 1A', x: 31,  w: 22 },
    { name: 'Sektion 2',  x: 56,  w: 20 },
    { name: 'Sektion 3',  x: 118, w: 22 },
  ];
  sektionenSued.forEach(s => {
    // Obere Reihe (nahe Hauptgang)
    objects.push({
      type: 'stellplatz', x: s.x, y: 24, width: s.w, height: 6,
      name: s.name + ' oben', color: '#334155',
    });
    // Untere Reihe (nahe Südtore)
    objects.push({
      type: 'stellplatz', x: s.x, y: 31, width: s.w, height: 6,
      name: s.name + ' unten', color: '#334155',
    });
  });

  // ============================================================
  // SONDERBEREICHE
  // ============================================================

  // BP 1 & BP 2 (Bereitstellplätze) - Nordhälfte, zwischen Sektion 7 und 6
  objects.push({
    type: 'bereich', x: 63, y: 5, width: 7, height: 12,
    name: 'BP 2', color: '#78716c',
  });
  objects.push({
    type: 'bereich', x: 71, y: 5, width: 7, height: 12,
    name: 'BP 1', color: '#78716c',
  });

  // ÜZ SE (Überzählige Sendungseingänge) - Südhälfte
  objects.push({
    type: 'bereich', x: 78, y: 25, width: 10, height: 8,
    name: 'ÜZ SE', color: '#a3a3a3',
  });

  // Paletten-Bereich - Südhälfte, großer Block
  objects.push({
    type: 'stellplatz', x: 90, y: 25, width: 25, height: 12,
    name: 'Paletten', color: '#78716c',
  });

  // BP 1 & BP 2 Südhälfte
  objects.push({
    type: 'bereich', x: 82, y: 34, width: 10, height: 4,
    name: 'BP 1 Süd', color: '#78716c',
  });
  objects.push({
    type: 'bereich', x: 93, y: 34, width: 10, height: 4,
    name: 'BP 2 Süd', color: '#78716c',
  });

  // Büro (rechts oben)
  objects.push({
    type: 'buero', x: W - 6, y: 4, width: 5, height: 8,
    name: 'Büro', color: '#6366f1',
  });

  // EX-Bereich (Süd, ganz rechts)
  objects.push({
    type: 'bereich', x: 142, y: 31, width: 7, height: 6,
    name: 'EX', color: '#dc2626',
  });

  // ============================================================
  // KETTE / FÖRDERBAND (Zentral durch die Halle)
  // Kettebreite ca. 2m, läuft horizontal durch die Mitte
  // ============================================================
  objects.push({
    type: 'hindernis', x: 10, y: 19.5, width: 130, height: 3,
    name: 'Kette/Förderband', color: '#475569',
  });

  // ============================================================
  // ENTLADEZONEN (aus Wege_Halle6.xlsx)
  // EZ 1: Tore 19-26, EZ 2: Tore 65-73, EZ 3: Tore 78-80
  // ============================================================
  objects.push({
    type: 'entladebereich', x: 67, y: H - 4, width: 20, height: 2.5,
    name: 'EZ 1 (Tore 19-26)', color: '#4ade80',
  });
  objects.push({
    type: 'entladebereich', x: 44, y: 1.5, width: 30, height: 2,
    name: 'EZ 2 (Tore 65-73)', color: '#4ade80',
  });
  objects.push({
    type: 'entladebereich', x: 17, y: 1.5, width: 10, height: 2,
    name: 'EZ 3 (Tore 78-80)', color: '#4ade80',
  });

  // ============================================================
  // GÄNGE (Fahrwege)
  // Hauptgang horizontal, Quergänge vertikal zwischen Sektionen
  // ============================================================
  let gangId = 1;
  const gaenge: Gang[] = [];

  // Hauptgang Nord (horizontal, zwischen Stellplatzreihen Nord)
  gaenge.push({
    id: gangId++, name: 'Hauptgang Nord',
    points: [{ x: 0, y: 10.5 }, { x: W, y: 10.5 }],
    breite: 3.5, typ: 'hauptgang', farbe: '#22c55e',
  });

  // Hauptgang Mitte (horizontal, neben der Kette)
  gaenge.push({
    id: gangId++, name: 'Hauptgang Mitte',
    points: [{ x: 0, y: 18.5 }, { x: W, y: 18.5 }],
    breite: 3, typ: 'hauptgang', farbe: '#22c55e',
  });
  gaenge.push({
    id: gangId++, name: 'Hauptgang Mitte Süd',
    points: [{ x: 0, y: 23 }, { x: W, y: 23 }],
    breite: 3, typ: 'hauptgang', farbe: '#22c55e',
  });

  // Hauptgang Süd (horizontal, zwischen Stellplatzreihen Süd)
  gaenge.push({
    id: gangId++, name: 'Hauptgang Süd',
    points: [{ x: 0, y: 30.5 }, { x: W, y: 30.5 }],
    breite: 3.5, typ: 'hauptgang', farbe: '#22c55e',
  });

  // Quergänge (vertikal, zwischen Sektionen)
  const quergangX = [0.5, 29, 54, 63, 78, 99, 119, 141, W - 0.5];
  quergangX.forEach((x, i) => {
    gaenge.push({
      id: gangId++, name: `Quergang ${i + 1}`,
      points: [{ x, y: 0 }, { x, y: H }],
      breite: 3, typ: 'quergang', farbe: '#22c55e',
    });
  });

  // Zufahrten von Toren zu Sektionen (vertikal, innerhalb Sektionen)
  const zufahrtX = [14, 42, 66, 90, 110, 130];
  zufahrtX.forEach((x, i) => {
    gaenge.push({
      id: gangId++, name: `Zufahrt ${i + 1}`,
      points: [{ x, y: 1.5 }, { x, y: 18 }],
      breite: 2.5, typ: 'regalgang', farbe: '#4ade80',
    });
    gaenge.push({
      id: gangId++, name: `Zufahrt ${i + 1} Süd`,
      points: [{ x, y: 23 }, { x, y: H - 1.5 }],
      breite: 2.5, typ: 'regalgang', farbe: '#4ade80',
    });
  });

  return {
    objects,
    gaenge,
    hall: { width: W, height: H, name: 'Halle 6 - Andreas Schmid Gersthofen' }
  };
}

/**
 * Hook: Lädt das Andreas Schmid Halle 6 Layout beim ersten Seitenaufruf.
 * Überschreibt nicht, wenn bereits Objekte vorhanden sind.
 */
export function useInitialLayout() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const state = useTopisStore.getState();
    if (state.objects.length > 0) return;

    const { updateHall, addObject, setGaenge } = useTopisStore.getState();
    const layout = createSchmidHalle6();

    updateHall(1, {
      width: layout.hall.width,
      height: layout.hall.height,
      name: layout.hall.name,
      color: '#16213e'
    });

    layout.objects.forEach(obj => addObject(obj));
    setGaenge(layout.gaenge);
  }, []);
}
