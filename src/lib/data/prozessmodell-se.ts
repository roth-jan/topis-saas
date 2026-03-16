import type { Prozessschritt, ProzessmodellConfig, ProzessParameter } from '@/types/prozessmodell';

/**
 * Vereinfachtes SE-Prozessmodell (Stückgut-Eingang).
 * Basiert auf dem ROTH 976-Zeilen-Excel, reduziert auf die Kernschritte,
 * die 90%+ der Gesamtzeit abdecken.
 *
 * Referenzwert AS Gersthofen: 1.917 Min/Colli
 * (Entlader 0.829 + Scanner 0.336 + Verteiler 0.752)
 *
 * Belader (SA) wurde entfernt — gehört nicht zum SE-Prozess.
 * Verteiler-Wege werden durch colliProFahrt (Batch-Faktor) geteilt.
 */

const SE_SCHRITTE: Prozessschritt[] = [
  // ==================== ENTLADER ====================
  // Fahrt zum Tor + Tor öffnen
  { nr: 1, beschreibung: 'Zum Tor fahren (leer)', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 30, wegAusLayout: false, geschwindigkeitMs: 2.86, standardzeitSek: 10.5, anteil: 1.0, haeufigkeit: 0.1, geschwindigkeitsParameter: 'staplerGeschwindigkeit' },
  { nr: 2, beschreibung: 'Tor öffnen / Andockstellung prüfen', abteilung: 'entlader', hilfsmittel: '-', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 15.0, anteil: 1.0, haeufigkeit: 0.1 },
  { nr: 3, beschreibung: 'In LKW einfahren', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 12, wegAusLayout: false, geschwindigkeitMs: 1.5, standardzeitSek: 8.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 4, beschreibung: 'Palette/Gitterbox aufnehmen', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 12.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 5, beschreibung: 'Rangieren im LKW', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 3, wegAusLayout: false, geschwindigkeitMs: 1.0, standardzeitSek: 3.0, anteil: 0.3, haeufigkeit: 1.0 },
  { nr: 6, beschreibung: 'Aus LKW rausfahren', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 12, wegAusLayout: false, geschwindigkeitMs: 2.0, standardzeitSek: 6.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 7, beschreibung: 'Zur Entladestellfläche fahren', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 8, wegAusLayout: false, geschwindigkeitMs: 2.86, standardzeitSek: 2.8, anteil: 1.0, haeufigkeit: 1.0, geschwindigkeitsParameter: 'staplerGeschwindigkeit' },
  { nr: 8, beschreibung: 'Palette abstellen auf Entladefläche', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 8.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 9, beschreibung: 'Zurückfahren zum LKW', abteilung: 'entlader', hilfsmittel: 'Stapler', wegM: 8, wegAusLayout: false, geschwindigkeitMs: 2.86, standardzeitSek: 2.8, anteil: 1.0, haeufigkeit: 1.0, geschwindigkeitsParameter: 'staplerGeschwindigkeit' },
  { nr: 10, beschreibung: 'Wartezeit (LKW wechsel etc.)', abteilung: 'entlader', hilfsmittel: '-', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 20.0, anteil: 0.25, haeufigkeit: 1.0 },
  { nr: 11, beschreibung: 'Gefäß öffnen (Plane, Deckel)', abteilung: 'entlader', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 23.0, anteil: 0.3, haeufigkeit: 1.0 },
  { nr: 12, beschreibung: 'Rampe andocken', abteilung: 'entlader', hilfsmittel: '-', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 16.0, anteil: 0.15, haeufigkeit: 1.0 },

  // ==================== SCANNER ====================
  { nr: 20, beschreibung: 'Zur Palette gehen', abteilung: 'scanner', hilfsmittel: 'Scanner', wegM: 3, wegAusLayout: false, geschwindigkeitMs: 1.2, standardzeitSek: 2.5, anteil: 1.0, haeufigkeit: 0.1 },
  { nr: 21, beschreibung: 'Palette scannen (Barcode)', abteilung: 'scanner', hilfsmittel: 'Scanner', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 3.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 22, beschreibung: 'Colli scannen', abteilung: 'scanner', hilfsmittel: 'Scanner', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 4.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 23, beschreibung: 'Colli umsetzen / drehen (Label suchen)', abteilung: 'scanner', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 5.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 24, beschreibung: 'Ziel-Label aufkleben', abteilung: 'scanner', hilfsmittel: 'Drucker', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 3.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 25, beschreibung: 'Colli auf Verteilwagen setzen / Kette', abteilung: 'scanner', hilfsmittel: 'Hand/Kette', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 4.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 26, beschreibung: 'Problem-Colli separieren', abteilung: 'scanner', hilfsmittel: 'Hand', wegM: 2, wegAusLayout: false, geschwindigkeitMs: 1.2, standardzeitSek: 15.0, anteil: 0.05, haeufigkeit: 1.0 },

  // ==================== VERTEILER ====================
  { nr: 40, beschreibung: 'Colli von Kette/Wagen nehmen', abteilung: 'verteiler', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 4.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 41, beschreibung: 'Ziel-Label lesen', abteilung: 'verteiler', hilfsmittel: 'Auge', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 2.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 42, beschreibung: 'Zum Stellplatz fahren/gehen (VERTEILWEG)', abteilung: 'verteiler', hilfsmittel: 'Schnelläufer', wegM: 138.8, wegAusLayout: true, geschwindigkeitMs: 2.44, standardzeitSek: 56.9, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 43, beschreibung: 'Colli abstellen am Stellplatz', abteilung: 'verteiler', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 3.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 44, beschreibung: 'Colli sortieren/stapeln', abteilung: 'verteiler', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 4.0, anteil: 0.5, haeufigkeit: 1.0 },
  { nr: 45, beschreibung: 'Leerfahrt zurück zur Kette', abteilung: 'verteiler', hilfsmittel: 'Schnelläufer', wegM: 138.8, wegAusLayout: true, geschwindigkeitMs: 2.44, standardzeitSek: 56.9, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 46, beschreibung: 'Wartezeit an Kette (kein Colli)', abteilung: 'verteiler', hilfsmittel: '-', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 5.0, anteil: 0.1, haeufigkeit: 1.0 },
];

export const PROZESSMODELL_SE: ProzessmodellConfig = {
  id: 'se_standard',
  name: 'Stückgut-Eingang (SE)',
  beschreibung: 'Standard SE-Prozess: Entladen → Scannen → Verteilen',
  prozessTyp: 'se',
  schritte: SE_SCHRITTE,
  abteilungen: [
    { id: 'entlader', label: 'Entlader', color: '#3b82f6' },
    { id: 'scanner', label: 'Scanner', color: '#22c55e' },
    { id: 'verteiler', label: 'Verteiler', color: '#f59e0b' },
  ],
};

/**
 * Standard-Parameter für das SE-Prozessmodell.
 * Können vom Benutzer angepasst werden.
 */
export const SE_STANDARD_PARAMETER: ProzessParameter[] = [
  // Allgemein
  { id: 'colliProTag', name: 'Colli pro Tag', einheit: 'Cll/Tag', standardwert: 15000, aktuellerWert: 15000, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Durchschnittliche Colli-Menge pro Tag' },
  { id: 'sendungenProTag', name: 'Sendungen pro Tag', einheit: 'Sdg/Tag', standardwert: 5000, aktuellerWert: 5000, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Durchschnittliche Sendungsmenge pro Tag' },
  { id: 'colliProSendung', name: 'Colli pro Sendung', einheit: 'Cll/Sdg', standardwert: 3.0, aktuellerWert: 3.0, quelle: 'berechnet', kategorie: 'allgemein' },
  { id: 'arbeitsminProStunde', name: 'Arbeitsmin. pro Stunde', einheit: 'min', standardwert: 52.9, aktuellerWert: 52.9, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Effektive Arbeitszeit pro Stunde (abzgl. Verteilzeit, persönliche Zeit)' },
  { id: 'arbeitsstundenProTag', name: 'Arbeitsstunden pro Tag', einheit: 'h', standardwert: 8.0, aktuellerWert: 8.0, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProQm', name: 'Colli pro qm Stellfläche', einheit: 'Cll/qm', standardwert: 1.25, aktuellerWert: 1.25, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Standard-Faktor für Flächenbedarfsrechnung' },

  // Entlader
  { id: 'colliProPalette', name: 'Colli pro Palette', einheit: 'Cll/Pal', standardwert: 20, aktuellerWert: 20, quelle: 'eingabe', kategorie: 'entlader', beschreibung: 'Durchschnittliche Colli pro Palette (Entladung)' },
  { id: 'staplerGeschwindigkeit', name: 'Stapler-Geschwindigkeit', einheit: 'm/s', standardwert: 2.86, aktuellerWert: 2.86, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'lkwProTag', name: 'LKW pro Tag (Eingang)', einheit: 'LKW/Tag', standardwert: 40, aktuellerWert: 40, quelle: 'eingabe', kategorie: 'entlader' },

  // Scanner
  { id: 'scanZeitProColli', name: 'Scan-Zeit pro Colli', einheit: 'Sek', standardwert: 4.0, aktuellerWert: 4.0, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'labelAufklebenZeit', name: 'Label aufkleben', einheit: 'Sek', standardwert: 3.0, aktuellerWert: 3.0, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'problemColliAnteil', name: 'Problem-Colli Anteil', einheit: '%', standardwert: 5.0, aktuellerWert: 5.0, quelle: 'eingabe', kategorie: 'scanner' },

  // Verteiler
  { id: 'verteilweg', name: 'Gewichteter Verteilweg', einheit: 'm', standardwert: 138.8, aktuellerWert: 138.8, quelle: 'layout', kategorie: 'verteiler', beschreibung: 'Colli-gewichteter Durchschnittsweg (aus Layout)' },
  { id: 'schnellaeuferGeschwindigkeit', name: 'Verteilgeschwindigkeit (Schnelläufer/Ameise)', einheit: 'm/s', standardwert: 2.44, aktuellerWert: 2.44, quelle: 'eingabe', kategorie: 'verteiler' },
  { id: 'colliAbstellenZeit', name: 'Colli abstellen', einheit: 'Sek', standardwert: 3.0, aktuellerWert: 3.0, quelle: 'eingabe', kategorie: 'verteiler' },
  { id: 'colliProFahrt', name: 'Colli pro Verteiler-Fahrt', einheit: 'Cll/Fahrt', standardwert: 3.39, aktuellerWert: 3.39, quelle: 'eingabe', kategorie: 'verteiler', beschreibung: 'Batch: Wie viele Colli pro Verteiler-Fahrt (teilt Wegzeit)' },
];
