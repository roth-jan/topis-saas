/**
 * Typen für gemessene Distanzmatrizen.
 * Ermöglicht Import echter Messwerte statt berechneter A*-Pfade.
 */

export interface Entladezone {
  name: string;       // z.B. "EZ 1"
  torVon: number;     // Erstes Tor der Zone
  torBis: number;     // Letztes Tor der Zone
}

export interface DistanzEintrag {
  vonName: string;       // z.B. "EZ 1"
  nachName: string;      // z.B. "Tor 1"
  distanzM: number;      // Einfachweg in Metern
  distanzDoppeltM: number; // Hin+Rück
  seRelationen: string[];  // SE-Relationen die dieses Tor bedienen
  saRelationen: string[];  // SA-Relationen
}

export interface LeerhubwagenEintrag {
  messpunkt: string;       // "5" = Leerhubwagen-Messpunkt
  ausgangsrelation: string; // z.B. "01", "06", "CL4016"
  colli: number;           // Anzahl Colli im Messzeitraum
}

export interface Distanzmatrix {
  name: string;
  entladezonen: Entladezone[];
  eintraege: DistanzEintrag[];
  leerhubwagen: LeerhubwagenEintrag[];
  gesamtColli: number;
}

export interface VerteilwegDetail {
  relation: string;
  colli: number;
  tor: string;
  entladezone: string;
  distanzM: number;
  gewichtetM: number; // distanzM * colli
}

export interface DistanzmatrixErgebnis {
  gewichteterWegM: number;
  gesamtColli: number;
  abgedeckteColli: number;
  nichtZugeordnet: number;
  details: VerteilwegDetail[];
}
