// Standardisierte Scandaten-Typen für den Import

/**
 * Ein einzelner Scandaten-Record mit allen 19 Standard-Feldern.
 * Nicht jedes Feld muss befüllt sein — hängt vom Kunden-Format ab.
 */
export interface ScandatenRecord {
  id: number;
  scandatum: string;
  scanzeit: string;
  timestamp: number;
  stellplatz: string;         // Tornummer/Stellplatz-Bezeichnung (KEY für Zuordnung!)
  messpunkt: number;
  messpunktName: string;
  tour: string;
  dispogebiet: string;
  ausgangsrelation: string;   // Zielbereich/Relation (KEY für Flächenbedarf!)
  sendungen: number;
  colli: number;
  gewicht: number;
  ladezeit?: number;
  palette?: number;
  volumen?: number;
  lademeter?: number;
  fahrzeugtyp?: string;
  kundenname?: string;
}

/**
 * Mapping von CSV-Spaltenname → Standard-Feld.
 * Jeder Kunde hat andere Spaltenbezeichnungen.
 */
export interface Spaltenzuordnung {
  id: string;
  name: string;
  beschreibung: string;
  /** CSV-Header → Standard-Feldname */
  mapping: Record<string, keyof ScandatenRecord>;
  /** Trennzeichen (Standard: ;) */
  delimiter: string;
  /** Datumsformat (z.B. 'DD.MM.YYYY' oder 'YYYY-MM-DD') */
  datumsformat: string;
}

/**
 * Verknüpfung eines Stellplatz-Strings aus CSV mit einem Layout-Objekt.
 * Wird im Import-Wizard Schritt 2 konfiguriert.
 */
export interface TorZuordnung {
  stellplatzKey: string;      // Wert aus CSV-Spalte "stellplatz"
  objectId: number;           // TopisObject.id im Layout
  objectName: string;         // Zur Anzeige
  autoMatched: boolean;       // Wurde automatisch zugeordnet?
}

/**
 * Verknüpfung einer Ausgangsrelation mit einem Layout-Bereich.
 */
export interface RelationZuordnung {
  relationKey: string;        // Wert aus CSV-Spalte "ausgangsrelation"
  objectId: number | null;    // TopisObject.id (Bereich) oder null wenn unbekannt
  objectName: string;
  flaecheQm?: number;        // Verfügbare Fläche in qm (für Flächenbedarfsrechnung)
}
