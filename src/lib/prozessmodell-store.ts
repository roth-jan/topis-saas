'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProzessmodellConfig, ProzessParameter, GesamtErgebnis, AbteilungDefinition } from '@/types/prozessmodell';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from '@/lib/data/prozessmodell-se';
import { berechneMinProColli, type FFZMixEintrag } from '@/lib/prozessrechner';

/** Standard-FFZ-Mix basierend auf AS Gersthofen 2020 (Präsentation Prozessmodell UPDATE) */
const DEFAULT_FFZ_MIX: FFZMixEintrag[] = [
  { name: 'Schnelläufer', geschwindigkeitMs: 2.44, colliProBewegung: 1.4, anteil: 0.6 },
  { name: 'Stapler', geschwindigkeitMs: 2.86, colliProBewegung: 1.2, anteil: 0.3 },
  { name: 'Langgabel', geschwindigkeitMs: 2.24, colliProBewegung: 1.0, anteil: 0.1 },
];

interface ProzessmodellState {
  modell: ProzessmodellConfig;
  parameter: ProzessParameter[];
  ergebnis: GesamtErgebnis | null;
  /** Fahrzeugmix für Verteilweg-Berechnung (Lastenheft-Formel) */
  ffzMix: FFZMixEintrag[];

  // Actions
  setModell: (modell: ProzessmodellConfig) => void;
  setParameter: (parameter: ProzessParameter[]) => void;
  updateParameter: (id: string, wert: number) => void;
  setVerteilweg: (wegM: number) => void;
  setColliProTag: (colli: number) => void;
  /** FFZ-Mix setzen und neu berechnen */
  setFFZMix: (mix: FFZMixEintrag[]) => void;
  /** Einzelnen FFZ-Eintrag aktualisieren (nach Index) */
  updateFFZMixEintrag: (index: number, eintrag: Partial<FFZMixEintrag>) => void;
  /** FFZ-Eintrag hinzufügen */
  addFFZMixEintrag: (eintrag: FFZMixEintrag) => void;
  /** FFZ-Eintrag entfernen */
  removeFFZMixEintrag: (index: number) => void;
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
  ffzMix: DEFAULT_FFZ_MIX.map((e) => ({ ...e })),

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

  setFFZMix: (mix) => {
    set({ ffzMix: mix });
    get().berechne();
  },

  updateFFZMixEintrag: (index, eintrag) => {
    set((state) => ({
      ffzMix: state.ffzMix.map((e, i) => (i === index ? { ...e, ...eintrag } : e)),
    }));
    get().berechne();
  },

  addFFZMixEintrag: (eintrag) => {
    set((state) => ({ ffzMix: [...state.ffzMix, eintrag] }));
    get().berechne();
  },

  removeFFZMixEintrag: (index) => {
    set((state) => ({ ffzMix: state.ffzMix.filter((_, i) => i !== index) }));
    get().berechne();
  },

  ladeModell: (modell, parameter) => {
    // SE-Template bekommt den kalibrierten Default-Mix (AS Gersthofen 60/30/10).
    // Alle anderen Templates (Geis, Nörpel, etc.) bekommen leeren Mix →
    // Fallback auf ihre eigenen colliProFahrt/schnellaeuferGeschwindigkeit Parameter.
    const istSE = modell.prozessTyp === 'se';
    set({
      modell,
      parameter: parameter.map((p) => ({ ...p })),
      ergebnis: null,
      ffzMix: istSE ? DEFAULT_FFZ_MIX.map((e) => ({ ...e })) : [],
    });
    get().berechne();
  },

  berechne: () => {
    const { modell, parameter, ffzMix } = get();
    const ergebnis = berechneMinProColli(modell, parameter, ffzMix);
    set({ ergebnis });
  },

  reset: () =>
    set({
      modell: PROZESSMODELL_SE,
      parameter: SE_STANDARD_PARAMETER.map((p) => ({ ...p })),
      ergebnis: null,
      ffzMix: DEFAULT_FFZ_MIX.map((e) => ({ ...e })),
    }),
}),
  {
    name: 'topis-prozessmodell',
    partialize: (state) => ({
      modell: state.modell,
      parameter: state.parameter,
      ergebnis: state.ergebnis,
      ffzMix: state.ffzMix,
    }),
  }
));

// Selectors
export const useProzessErgebnis = () => useProzessmodellStore((s) => s.ergebnis);
export const useProzessParameter = () => useProzessmodellStore((s) => s.parameter);
export const useProzessAbteilungen = () => useProzessmodellStore((s) => s.modell.abteilungen);
export const useFFZMix = () => useProzessmodellStore((s) => s.ffzMix);
