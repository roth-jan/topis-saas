// Prozessmodell-Typen für die Min/Colli-Berechnung (ROTH-Beratungsmethodik)

/** Definition einer Abteilung im Prozessmodell */
export interface AbteilungDefinition {
  id: string;
  label: string;
  color: string;
}

export interface Prozessschritt {
  nr: number;
  beschreibung: string;
  abteilung: string;
  hilfsmittel: string;
  /** Weg in Metern (0 = kein Weg) */
  wegM: number;
  /** true = Weg kommt aus Layout-Berechnung */
  wegAusLayout: boolean;
  /** Geschwindigkeit in m/s */
  geschwindigkeitMs: number;
  /** Standardzeit in Sekunden */
  standardzeitSek: number;
  /** Anteil (0-1): Wie oft kommt dieser Schritt vor? */
  anteil: number;
  /** Häufigkeit pro Colli (Multiplikator) */
  haeufigkeit: number;
  /** Berechnete Zeit: standardzeitSek * anteil * haeufigkeit */
  berechneteZeitSek?: number;
}

export interface ProzessmodellConfig {
  id: string;
  name: string;
  beschreibung: string;
  schritte: Prozessschritt[];
  /** Typ des Umschlagprozesses */
  prozessTyp: 'se' | 'sa' | 'se_sa_kombi' | 'custom';
  /** Abteilungen mit Labels und Farben */
  abteilungen: AbteilungDefinition[];
}

export interface ProzessParameter {
  id: string;
  name: string;
  einheit: string;
  standardwert: number;
  aktuellerWert: number;
  /** Woher kommt der Wert? */
  quelle: 'eingabe' | 'berechnet' | 'layout' | 'scandaten';
  beschreibung?: string;
  kategorie: string;
}

export interface AbteilungsErgebnis {
  abteilung: string;
  label: string;
  minProColli: number;
  anteilGesamt: number; // Anteil an Gesamt-Min/Colli
  schritteAnzahl: number;
  hauptzeitSek: number;
  color: string;
}

export interface GesamtErgebnis {
  minProColli: number;
  abteilungen: AbteilungsErgebnis[];
  /** MA-Stundenbedarf bei gegebener Colli-Menge */
  maStundenBedarf: number;
  /** Vollzeit-Äquivalente */
  fte: number;
  /** Colli pro Tag (Eingabe) */
  colliProTag: number;
  /** Arbeitsminuten pro Stunde (Standard: 52.9) */
  arbeitsminProStunde: number;
}

// Helper-Funktionen für dynamische Abteilungen
export function getAbteilungLabel(modell: ProzessmodellConfig, id: string): string {
  return modell.abteilungen.find((a) => a.id === id)?.label ?? id;
}

export function getAbteilungColor(modell: ProzessmodellConfig, id: string): string {
  return modell.abteilungen.find((a) => a.id === id)?.color ?? '#888';
}
