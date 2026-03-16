/**
 * Typen für Verladeplan / Torbelegung.
 * Feature 7 der ROTH-Beratungsmethodik: Zeitliche Steuerung.
 */

export interface FahrplanEintragSE {
  typ: 'SE';
  netzwerk: string;        // z.B. "IDS", "CL", "Emons", "Raben"
  verkehrsart: string;     // "L" = Linie, "S" = Sonder, etc.
  relation: string;        // Depot-Code z.B. "CL4017", "0100"
  sollZeit: string;        // "HH:MM"
  tor?: string;            // Zugewiesenes Tor (optional)
}

export interface FahrplanEintragSA {
  typ: 'SA';
  relation: string;        // z.B. "500", "3000"
  depot: string;           // z.B. "HUB Neuenstein", "Hannover"
  sollZeit: string;        // "HH:MM"
  wechselbruecke: string;  // "HC", "Sattel", "Pool", etc.
  art: string;             // "BG" = Begleitpapiere, "RL" = Rücklauf, "OW" = Oneway
  tor?: string;
  verladebereich?: string; // z.B. "B 1" – "B 9"
}

export interface TorbelegungZelle {
  tor: string;             // Tor-Name z.B. "T 29"
  stunde: number;          // 0-23
  minute: number;          // 0 oder 30 (Halbstunden-Raster)
  auslastung: number;      // Ø Fahrzeuge pro Halbstunde (0.0–4.0+)
  relationen: string[];    // Welche Relationen in diesem Slot
}

export interface VerladebereichInfo {
  bereich: string;         // z.B. "B 1"
  abfahrten: number;       // Anzahl Abfahrten
  colliProTag: number;     // Ø Colli pro Tag
  relationen: { relation: string; verladeende: string }[];
}

export interface Fahrplan {
  name: string;
  seAnkuenfte: FahrplanEintragSE[];
  saAbfahrten: FahrplanEintragSA[];
  torbelegung: TorbelegungZelle[];
  verladebereiche: VerladebereichInfo[];
}

export interface SpitzenAnalyse {
  spitzenStunde: { stunde: number; minute: number; auslastung: number };
  durchschnittlicheAuslastung: number;
  maxAuslastungProTor: { tor: string; auslastung: number };
  aktiveTore: number;
  gesamtFahrzeuge: number;
}

export interface TorbelegungKPIs {
  durchschnittlicheAuslastung: number;
  spitzenStunde: { stunde: number; minute: number; auslastung: number };
  leereTore: number;
  ueberlasteteTore: string[];
  gesamtSlots: number;
  belegteSlots: number;
}
