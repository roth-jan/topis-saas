'use client';

import { useEffect, useRef } from 'react';
import { useTopisStore } from '@/lib/store';
import { TopisObject } from '@/types/topis';
import { generateGaenge, DEFAULT_GANG_SETTINGS } from '@/lib/gang-generator';

/**
 * Creates the Andreas Schmid Nachher (SOLL) layout
 * 150m × 50m hall, 85 gates, 48 parking spots, 6 customer areas, optimized corridors
 */
function createSchmidLayout(): { objects: Omit<TopisObject, 'id'>[]; hall: { width: number; height: number; name: string } } {
  const objects: Omit<TopisObject, 'id'>[] = [];
  const w = 150, h = 50;
  const torWidth = 3, torDepth = 1.5;

  // Nordseite - 38 Tore
  for (let i = 0; i < 38; i++) {
    objects.push({
      type: 'tor',
      x: 1 + i * 3.9,
      y: 0,
      width: torWidth,
      height: torDepth,
      name: `Tor ${i + 1}`,
      color: '#22c55e',
    });
  }

  // Südseite - 47 Tore
  for (let i = 0; i < 47; i++) {
    objects.push({
      type: 'tor',
      x: 1 + i * 3.1,
      y: h - torDepth,
      width: torWidth,
      height: torDepth,
      name: `Tor ${39 + i}`,
      color: '#22c55e',
    });
  }

  // Nordseite Stellplätze - näher an nördlichen Toren
  for (let i = 0; i < 24; i++) {
    objects.push({
      type: 'stellplatz',
      x: 5 + i * 6,
      y: 3,
      width: 5,
      height: 2.5,
      name: `N${String(i + 1).padStart(2, '0')}`,
      color: '#3b82f6',
    });
  }

  // Südseite Stellplätze - näher an südlichen Toren
  for (let i = 0; i < 24; i++) {
    objects.push({
      type: 'stellplatz',
      x: 5 + i * 6,
      y: h - 5.5,
      width: 5,
      height: 2.5,
      name: `S${String(i + 1).padStart(2, '0')}`,
      color: '#3b82f6',
    });
  }

  // Kunden-Bereiche
  const kunden = [
    { name: 'AS', color: '#ef4444', x: 5, w: 20 },
    { name: 'Logistix', color: '#3b82f6', x: 28, w: 18 },
    { name: 'Murphy', color: '#a855f7', x: 50, w: 15 },
    { name: 'Strauss', color: '#f59e0b', x: 70, w: 18 },
    { name: 'Fischer', color: '#14b8a6', x: 95, w: 20 },
    { name: 'G.Sigl', color: '#ec4899', x: 120, w: 15 },
  ];

  kunden.forEach(k => {
    objects.push({
      type: 'bereich',
      x: k.x,
      y: 22,
      width: k.w,
      height: 6,
      name: k.name,
      color: k.color,
    });
  });

  return {
    objects,
    hall: { width: w, height: h, name: 'Halle 6 - Andreas Schmid' }
  };
}

/**
 * Hook that loads the Andreas Schmid layout on first page load
 * Only runs once, does not overwrite if objects already exist
 */
export function useInitialLayout() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const state = useTopisStore.getState();
    // Only initialize if the canvas is empty
    if (state.objects.length > 0) return;

    const { updateHall, addObject, setGaenge } = useTopisStore.getState();
    const layout = createSchmidLayout();

    // Set hall dimensions
    updateHall(1, {
      width: layout.hall.width,
      height: layout.hall.height,
      name: layout.hall.name,
      color: '#16213e'
    });

    // Add all objects
    layout.objects.forEach(obj => addObject(obj));

    // Generate corridors
    const currentHall = useTopisStore.getState().halls[0];
    const currentObjects = useTopisStore.getState().objects;
    const gaenge = generateGaenge(currentHall, currentObjects, {
      ...DEFAULT_GANG_SETTINGS,
      hauptgangBreite: 4,
      regalgangBreite: 3,
    });
    setGaenge(gaenge);
  }, []);
}
