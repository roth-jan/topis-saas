import type { TopisObject } from './topis';

/**
 * ProjektVorlage: Bündelt Layout + Prozessmodell-Parameter + Referenzwerte
 * als eine Einheit. Jedes reale Beratungsprojekt wird als ProjektVorlage definiert.
 */
export interface ProjektVorlage {
  id: string;
  name: string;
  standort: string;
  jahr: number;
  beschreibung: string;

  /** Hallen-Definition */
  hall: { width: number; height: number; name: string; color?: string };

  /** Layout-Objekte (ohne id, wird beim Laden generiert) */
  objects: Omit<TopisObject, 'id'>[];

  /** Welches Prozessmodell-Template verwenden */
  prozessmodell: 'se_standard' | 'sa_standard';

  /** Parameter-Overrides (nur was vom Standard abweicht) */
  parameterOverrides: Record<string, number>;

  /** Referenzwerte aus Original-Analyse (für Vergleich) */
  referenz?: {
    minProColli: number;
    colliProMAStd: number;
    fte: number;
    quelle: string;
  };
}
