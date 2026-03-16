import type { Prozessschritt, ProzessmodellConfig, ProzessParameter } from '@/types/prozessmodell';

/**
 * Nörpel Ulm — SE Entladung Fernverkehr national + Import
 * Quelle: VH_Prozesse_Noerpel_Ulm_Intern_Final.xlsx (März 2016)
 *
 * Referenzwert: 2.19 Min/Colli (SE Entladung FV)
 * Halle: 6.240 qm, I-Shape (40×156), Brandschutzwand, Bodenmarkierungen
 * Colli/Tag: 1.510 (31.719/Monat, 21 AT)
 * Verteilweg: 105.8m (gewichtet), Schnellläufer 1.99 m/s
 * Colli/Bewegung Entladung: 1.65 (Schnellläufer) / 1.33 (Stapler) / 1.16 (Hand)
 * Colli/Bewegung Verteilung: 1.63 (Schnellläufer)
 *
 * Entladeverfahren:
 *   V1: 90% Entladung in Entladebereich (81% Schnellläufer, 6.3% Stapler, 2.7% Hand)
 *   V2: 8% Entladung inkl. Scannung
 *   V3: 2% Entladung inkl. Scannung + Verteilung
 * Scannung: 70% durch Entlader, 20% durch Scanner
 * Verteilung: 85% Schnellläufer, 6.6% Avis-Brücke, 5% Weiterleiter, 1.4% Stapler
 *
 * Verteilkonzept: Außenspur (anders als AS Gersthofen Mittelspur)
 * ArbeitsminProStunde: 52.5 (Nörpel Standard)
 * Netto-Arbeitstage: 203/251 = 0.809
 *
 * Abteilungen: Entlader 1.11 + Scanner 0.13 + Verteiler 0.95 = 2.19 Min/Colli
 */

const NOERPEL_SE_SCHRITTE: Prozessschritt[] = [
  // ==================== ENTLADER ====================

  // Vorbereitung: Entladebericht verteilen + Tor/Gefäß öffnen
  { nr: 1, beschreibung: 'Entladebericht verteilen + Tor/Gefäß öffnen', abteilung: 'entlader', hilfsmittel: 'Hand',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 4.8, anteil: 1.0, haeufigkeit: 1.0 },
  // 4.8 / 60 = 0.080 Min/Colli (Steps 9+11 combined)

  // V1: Colli entladen (Schnellläufer 81%)
  { nr: 2, beschreibung: 'V1: Colli entladen Schnellläufer (81%)', abteilung: 'entlader', hilfsmittel: 'Schnellläufer',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 54.0, anteil: 0.81, haeufigkeit: 0.606 },
  // 54.0 × 0.81 × (1/1.65) / 60 = 0.442 Min/Colli

  // V1: Colli entladen (Stapler 6.3%)
  { nr: 3, beschreibung: 'V1: Colli entladen Stapler (6.3%)', abteilung: 'entlader', hilfsmittel: 'Stapler',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 52.0, anteil: 0.063, haeufigkeit: 0.752 },
  // 52.0 × 0.063 × (1/1.33) / 60 = 0.041 Min/Colli

  // V1: Colli entladen (per Hand 2.7%)
  { nr: 4, beschreibung: 'V1: Colli entladen per Hand (2.7%)', abteilung: 'entlader', hilfsmittel: 'Hand',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 49.7, anteil: 0.027, haeufigkeit: 0.862 },
  // 49.7 × 0.027 × (1/1.16) / 60 = 0.019 Min/Colli

  // V2: Colli entladen + scannen (8%)
  { nr: 5, beschreibung: 'V2: Colli entladen + scannen (8%)', abteilung: 'entlader', hilfsmittel: 'Schnellläufer + Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 86.5, anteil: 0.08, haeufigkeit: 0.606 },
  // 86.5 × 0.08 × 0.606 / 60 = 0.070 Min/Colli

  // V3: Colli entladen + scannen + verteilen (2%)
  { nr: 6, beschreibung: 'V3: Colli entladen + scannen + verteilen (2%)', abteilung: 'entlader', hilfsmittel: 'Schnellläufer + Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 101.5, anteil: 0.02, haeufigkeit: 1.0 },
  // 101.5 × 0.02 × 1.0 / 60 = 0.034 Min/Colli

  // Colli scannen + Relationsplatz notieren (Entlader 70%)
  { nr: 7, beschreibung: 'Colli scannen + Relationsplatz notieren (Entlader 70%)', abteilung: 'entlader', hilfsmittel: 'Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 14.2, anteil: 0.70, haeufigkeit: 1.0 },
  // 14.2 × 0.70 / 60 = 0.166 Min/Colli

  // Beschädigung dokumentieren (Entlader 8.5%)
  { nr: 8, beschreibung: 'Beschädigung dokumentieren (Entlader 8.5%)', abteilung: 'entlader', hilfsmittel: 'Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 53.2, anteil: 0.085, haeufigkeit: 1.0 },
  // 53.2 × 0.085 / 60 = 0.075 Min/Colli

  // Sonstige Entlader (Avis-Brücke, Umpacken, Folieren, Stapler holen, Überzähl., Sperrig.)
  { nr: 9, beschreibung: 'Sonstige (Avis-Brücke, Umpacken, Folieren, Stapler holen)', abteilung: 'entlader', hilfsmittel: 'div.',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 10.3, anteil: 1.0, haeufigkeit: 1.0 },
  // 10.3 / 60 = 0.172 Min/Colli

  // ==================== SCANNER ====================

  // Colli scannen + Relationsplatz (Scanner 20%)
  { nr: 15, beschreibung: 'Colli scannen + Relationsplatz (Scanner 20%)', abteilung: 'scanner', hilfsmittel: 'Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 14.2, anteil: 0.20, haeufigkeit: 1.0 },
  // 14.2 × 0.20 / 60 = 0.047 Min/Colli

  // Wartezeit Scanner (20%)
  { nr: 16, beschreibung: 'Wartezeit Scanner (20%)', abteilung: 'scanner', hilfsmittel: '-',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 17.1, anteil: 0.20, haeufigkeit: 1.0 },
  // 17.1 × 0.20 / 60 = 0.057 Min/Colli

  // Sonstige Scanner (Beschädigung 2.1%, Überzähligkeit, Sperrigkeit)
  { nr: 17, beschreibung: 'Sonstige Scanner (Beschädigung, Überzähl., Sperrig.)', abteilung: 'scanner', hilfsmittel: 'Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 1.7, anteil: 1.0, haeufigkeit: 1.0 },
  // 1.7 / 60 = 0.028 Min/Colli

  // ==================== VERTEILER ====================

  // Zum Relationsplatz fahren (VERTEILWEG — 85% Schnellläufer)
  { nr: 25, beschreibung: 'Zum Relationsplatz fahren (VERTEILWEG, 85% Schnellläufer)', abteilung: 'verteiler', hilfsmittel: 'Schnellläufer',
    wegM: 105.8, wegAusLayout: true, geschwindigkeitMs: 1.99,
    standardzeitSek: 53.2, anteil: 0.85, haeufigkeit: 1.0 },
  // Bei wegAusLayout: zeitSek = verteilweg / geschwindigkeit / colliProFahrt
  // = 105.8 / 1.99 / 1.63 = 32.60 Sek × 0.85 = 27.71 Sek → 0.462 Min/Colli

  // Rückfahrt + Handling + sonstige Verteilung (Avis 6.6%, Weiterleiter 5%, Stapler 1.4%)
  { nr: 26, beschreibung: 'Rückfahrt + Handling + sonstige Verteilung', abteilung: 'verteiler', hilfsmittel: 'Schnellläufer',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 29.8, anteil: 1.0, haeufigkeit: 1.0 },
  // 29.8 / 60 = 0.497 Min/Colli
  // (Rückfahrt ≈ 0.35 + Handling ≈ 0.08 + Avis/Weiterleiter/Stapler ≈ 0.06)
];

export const PROZESSMODELL_NOERPEL_ULM: ProzessmodellConfig = {
  id: 'se_noerpel_ulm',
  name: 'Nörpel Ulm (SE)',
  beschreibung: 'SE Entladung FV — 6.240 qm I-Shape, Schnellläufer, Außenspur-Verteilung',
  prozessTyp: 'se',
  schritte: NOERPEL_SE_SCHRITTE,
  abteilungen: [
    { id: 'entlader', label: 'Entlader', color: '#3b82f6' },
    { id: 'scanner', label: 'Scanner', color: '#22c55e' },
    { id: 'verteiler', label: 'Verteiler', color: '#f59e0b' },
  ],
};

/**
 * Standard-Parameter für Nörpel Ulm SE.
 * Verteilweg 105.8m, Schnellläufer 1.99 m/s, 1.63 Colli/Fahrt.
 */
export const NOERPEL_ULM_SE_PARAMETER: ProzessParameter[] = [
  { id: 'colliProTag', name: 'Colli pro Tag', einheit: 'Cll/Tag', standardwert: 1510, aktuellerWert: 1510, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: '31.719 Colli/Monat ÷ 21 AT (Referenzmonat März 2016)' },
  { id: 'sendungenProTag', name: 'Sendungen pro Tag', einheit: 'Sdg/Tag', standardwert: 593, aktuellerWert: 593, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProSendung', name: 'Colli pro Sendung', einheit: 'Cll/Sdg', standardwert: 2.5, aktuellerWert: 2.5, quelle: 'berechnet', kategorie: 'allgemein' },
  { id: 'arbeitsminProStunde', name: 'Arbeitsmin. pro Stunde', einheit: 'min', standardwert: 52.5, aktuellerWert: 52.5, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Nörpel Standard (identisch mit Geis)' },
  { id: 'arbeitsstundenProTag', name: 'Arbeitsstunden pro Tag', einheit: 'h', standardwert: 6.6, aktuellerWert: 6.6, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: '38h/Woche = 7.6h/Tag minus 1h Verteilzeit' },
  { id: 'colliProQm', name: 'Colli pro qm Stellfläche', einheit: 'Cll/qm', standardwert: 1.25, aktuellerWert: 1.25, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProPalette', name: 'Colli pro Palette', einheit: 'Cll/Pal', standardwert: 25, aktuellerWert: 25, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'staplerGeschwindigkeit', name: 'Stapler-Geschwindigkeit', einheit: 'm/s', standardwert: 2.7, aktuellerWert: 2.7, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'lkwProTag', name: 'LKW pro Tag (Eingang)', einheit: 'LKW/Tag', standardwert: 50, aktuellerWert: 50, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'scanZeitProColli', name: 'Scan-Zeit pro Colli', einheit: 'Sek', standardwert: 14.2, aktuellerWert: 14.2, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'labelAufklebenZeit', name: 'Label aufkleben', einheit: 'Sek', standardwert: 0, aktuellerWert: 0, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'problemColliAnteil', name: 'Problem-Colli Anteil', einheit: '%', standardwert: 8.5, aktuellerWert: 8.5, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'verteilweg', name: 'Gewichteter Verteilweg', einheit: 'm', standardwert: 105.8, aktuellerWert: 105.8, quelle: 'layout', kategorie: 'verteiler', beschreibung: 'Gemessen: 105.8m (Schnellläufer, gewichtet, Außenspur)' },
  { id: 'schnellaeuferGeschwindigkeit', name: 'Verteilgeschwindigkeit (Schnellläufer)', einheit: 'm/s', standardwert: 1.99, aktuellerWert: 1.99, quelle: 'eingabe', kategorie: 'verteiler', beschreibung: 'Nörpel: Schnellläufer (langsamer als AS Stapler)' },
  { id: 'colliAbstellenZeit', name: 'Colli abstellen', einheit: 'Sek', standardwert: 5.0, aktuellerWert: 5.0, quelle: 'eingabe', kategorie: 'verteiler' },
  { id: 'colliProFahrt', name: 'Colli pro Verteiler-Fahrt', einheit: 'Cll/Fahrt', standardwert: 1.63, aktuellerWert: 1.63, quelle: 'eingabe', kategorie: 'verteiler', beschreibung: 'Gemessen: 1.63 Colli/Bewegung (Schnellläufer), 1.16 Stopps' },
];
