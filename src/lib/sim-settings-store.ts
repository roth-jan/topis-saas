// Geteilter Settings-Store für Sim-Aufträge.
//
// Stundensatz, Min-Fix und Default-FFZ werden zwischen Planung und Dashboard
// geteilt. Wenn der Berater in der Planung den Stundensatz von 35 auf 50 € setzt,
// zeigt das Dashboard sofort die gleiche Zahl. Persistierung über localStorage,
// damit Reload nicht verliert.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDebouncedLocalStorage } from '@/lib/debounced-storage';

export interface SimSettings {
  stundensatzEuro: number;
  minProColliFix: number;
  defaultFfzId: number | null;
}

interface SimSettingsState extends SimSettings {
  setStundensatz: (v: number) => void;
  setMinFix: (v: number) => void;
  setDefaultFfzId: (id: number | null) => void;
  resetSettings: () => void;
}

const DEFAULTS: SimSettings = {
  stundensatzEuro: 35,
  minProColliFix: 1.17,
  defaultFfzId: null,
};

export const useSimSettingsStore = create<SimSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setStundensatz: (v) => set({ stundensatzEuro: Math.max(0, v) }),
      setMinFix: (v) => set({ minProColliFix: Math.max(0, v) }),
      setDefaultFfzId: (id) => set({ defaultFfzId: id }),
      resetSettings: () => set(DEFAULTS),
    }),
    {
      name: 'topis-sim-settings',
      storage: createJSONStorage(() => createDebouncedLocalStorage()),
      // Schema-Version: bei Datenform-Änderungen erhöhen + Migrationsschritt.
      version: 1,
      migrate: (persisted: unknown, fromVersion: number) => {
        const s = persisted as Record<string, unknown>;
        if (fromVersion < 1) { /* Baseline, keine Transformation */ }
        return s;
      },
    }
  )
);
