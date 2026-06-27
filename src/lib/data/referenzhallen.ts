/**
 * Referenzhallen für Benchmarking.
 *
 * ECHTE Werte aus realen ROTH-Beratungsprojekten — kompiliert 27.06.2026 aus
 * `Hallenbenchmarking.xlsx` (kuratierter Katalog) + den Projekt-Prozessmodellen
 * im SharePoint (`Logistik-Beratung`). Keine erfundenen Hallen.
 *
 * Vergleichs-Kennzahl `minProColliGesamt` = **SE „Entladung Fernverkehr" Min/Colli**
 * (die Kennzahl, die ROTH in den Abschlusspräsentationen benchmarkt). qm/jahr/fte
 * sind gefüllt, wo real bekannt; sonst weggelassen (optional) statt geschätzt.
 * Abteilungs-Aufschlüsselung (`minProColli`) liegt nur für AS Gersthofen vor.
 */
export interface ReferenzHalle {
  id: string;
  name: string;
  standort: string;
  typ: 'se' | 'sa' | 'se_sa_kombi';
  /** Hallenfläche in qm (falls bekannt) */
  flaecheQm?: number;
  /** Anzahl Tore (falls bekannt) */
  tore?: number;
  /** Colli pro Tag (falls bekannt) */
  colliProTag?: number;
  /** Min/Colli pro Abteilung (nur wo aufgeschlüsselt vorhanden) */
  minProColli: Record<string, number>;
  /** Min/Colli gesamt — SE Entladung Fernverkehr (Benchmark-Kennzahl) */
  minProColliGesamt: number;
  /** Gewichteter Verteilweg in m (falls bekannt) */
  verteilwegM?: number;
  /** FTE (falls bekannt) */
  fte?: number;
  /** Jahr der Messung (falls bekannt) */
  jahr?: number;
}

export const REFERENZHALLEN: ReferenzHalle[] = [
  // --- Block A: ROTH-Standard-Prozessmodelle + kuratierter Katalog ---
  { id: 'rhenus_unna', name: 'Rhenus', standort: 'Unna', typ: 'se', flaecheQm: 10460, minProColli: {}, minProColliGesamt: 1.45 },
  { id: 'kunze_karlsdorf', name: 'Spedition Kunze', standort: 'Karlsdorf', typ: 'se', flaecheQm: 5520, minProColli: {}, minProColliGesamt: 1.74 },
  { id: 'rhenus_duesseldorf', name: 'Rhenus', standort: 'Düsseldorf', typ: 'se', minProColli: {}, minProColliGesamt: 1.75, jahr: 2021 },
  { id: 'tlt_potsdam', name: 'TLT', standort: 'Berlin-Potsdam', typ: 'se', flaecheQm: 8237, minProColli: {}, minProColliGesamt: 1.91 },
  {
    id: 'as_gersthofen', name: 'Andreas Schmid', standort: 'Gersthofen (Halle 6)', typ: 'se',
    flaecheQm: 8576, minProColli: { entlader: 0.829, scanner: 0.336, verteiler: 0.752 },
    minProColliGesamt: 1.917, verteilwegM: 138.8, fte: 54.5, jahr: 2020,
  },
  { id: 'geis_nuernberg', name: 'Geis', standort: 'Nürnberg (TuL)', typ: 'se', flaecheQm: 4512, fte: 67, minProColli: {}, minProColliGesamt: 1.95, jahr: 2018 },
  { id: 'geis_bad_neustadt', name: 'Geis', standort: 'Bad Neustadt', typ: 'se', flaecheQm: 6240, minProColli: {}, minProColliGesamt: 1.96 },
  { id: 'zufall_fulda', name: 'Zufall Logistik', standort: 'Fulda', typ: 'se', minProColli: {}, minProColliGesamt: 1.98, jahr: 2020 },
  { id: 'pml_kiel', name: 'PML', standort: 'Kiel', typ: 'se', minProColli: {}, minProColliGesamt: 2.03, jahr: 2019 },
  { id: 'wackler', name: 'Wackler', standort: 'Göppingen', typ: 'se', minProColli: {}, minProColliGesamt: 2.18, jahr: 2021 },
  { id: 'noerpel_ulm', name: 'Noerpel', standort: 'Ulm', typ: 'se', flaecheQm: 6240, minProColli: {}, minProColliGesamt: 2.19, jahr: 2019 },
  { id: 'amm', name: 'Amm Spedition', standort: 'Nürnberg', typ: 'se', minProColli: {}, minProColliGesamt: 2.30, jahr: 2021 },
  { id: 'zufall_goettingen', name: 'Zufall Logistik', standort: 'Göttingen', typ: 'se', minProColli: {}, minProColliGesamt: 2.33, jahr: 2021 },
  { id: 'lagermax_salzburg', name: 'Lagermax', standort: 'Salzburg', typ: 'se', flaecheQm: 5560, minProColli: {}, minProColliGesamt: 3.19 },
  { id: 'geis_naila', name: 'Geis', standort: 'Naila', typ: 'se', flaecheQm: 6975, minProColli: {}, minProColliGesamt: 3.44, jahr: 2013 },

  // --- Kühne+Nagel: 11 Standorte (Stückguteingang Min/Colli, 2016/17) ---
  { id: 'kn_bielefeld', name: 'Kühne+Nagel', standort: 'Bielefeld', typ: 'se', minProColli: {}, minProColliGesamt: 1.90, jahr: 2016 },
  { id: 'kn_hagen', name: 'Kühne+Nagel', standort: 'Hagen', typ: 'se', minProColli: {}, minProColliGesamt: 1.94, jahr: 2016 },
  { id: 'kn_hamburg', name: 'Kühne+Nagel', standort: 'Hamburg', typ: 'se', minProColli: {}, minProColliGesamt: 2.04, jahr: 2016 },
  { id: 'kn_chemnitz', name: 'Kühne+Nagel', standort: 'Chemnitz', typ: 'se', minProColli: {}, minProColliGesamt: 2.08, jahr: 2016 },
  { id: 'kn_oldenburg', name: 'Kühne+Nagel', standort: 'Oldenburg', typ: 'se', minProColli: {}, minProColliGesamt: 2.14, jahr: 2016 },
  { id: 'kn_dortmund', name: 'Kühne+Nagel', standort: 'Dortmund', typ: 'se', minProColli: {}, minProColliGesamt: 2.19, jahr: 2016 },
  { id: 'kn_straubing', name: 'Kühne+Nagel', standort: 'Straubing', typ: 'se', minProColli: {}, minProColliGesamt: 2.19, jahr: 2016 },
  { id: 'kn_haiger', name: 'Kühne+Nagel', standort: 'Haiger', typ: 'se', minProColli: {}, minProColliGesamt: 2.39, jahr: 2016 },
  { id: 'kn_mainz', name: 'Kühne+Nagel', standort: 'Mainz', typ: 'se', minProColli: {}, minProColliGesamt: 2.44, jahr: 2016 },
  { id: 'kn_leipzig', name: 'Kühne+Nagel', standort: 'Leipzig', typ: 'se', minProColli: {}, minProColliGesamt: 2.46, jahr: 2016 },
  { id: 'kn_bocholt', name: 'Kühne+Nagel', standort: 'Bocholt', typ: 'se', minProColli: {}, minProColliGesamt: 3.31, jahr: 2016 },
];
