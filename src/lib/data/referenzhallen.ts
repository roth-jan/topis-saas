/**
 * Referenzhalle für Benchmarking.
 * Daten aus realen ROTH-Beratungsprojekten.
 */
export interface ReferenzHalle {
  id: string;
  name: string;
  standort: string;
  typ: 'se' | 'sa' | 'se_sa_kombi';
  /** Hallenfläche in qm */
  flaecheQm: number;
  /** Anzahl Tore */
  tore: number;
  /** Colli pro Tag (Durchschnitt) */
  colliProTag: number;
  /** Min/Colli pro Abteilung */
  minProColli: Record<string, number>;
  /** Min/Colli gesamt */
  minProColliGesamt: number;
  /** Gewichteter Verteilweg in m */
  verteilwegM: number;
  /** FTE */
  fte: number;
  /** Jahr der Messung */
  jahr: number;
}

/**
 * Referenzhallen-Datenbank.
 * AS Gersthofen = vollständige Daten aus Beratungsprojekt 2018-2020.
 * Weitere Hallen: geschätzte/anonymisierte Daten.
 */
export const REFERENZHALLEN: ReferenzHalle[] = [
  {
    id: 'as_gersthofen',
    name: 'Andreas Schmid',
    standort: 'Gersthofen (Halle 6)',
    typ: 'se',
    flaecheQm: 6334,
    tore: 85,
    colliProTag: 15000,
    minProColli: { entlader: 0.829, scanner: 0.336, verteiler: 0.752 },
    minProColliGesamt: 1.917,
    verteilwegM: 138.8,
    fte: 54.5,
    jahr: 2019,
  },
  {
    id: 'geis_nuernberg',
    name: 'Geis',
    standort: 'Nürnberg',
    typ: 'se',
    flaecheQm: 4200,
    tore: 52,
    colliProTag: 12000,
    minProColli: { entlader: 0.75, scanner: 0.30, verteiler: 0.68 },
    minProColliGesamt: 1.73,
    verteilwegM: 112.0,
    fte: 39.3,
    jahr: 2020,
  },
  {
    id: 'rhenus_mannheim',
    name: 'Rhenus',
    standort: 'Mannheim',
    typ: 'se',
    flaecheQm: 5800,
    tore: 68,
    colliProTag: 18000,
    minProColli: { entlader: 0.78, scanner: 0.32, verteiler: 0.85 },
    minProColliGesamt: 1.95,
    verteilwegM: 155.0,
    fte: 66.3,
    jahr: 2021,
  },
  {
    id: 'noerpel_ulm',
    name: 'Noerpel',
    standort: 'Ulm',
    typ: 'se',
    flaecheQm: 3500,
    tore: 40,
    colliProTag: 8000,
    minProColli: { entlader: 0.72, scanner: 0.28, verteiler: 0.62 },
    minProColliGesamt: 1.62,
    verteilwegM: 95.0,
    fte: 24.5,
    jahr: 2019,
  },
  {
    id: 'ids_hub_sued',
    name: 'IDS Hub Süd',
    standort: 'Augsburg',
    typ: 'se_sa_kombi',
    flaecheQm: 7200,
    tore: 96,
    colliProTag: 22000,
    minProColli: { entlader: 0.82, scanner: 0.35, verteiler: 0.90, belader: 0.12 },
    minProColliGesamt: 2.19,
    verteilwegM: 168.0,
    fte: 91.1,
    jahr: 2022,
  },
  {
    id: 'pml_kiel',
    name: 'PML',
    standort: 'Kiel',
    typ: 'se',
    flaecheQm: 2800,
    tore: 32,
    colliProTag: 6000,
    minProColli: { entlader: 0.70, scanner: 0.30, verteiler: 0.58 },
    minProColliGesamt: 1.58,
    verteilwegM: 82.0,
    fte: 17.9,
    jahr: 2020,
  },
  {
    id: 'tlt_hamburg',
    name: 'TLT',
    standort: 'Hamburg',
    typ: 'se',
    flaecheQm: 4800,
    tore: 58,
    colliProTag: 14000,
    minProColli: { entlader: 0.80, scanner: 0.33, verteiler: 0.78 },
    minProColliGesamt: 1.91,
    verteilwegM: 130.0,
    fte: 50.6,
    jahr: 2021,
  },
  {
    id: 'hellmann_osnabrueck',
    name: 'Hellmann',
    standort: 'Osnabrück',
    typ: 'se_sa_kombi',
    flaecheQm: 6000,
    tore: 72,
    colliProTag: 16000,
    minProColli: { entlader: 0.76, scanner: 0.31, verteiler: 0.72, belader: 0.10 },
    minProColliGesamt: 1.89,
    verteilwegM: 125.0,
    fte: 57.2,
    jahr: 2022,
  },
];
