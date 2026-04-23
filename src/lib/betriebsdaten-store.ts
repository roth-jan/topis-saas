'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDebouncedLocalStorage } from './debounced-storage';
import type { ScandatenRecord, TorZuordnung, RelationZuordnung, Spaltenzuordnung } from '@/types/scandaten';
import type { Distanzmatrix, DistanzmatrixErgebnis } from '@/types/distanzmatrix';
import type { Fahrplan } from '@/types/torbelegung';

// Legacy-compatible ScanRecord (alte Schnittstelle bleibt erhalten)
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
  // Neue Felder
  stellplatz?: string;
  ausgangsrelation?: string;
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

export type HeatmapModus = 'sendungen' | 'colli' | 'gewicht' | 'auslastung' | 'ladezeit' | 'flaechenbedarf' | 'verteilweg' | 'colliVerteilung';
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

/** Stündliche Scandaten-Aggregation (für IST-SOLL) */
export interface StundenAggregation {
  stunde: number; // 0-23
  colli: number;
  sendungen: number;
  gewicht: number;
  scans: number;
}

interface BetriebsdatenState {
  // Originaldaten
  scanRecords: ScanRecord[];
  scandatenRecords: ScandatenRecord[];
  analyse: BetriebsAnalyse | null;

  // Zuordnungen (Phase 1)
  torZuordnungen: TorZuordnung[];
  relationZuordnungen: RelationZuordnung[];
  spaltenzuordnung: Spaltenzuordnung | null;

  // Heatmap
  heatmapConfig: HeatmapConfig;

  // Szenarien
  szenarien: Szenario[];
  aktivSzenario: string | null;

  // Stündliche Aggregation
  stundenAggregation: StundenAggregation[];

  // Distanzmatrix (gemessene Wege)
  distanzmatrix: Distanzmatrix | null;
  distanzmatrixErgebnis: DistanzmatrixErgebnis | null;

  // Fahrplan / Torbelegung
  fahrplan: Fahrplan | null;

  // Actions
  importScanRecords: (records: ScanRecord[]) => void;
  importScandatenRecords: (records: ScandatenRecord[]) => void;
  setAnalyse: (analyse: BetriebsAnalyse) => void;
  setTorZuordnungen: (zuordnungen: TorZuordnung[]) => void;
  setRelationZuordnungen: (zuordnungen: RelationZuordnung[]) => void;
  setSpaltenzuordnung: (profil: Spaltenzuordnung | null) => void;
  setHeatmapConfig: (config: Partial<HeatmapConfig>) => void;
  toggleHeatmap: () => void;
  setHeatmapModus: (modus: HeatmapModus) => void;
  addSzenario: (szenario: Szenario) => void;
  removeSzenario: (id: string) => void;
  setAktivSzenario: (id: string | null) => void;
  setStundenAggregation: (agg: StundenAggregation[]) => void;
  setDistanzmatrix: (dm: Distanzmatrix | null) => void;
  setDistanzmatrixErgebnis: (erg: DistanzmatrixErgebnis | null) => void;
  setFahrplan: (fp: Fahrplan | null) => void;
  reset: () => void;
}

const defaultHeatmapConfig: HeatmapConfig = {
  aktiv: false,
  modus: 'sendungen',
  farbskala: 'gruen-rot',
  intensitaet: 0.6,
};

export const useBetriebsdatenStore = create<BetriebsdatenState>()(
  persist(
  (set) => ({
  scanRecords: [],
  scandatenRecords: [],
  analyse: null,
  torZuordnungen: [],
  relationZuordnungen: [],
  spaltenzuordnung: null,
  heatmapConfig: defaultHeatmapConfig,
  szenarien: [],
  aktivSzenario: null,
  stundenAggregation: [],
  distanzmatrix: null,
  distanzmatrixErgebnis: null,
  fahrplan: null,

  importScanRecords: (records) => set({ scanRecords: records }),

  importScandatenRecords: (records) => {
    // Auch stündliche Aggregation berechnen
    const stundenMap = new Map<number, StundenAggregation>();
    for (let h = 0; h < 24; h++) {
      stundenMap.set(h, { stunde: h, colli: 0, sendungen: 0, gewicht: 0, scans: 0 });
    }
    for (const r of records) {
      const stunde = r.scanzeit ? parseInt(r.scanzeit.split(':')[0]) : 0;
      const agg = stundenMap.get(stunde) || stundenMap.get(0)!;
      agg.colli += r.colli;
      agg.sendungen += r.sendungen;
      agg.gewicht += r.gewicht;
      agg.scans += 1;
    }
    set({
      scandatenRecords: records,
      stundenAggregation: Array.from(stundenMap.values()),
    });
  },

  setAnalyse: (analyse) => set({ analyse }),

  setTorZuordnungen: (zuordnungen) => set({ torZuordnungen: zuordnungen }),
  setRelationZuordnungen: (zuordnungen) => set({ relationZuordnungen: zuordnungen }),
  setSpaltenzuordnung: (profil) => set({ spaltenzuordnung: profil }),

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

  setStundenAggregation: (agg) => set({ stundenAggregation: agg }),

  setDistanzmatrix: (dm) => set({ distanzmatrix: dm }),
  setDistanzmatrixErgebnis: (erg) => set({ distanzmatrixErgebnis: erg }),
  setFahrplan: (fp) => set({ fahrplan: fp }),

  reset: () =>
    set({
      scanRecords: [],
      scandatenRecords: [],
      analyse: null,
      torZuordnungen: [],
      relationZuordnungen: [],
      spaltenzuordnung: null,
      heatmapConfig: defaultHeatmapConfig,
      szenarien: [],
      aktivSzenario: null,
      stundenAggregation: [],
      distanzmatrix: null,
      distanzmatrixErgebnis: null,
      fahrplan: null,
    }),
}),
  {
    name: 'topis-betriebsdaten',
    storage: createJSONStorage(() => createDebouncedLocalStorage()),
    partialize: (state) => ({
      scandatenRecords: state.scandatenRecords,
      analyse: state.analyse,
      torZuordnungen: state.torZuordnungen,
      relationZuordnungen: state.relationZuordnungen,
      heatmapConfig: state.heatmapConfig,
      szenarien: state.szenarien,
      stundenAggregation: state.stundenAggregation,
    }),
  }
));

// Selector hooks
export const useHeatmapConfig = () => useBetriebsdatenStore((s) => s.heatmapConfig);
export const useBetriebsAnalyse = () => useBetriebsdatenStore((s) => s.analyse);
export const useSzenarien = () => useBetriebsdatenStore((s) => s.szenarien);
export const useTorZuordnungen = () => useBetriebsdatenStore((s) => s.torZuordnungen);
export const useRelationZuordnungen = () => useBetriebsdatenStore((s) => s.relationZuordnungen);
export const useScandatenRecords = () => useBetriebsdatenStore((s) => s.scandatenRecords);
export const useStundenAggregation = () => useBetriebsdatenStore((s) => s.stundenAggregation);
export const useDistanzmatrix = () => useBetriebsdatenStore((s) => s.distanzmatrix);
export const useDistanzmatrixErgebnis = () => useBetriebsdatenStore((s) => s.distanzmatrixErgebnis);
export const useFahrplan = () => useBetriebsdatenStore((s) => s.fahrplan);
