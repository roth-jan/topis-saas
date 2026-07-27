'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDebouncedLocalStorage } from '@/lib/debounced-storage';
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
  /** Herkunft der aktuell angezeigten Zahlen (damit Kennzahlen nie „fremde" Werte ohne Kontext zeigen). */
  datenHerkunft: { projektName?: string; datenquelle?: 'vorlage' | 'check' | 'scandaten' | 'excel' | 'manuell'; zeitraum?: string } | null;

  // Actions
  setModell: (modell: ProzessmodellConfig) => void;
  setDatenHerkunft: (herkunft: ProzessmodellState['datenHerkunft']) => void;
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
  /** Einzelnen Prozess-Schritt updaten (Standardzeit, Anteil, Häufigkeit, Hilfsmittel, etc.). */
  updateSchritt: (nr: number, patch: Partial<import('@/types/prozessmodell').Prozessschritt>) => void;
  /** Schritt hinzufügen */
  addSchritt: (schritt: import('@/types/prozessmodell').Prozessschritt) => void;
  /** Schritt entfernen */
  removeSchritt: (nr: number) => void;
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
  datenHerkunft: null,

  setModell: (modell) => set({ modell }),
  setDatenHerkunft: (datenHerkunft) => set({ datenHerkunft }),

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

  updateSchritt: (nr, patch) => {
    set((state) => {
      if (!state.modell) return {};
      const schritte = state.modell.schritte.map((s) => s.nr === nr ? { ...s, ...patch } : s);
      return { modell: { ...state.modell, schritte } };
    });
    get().berechne();
  },

  addSchritt: (schritt) => {
    set((state) => {
      if (!state.modell) return {};
      return { modell: { ...state.modell, schritte: [...state.modell.schritte, schritt] } };
    });
    get().berechne();
  },

  removeSchritt: (nr) => {
    set((state) => {
      if (!state.modell) return {};
      return { modell: { ...state.modell, schritte: state.modell.schritte.filter((s) => s.nr !== nr) } };
    });
    get().berechne();
  },

  ladeModell: (modell, parameter) => {
    // NUR das Standard-SE-Template (AS Gersthofen) bekommt den kalibrierten Default-Mix.
    // Geis (se_geis_nuernberg), Nörpel (se_noerpel_ulm) und alle anderen bekommen
    // leeren Mix → Fallback auf ihre eigenen colliProFahrt/geschwindigkeit Parameter.
    const istStandardSE = modell.id === 'se_standard';
    set({
      modell,
      parameter: parameter.map((p) => ({ ...p })),
      ergebnis: null,
      ffzMix: istStandardSE ? DEFAULT_FFZ_MIX.map((e) => ({ ...e })) : [],
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
      datenHerkunft: null,
    }),
}),
  {
    name: 'topis-prozessmodell',
    storage: createJSONStorage(() => createDebouncedLocalStorage()),
    // Schema-Version: bei Datenform-Änderungen erhöhen + Migrationsschritt unten.
    // Gilt für localStorage UND Cloud-Layouts. Muster siehe store.ts.
    version: 1,
    migrate: (persisted: unknown, fromVersion: number) => {
      const s = persisted as Record<string, unknown>;
      if (fromVersion < 1) { /* Baseline, keine Transformation */ }
      return s;
    },
    partialize: (state) => ({
      modell: state.modell,
      parameter: state.parameter,
      ergebnis: state.ergebnis,
      ffzMix: state.ffzMix,
      datenHerkunft: state.datenHerkunft,
    }),
    onRehydrateStorage: () => (state) => {
      // Persistierte Ergebnisse können mit einer älteren Rechner-Version entstanden
      // sein (z.B. Verteilweg ohne Batch-Faktor) → nach dem Laden immer neu rechnen.
      if (state) setTimeout(() => state.berechne(), 0);
    },
  }
));

// Selectors
export const useProzessErgebnis = () => useProzessmodellStore((s) => s.ergebnis);
export const useProzessParameter = () => useProzessmodellStore((s) => s.parameter);
export const useProzessAbteilungen = () => useProzessmodellStore((s) => s.modell.abteilungen);
export const useFFZMix = () => useProzessmodellStore((s) => s.ffzMix);
