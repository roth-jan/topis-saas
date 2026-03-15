'use client';

import { create } from 'zustand';

// Types
export interface ScanRecord {
  id: number;
  scandatum: string;
  scanzeit: string;
  timestamp: number;
  messpunkt: number;
  messpunktName: string;
  tour: string;
  dispogebiet: string;
  sendungen: number;
  colli: number;
  gewicht: number;
  ladezeit?: number;
}

export interface ObjektMetrik {
  objectId: number;
  objectName: string;
  sendungen: number;
  colli: number;
  gewicht: number;
  durchschnittLadezeit: number;
  auslastung: number;
  fahrtenProTag: number;
}

export interface BetriebsAnalyse {
  zeitraum: { von: string; bis: string };
  arbeitstage: number;
  gesamtSendungen: number;
  gesamtColli: number;
  gesamtGewicht: number;
  objektMetriken: ObjektMetrik[];
}

export type HeatmapModus = 'sendungen' | 'colli' | 'gewicht' | 'auslastung' | 'ladezeit';
export type Farbskala = 'gruen-rot' | 'blau-rot' | 'mono';

export interface HeatmapConfig {
  aktiv: boolean;
  modus: HeatmapModus;
  farbskala: Farbskala;
  intensitaet: number;
}

export interface Szenario {
  id: string;
  name: string;
  beschreibung: string;
  aenderungen: SzenarioAenderung[];
  ergebnis?: BetriebsAnalyse;
}

export interface SzenarioAenderung {
  objectId: string;
  typ: 'verschieben' | 'entfernen' | 'hinzufuegen' | 'kapazitaet';
  wert?: number;
  position?: { x: number; y: number };
}

interface BetriebsdatenState {
  scanRecords: ScanRecord[];
  analyse: BetriebsAnalyse | null;
  heatmapConfig: HeatmapConfig;
  szenarien: Szenario[];
  aktivSzenario: string | null;

  importScanRecords: (records: ScanRecord[]) => void;
  setAnalyse: (analyse: BetriebsAnalyse) => void;
  setHeatmapConfig: (config: Partial<HeatmapConfig>) => void;
  toggleHeatmap: () => void;
  setHeatmapModus: (modus: HeatmapModus) => void;
  addSzenario: (szenario: Szenario) => void;
  removeSzenario: (id: string) => void;
  setAktivSzenario: (id: string | null) => void;
  reset: () => void;
}

const defaultHeatmapConfig: HeatmapConfig = {
  aktiv: false,
  modus: 'sendungen',
  farbskala: 'gruen-rot',
  intensitaet: 0.6,
};

export const useBetriebsdatenStore = create<BetriebsdatenState>((set) => ({
  scanRecords: [],
  analyse: null,
  heatmapConfig: defaultHeatmapConfig,
  szenarien: [],
  aktivSzenario: null,

  importScanRecords: (records) => set({ scanRecords: records }),

  setAnalyse: (analyse) => set({ analyse }),

  setHeatmapConfig: (config) =>
    set((state) => ({
      heatmapConfig: { ...state.heatmapConfig, ...config },
    })),

  toggleHeatmap: () =>
    set((state) => ({
      heatmapConfig: { ...state.heatmapConfig, aktiv: !state.heatmapConfig.aktiv },
    })),

  setHeatmapModus: (modus) =>
    set((state) => ({
      heatmapConfig: { ...state.heatmapConfig, modus },
    })),

  addSzenario: (szenario) =>
    set((state) => ({
      szenarien: [...state.szenarien, szenario],
    })),

  removeSzenario: (id) =>
    set((state) => ({
      szenarien: state.szenarien.filter((s) => s.id !== id),
      aktivSzenario: state.aktivSzenario === id ? null : state.aktivSzenario,
    })),

  setAktivSzenario: (id) => set({ aktivSzenario: id }),

  reset: () =>
    set({
      scanRecords: [],
      analyse: null,
      heatmapConfig: defaultHeatmapConfig,
      szenarien: [],
      aktivSzenario: null,
    }),
}));

// Selector hooks
export const useHeatmapConfig = () => useBetriebsdatenStore((s) => s.heatmapConfig);
export const useBetriebsAnalyse = () => useBetriebsdatenStore((s) => s.analyse);
export const useSzenarien = () => useBetriebsdatenStore((s) => s.szenarien);
