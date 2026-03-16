import type { Prozessschritt, ProzessmodellConfig, ProzessParameter } from '@/types/prozessmodell';

/**
 * SA-Prozessmodell (Stückgut-Ausgang).
 *
 * Abteilungen:
 * - Kommissionierer: Sendungen zusammenstellen
 * - Belader: Paletten/Gitterboxen zum Tor fahren + verladen
 * - Verlader: In LKW verladen + sichern
 *
 * Referenzwert: ~1.2–1.5 Min/Colli (je nach Halle)
 */

const SA_SCHRITTE: Prozessschritt[] = [
  // ==================== KOMMISSIONIERER ====================
  { nr: 1, beschreibung: 'Auftrag empfangen / Scanner lesen', abteilung: 'kommissionierer', hilfsmittel: 'Scanner', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 3.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 2, beschreibung: 'Zum Stellplatz gehen', abteilung: 'kommissionierer', hilfsmittel: 'Schnelläufer', wegM: 138.8, wegAusLayout: true, geschwindigkeitMs: 2.44, standardzeitSek: 56.9, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 3, beschreibung: 'Colli suchen am Stellplatz', abteilung: 'kommissionierer', hilfsmittel: 'Auge', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 5.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 4, beschreibung: 'Colli aufnehmen', abteilung: 'kommissionierer', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 4.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 5, beschreibung: 'Colli scannen (Bestätigung)', abteilung: 'kommissionierer', hilfsmittel: 'Scanner', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 3.0, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 6, beschreibung: 'Zurück zum Beladebereich', abteilung: 'kommissionierer', hilfsmittel: 'Schnelläufer', wegM: 138.8, wegAusLayout: true, geschwindigkeitMs: 2.44, standardzeitSek: 56.9, anteil: 1.0, haeufigkeit: 1.0 },
  { nr: 7, beschreibung: 'Colli auf Palette/Gitterbox setzen', abteilung: 'kommissionierer', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 4.0, anteil: 1.0, haeufigkeit: 1.0 },

  // ==================== BELADER ====================
  { nr: 20, beschreibung: 'Sendung zusammenstellen', abteilung: 'belader', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 10.0, anteil: 1.0, haeufigkeit: 0.2 },
  { nr: 21, beschreibung: 'Palette/Gitterbox zum Tor fahren', abteilung: 'belader', hilfsmittel: 'Ameise', wegM: 15, wegAusLayout: false, geschwindigkeitMs: 1.5, standardzeitSek: 10.0, anteil: 1.0, haeufigkeit: 0.15 },
  { nr: 22, beschreibung: 'In LKW verladen', abteilung: 'belader', hilfsmittel: 'Ameise', wegM: 6, wegAusLayout: false, geschwindigkeitMs: 1.0, standardzeitSek: 6.0, anteil: 1.0, haeufigkeit: 0.15 },
  { nr: 23, beschreibung: 'Palette positionieren im LKW', abteilung: 'belader', hilfsmittel: 'Hand', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 8.0, anteil: 1.0, haeufigkeit: 0.15 },
  { nr: 24, beschreibung: 'Ladungssicherung', abteilung: 'belader', hilfsmittel: 'Zurrgurt', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 20.0, anteil: 0.3, haeufigkeit: 0.15 },

  // ==================== VERLADER ====================
  { nr: 40, beschreibung: 'LKW-Papiere prüfen / Tour zuordnen', abteilung: 'verlader', hilfsmittel: 'Scanner', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 15.0, anteil: 1.0, haeufigkeit: 0.05 },
  { nr: 41, beschreibung: 'Tor öffnen / LKW einweisen', abteilung: 'verlader', hilfsmittel: '-', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 20.0, anteil: 1.0, haeufigkeit: 0.05 },
  { nr: 42, beschreibung: 'Laderaum prüfen', abteilung: 'verlader', hilfsmittel: 'Auge', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 10.0, anteil: 0.5, haeufigkeit: 0.05 },
  { nr: 43, beschreibung: 'Lieferschein / CMR erstellen', abteilung: 'verlader', hilfsmittel: 'System', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 30.0, anteil: 1.0, haeufigkeit: 0.05 },
  { nr: 44, beschreibung: 'Tor schließen / LKW abfertigen', abteilung: 'verlader', hilfsmittel: '-', wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0, standardzeitSek: 15.0, anteil: 1.0, haeufigkeit: 0.05 },
];

export const PROZESSMODELL_SA: ProzessmodellConfig = {
  id: 'sa_standard',
  name: 'Stückgut-Ausgang (SA)',
  beschreibung: 'Standard SA-Prozess: Kommissionieren → Beladen → Verladen',
  prozessTyp: 'sa',
  schritte: SA_SCHRITTE,
  abteilungen: [
    { id: 'kommissionierer', label: 'Kommissionierer', color: '#8b5cf6' },
    { id: 'belader', label: 'Belader', color: '#a855f7' },
    { id: 'verlader', label: 'Verlader', color: '#ec4899' },
  ],
};

/**
 * Standard-Parameter für das SA-Prozessmodell.
 */
export const SA_STANDARD_PARAMETER: ProzessParameter[] = [
  // Allgemein
  { id: 'colliProTag', name: 'Colli pro Tag', einheit: 'Cll/Tag', standardwert: 12000, aktuellerWert: 12000, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Durchschnittliche Colli-Menge pro Tag (Ausgang)' },
  { id: 'sendungenProTag', name: 'Sendungen pro Tag', einheit: 'Sdg/Tag', standardwert: 4000, aktuellerWert: 4000, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProSendung', name: 'Colli pro Sendung', einheit: 'Cll/Sdg', standardwert: 3.0, aktuellerWert: 3.0, quelle: 'berechnet', kategorie: 'allgemein' },
  { id: 'arbeitsminProStunde', name: 'Arbeitsmin. pro Stunde', einheit: 'min', standardwert: 52.9, aktuellerWert: 52.9, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Effektive Arbeitszeit pro Stunde' },
  { id: 'arbeitsstundenProTag', name: 'Arbeitsstunden pro Tag', einheit: 'h', standardwert: 8.0, aktuellerWert: 8.0, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProQm', name: 'Colli pro qm Stellfläche', einheit: 'Cll/qm', standardwert: 1.25, aktuellerWert: 1.25, quelle: 'eingabe', kategorie: 'allgemein' },

  // Kommissionierer
  { id: 'verteilweg', name: 'Gewichteter Verteilweg', einheit: 'm', standardwert: 120.0, aktuellerWert: 120.0, quelle: 'layout', kategorie: 'kommissionierer', beschreibung: 'Durchschnittlicher Kommissionierweg (aus Layout)' },
  { id: 'schnellaeuferGeschwindigkeit', name: 'Schnelläufer-Geschwindigkeit', einheit: 'm/s', standardwert: 2.44, aktuellerWert: 2.44, quelle: 'eingabe', kategorie: 'kommissionierer' },
  { id: 'colliProFahrt', name: 'Colli pro Kommissionier-Fahrt', einheit: 'Cll/Fahrt', standardwert: 2.0, aktuellerWert: 2.0, quelle: 'eingabe', kategorie: 'kommissionierer', beschreibung: 'Batch: Wie viele Colli pro Fahrt' },

  // Belader
  { id: 'colliProSendungBeladen', name: 'Colli pro Sdg. (Beladen)', einheit: 'Cll/Sdg', standardwert: 3.0, aktuellerWert: 3.0, quelle: 'eingabe', kategorie: 'belader' },
  { id: 'ameiseGeschwindigkeit', name: 'Ameise-Geschwindigkeit', einheit: 'm/s', standardwert: 1.5, aktuellerWert: 1.5, quelle: 'eingabe', kategorie: 'belader' },

  // Verlader
  { id: 'lkwProTag', name: 'LKW pro Tag (Ausgang)', einheit: 'LKW/Tag', standardwert: 35, aktuellerWert: 35, quelle: 'eingabe', kategorie: 'verlader' },
];
