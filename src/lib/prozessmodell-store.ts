'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProzessmodellConfig, ProzessParameter, GesamtErgebnis, AbteilungDefinition } from '@/types/prozessmodell';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from '@/lib/data/prozessmodell-se';
import { berechneMinProColli } from '@/lib/prozessrechner';

interface ProzessmodellState {
  modell: ProzessmodellConfig;
  parameter: ProzessParameter[];
  ergebnis: GesamtErgebnis | null;

  // Actions
  setModell: (modell: ProzessmodellConfig) => void;
  setParameter: (parameter: ProzessParameter[]) => void;
  updateParameter: (id: string, wert: number) => void;
  setVerteilweg: (wegM: number) => void;
  setColliProTag: (colli: number) => void;
  ladeModell: (modell: ProzessmodellConfig, parameter: ProzessParameter[]) => void;
  berechne: () => void;
  reset: () => void;
}

export const useProzessmodellStore = create<ProzessmodellState>()(
  persist(
  (set, get) => ({
  modell: PROZESSMODELL_SE,
  parameter: SE_STANDARD_PARAMETER.map((p) => ({ ...p })),
  ergebnis: null,

  setModell: (modell) => set({ modell }),

  setParameter: (parameter) => set({ parameter }),

  updateParameter: (id, wert) => {
    set((state) => ({
      parameter: state.parameter.map((p) => (p.id === id ? { ...p, aktuellerWert: wert } : p)),
    }));
    // Auto-Berechnung
    get().berechne();
  },

  setVerteilweg: (wegM) => {
    set((state) => ({
      parameter: state.parameter.map((p) =>
        p.id === 'verteilweg' ? { ...p, aktuellerWert: wegM, quelle: 'layout' as const } : p
      ),
    }));
    get().berechne();
  },

  setColliProTag: (colli) => {
    set((state) => ({
      parameter: state.parameter.map((p) =>
        p.id === 'colliProTag' ? { ...p, aktuellerWert: colli, quelle: 'scandaten' as const } : p
      ),
    }));
    get().berechne();
  },

  ladeModell: (modell, parameter) => {
    set({
      modell,
      parameter: parameter.map((p) => ({ ...p })),
      ergebnis: null,
    });
    get().berechne();
  },

  berechne: () => {
    const { modell, parameter } = get();
    const ergebnis = berechneMinProColli(modell, parameter);
    set({ ergebnis });
  },

  reset: () =>
    set({
      modell: PROZESSMODELL_SE,
      parameter: SE_STANDARD_PARAMETER.map((p) => ({ ...p })),
      ergebnis: null,
    }),
}),
  {
    name: 'topis-prozessmodell',
    partialize: (state) => ({
      modell: state.modell,
      parameter: state.parameter,
      ergebnis: state.ergebnis,
    }),
  }
));

// Selectors
export const useProzessErgebnis = () => useProzessmodellStore((s) => s.ergebnis);
export const useProzessParameter = () => useProzessmodellStore((s) => s.parameter);
export const useProzessAbteilungen = () => useProzessmodellStore((s) => s.modell.abteilungen);
