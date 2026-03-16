import type { Prozessschritt, ProzessmodellConfig, ProzessParameter } from '@/types/prozessmodell';

/**
 * Geis TuL Nürnberg — SE Entladung Fernverkehr
 * Quelle: VH_Prozesse_Geis_Nürnberg.xlsx (April 2014)
 *
 * Referenzwert: 1.95 Min/Colli (SE Entladung FV national + Import)
 * Halle: 4.512 qm, L-Shape (42×76 + 60×22)
 * Colli/Tag: 1.246 (24.929/Monat, 20 AT)
 * Gefäße/Tag: 35, Colli/Gefäß: 35.6
 * Verteilweg: 101m (gewichtet), Stapler 2.7 m/s
 * Colli/Bewegung Entladung: 1.39 (Stapler)
 * Colli/Bewegung Verteilung: 1.46 (Stapler)
 *
 * Entladeverfahren: 35% Einzelentladung + scannen, 60% Teamentladung + Scanner, 5% vor Tor
 * Verteilung: 100% Stapler (kein Schnellläufer/Ameise)
 *
 * Abteilungen: Entlader 0.79 + Scanner 0.61 + Verteiler 0.55 = 1.95 Min/Colli
 *
 * IST-Produktivität: SE 48.4 Colli/MA-Std (SOLL: 62.1)
 */

// Umrechnungsfaktoren
const COLLI_PRO_TAG = 1246;
const GEFAESSE_PRO_TAG = 35;
const H_GEFAESS = GEFAESSE_PRO_TAG / COLLI_PRO_TAG; // 0.02810
const COLLI_PRO_BEW_ENTL = 1.39; // Colli/Bewegung Entladung
const H_BEW_ENTL = 1 / COLLI_PRO_BEW_ENTL; // 0.7194
const COLLI_PRO_BEW_VERT = 1.46; // Colli/Bewegung Verteilung
const H_BEW_VERT = 1 / COLLI_PRO_BEW_VERT; // 0.6849

const GEIS_NUERNBERG_SE_SCHRITTE: Prozessschritt[] = [
  // ==================== ENTLADER (inkl. Schichtleiter-Aufgaben) ====================

  // WB an Rampe anstellen + abziehen (Schichtleiter 85% + Entlader 10%)
  // Steps 4a+4b+20a+20b combined: 210 Sek × 0.95 × h_gefaess × 2 (an+ab)
  { nr: 1, beschreibung: 'WB an Rampe anstellen + abziehen (2×)', abteilung: 'entlader', hilfsmittel: 'Rangierer',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 210, anteil: 0.95, haeufigkeit: H_GEFAESS * 2 },
  // 210 × 0.95 × 0.0562 / 60 = 0.187 Min/Colli

  // Gefäß öffnen + schließen (2×)
  { nr: 2, beschreibung: 'Gefäß öffnen/schließen, Rampe an-/absetzen (2×)', abteilung: 'entlader', hilfsmittel: 'Hand',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 55, anteil: 1.0, haeufigkeit: H_GEFAESS * 2 },
  // 55 × 1.0 × 0.0562 / 60 = 0.052 Min/Colli

  // Entladebeleg + Anmerkungen/Eingangsbeleg
  { nr: 3, beschreibung: 'Entladebeleg + Anmerkungen + Eingangsbeleg', abteilung: 'entlader', hilfsmittel: 'Stift',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 167, anteil: 1.0, haeufigkeit: H_GEFAESS },
  // (47+120) × 0.0281 / 60 = 0.078 Min/Colli

  // Colli entladen + scannen (Einzelentladung, 35% der Colli)
  { nr: 4, beschreibung: 'Colli entladen + scannen (Einzelentladung 35%)', abteilung: 'entlader', hilfsmittel: 'Stapler',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 34.8, anteil: 0.35, haeufigkeit: H_BEW_ENTL },
  // 34.8 × 0.35 × 0.719 / 60 = 0.146 Min/Colli

  // Colli entladen (Teamentladung, 60% der Colli)
  { nr: 5, beschreibung: 'Colli entladen (Teamentladung 60%)', abteilung: 'entlader', hilfsmittel: 'Stapler',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 35.1, anteil: 0.60, haeufigkeit: H_BEW_ENTL },
  // 35.1 × 0.60 × 0.719 / 60 = 0.253 Min/Colli

  // Colli vor Tor abstellen (5%)
  { nr: 6, beschreibung: 'Colli vor Tor abstellen (5%)', abteilung: 'entlader', hilfsmittel: 'Stapler',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 45.4, anteil: 0.05, haeufigkeit: H_BEW_ENTL },
  // 45.4 × 0.05 × 0.719 / 60 = 0.027 Min/Colli

  // Sonstige Entlader-Tätigkeiten (Barcode, Beschäd., Diff., Sperrig., UZ, Scan-nach-Tor, Tor)
  // Aggregiert aus Steps 7a, 9b, 13a, 14a, 15a, 16a, 21a, 2, 23
  { nr: 7, beschreibung: 'Sonstige (Barcode, Beschäd., Differenzen, Sperrig.)', abteilung: 'entlader', hilfsmittel: 'div.',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 2.7, anteil: 1.0, haeufigkeit: 1.0 },
  // 2.7 / 60 = 0.045 Min/Colli (Summe aller Kleinschritte Entlader)

  // ==================== SCANNER ====================

  // Colli scannen + Relationsplatz ansagen (60% der Colli, bei Teamentladung)
  { nr: 10, beschreibung: 'Colli scannen + Relationsplatz ansagen (60%)', abteilung: 'scanner', hilfsmittel: 'Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 25.2, anteil: 0.60, haeufigkeit: 1.0 },
  // 25.2 × 0.60 / 60 = 0.252 Min/Colli

  // Wartezeit Scanner während Verteilung (60%)
  { nr: 11, beschreibung: 'Wartezeit Scanner während Verteilung (60%)', abteilung: 'scanner', hilfsmittel: '-',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 32.3, anteil: 0.60, haeufigkeit: 1.0 },
  // 32.3 × 0.60 / 60 = 0.323 Min/Colli

  // Sonstige Scanner (Barcode, Beschäd., Diff., Sperrig., Abschluss, UZ)
  { nr: 12, beschreibung: 'Sonstige Scanner (Beschäd., Differenzen, Abschluss)', abteilung: 'scanner', hilfsmittel: 'Scanner',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 2.2, anteil: 1.0, haeufigkeit: 1.0 },
  // 2.2 / 60 = 0.037 Min/Colli

  // ==================== VERTEILER ====================

  // Mischpalette auflösen (3.5% der Colli)
  { nr: 20, beschreibung: 'Mischpalette auflösen (3.5%)', abteilung: 'verteiler', hilfsmittel: 'Hand',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 9.4, anteil: 0.035, haeufigkeit: 1.0 },
  // 9.4 × 0.035 / 60 = 0.005 Min/Colli

  // Zum Relationsplatz fahren (VERTEILWEG — dynamisch aus Layout)
  { nr: 21, beschreibung: 'Zum Relationsplatz fahren (VERTEILWEG)', abteilung: 'verteiler', hilfsmittel: 'Stapler',
    wegM: 101, wegAusLayout: true, geschwindigkeitMs: 2.7,
    standardzeitSek: 37.4, anteil: 1.0, haeufigkeit: 1.0 },
  // Bei wegAusLayout: zeitSek = verteilweg / geschwindigkeit / colliProFahrt
  // = 101 / 2.7 / 1.46 = 25.61 Sek → 0.427 Min/Colli

  // Colli abstellen / Handling am Relationsplatz
  { nr: 22, beschreibung: 'Colli abstellen, Handling am Relationsplatz', abteilung: 'verteiler', hilfsmittel: 'Stapler',
    wegM: 0, wegAusLayout: false, geschwindigkeitMs: 0,
    standardzeitSek: 10.4, anteil: 1.0, haeufigkeit: H_BEW_VERT },
  // 10.4 × 1.0 × 0.685 / 60 = 0.119 Min/Colli
];

export const PROZESSMODELL_GEIS_NUERNBERG: ProzessmodellConfig = {
  id: 'se_geis_nuernberg',
  name: 'Geis TuL Nürnberg (SE)',
  beschreibung: 'SE Entladung FV — 4.512 qm L-Shape, 100% Stapler, Teamentladung',
  prozessTyp: 'se',
  schritte: GEIS_NUERNBERG_SE_SCHRITTE,
  abteilungen: [
    { id: 'entlader', label: 'Entlader', color: '#3b82f6' },
    { id: 'scanner', label: 'Scanner', color: '#22c55e' },
    { id: 'verteiler', label: 'Verteiler', color: '#f59e0b' },
  ],
};

/**
 * Standard-Parameter für Geis Nürnberg SE.
 * Verteilweg 101m, Stapler 2.7 m/s, 1.46 Colli/Fahrt.
 */
export const GEIS_NUERNBERG_SE_PARAMETER: ProzessParameter[] = [
  { id: 'colliProTag', name: 'Colli pro Tag', einheit: 'Cll/Tag', standardwert: 1246, aktuellerWert: 1246, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: '24.929 Colli/Monat ÷ 20 AT (Referenzmonat Apr. 2014)' },
  { id: 'sendungenProTag', name: 'Sendungen pro Tag', einheit: 'Sdg/Tag', standardwert: 466, aktuellerWert: 466, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProSendung', name: 'Colli pro Sendung', einheit: 'Cll/Sdg', standardwert: 2.7, aktuellerWert: 2.7, quelle: 'berechnet', kategorie: 'allgemein' },
  { id: 'arbeitsminProStunde', name: 'Arbeitsmin. pro Stunde', einheit: 'min', standardwert: 52.5, aktuellerWert: 52.5, quelle: 'eingabe', kategorie: 'allgemein', beschreibung: 'Geis Standard (leicht niedriger als AS 52.9)' },
  { id: 'arbeitsstundenProTag', name: 'Arbeitsstunden pro Tag', einheit: 'h', standardwert: 7.0, aktuellerWert: 7.0, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProQm', name: 'Colli pro qm Stellfläche', einheit: 'Cll/qm', standardwert: 1.25, aktuellerWert: 1.25, quelle: 'eingabe', kategorie: 'allgemein' },
  { id: 'colliProPalette', name: 'Colli pro Palette', einheit: 'Cll/Pal', standardwert: 36, aktuellerWert: 36, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'staplerGeschwindigkeit', name: 'Stapler-Geschwindigkeit', einheit: 'm/s', standardwert: 2.7, aktuellerWert: 2.7, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'lkwProTag', name: 'LKW pro Tag (Eingang)', einheit: 'LKW/Tag', standardwert: 35, aktuellerWert: 35, quelle: 'eingabe', kategorie: 'entlader' },
  { id: 'scanZeitProColli', name: 'Scan-Zeit pro Colli', einheit: 'Sek', standardwert: 25.2, aktuellerWert: 25.2, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'labelAufklebenZeit', name: 'Label aufkleben', einheit: 'Sek', standardwert: 0, aktuellerWert: 0, quelle: 'eingabe', kategorie: 'scanner', beschreibung: 'In Scan-Zeit enthalten (Relationsplatz ansagen)' },
  { id: 'problemColliAnteil', name: 'Problem-Colli Anteil', einheit: '%', standardwert: 0.8, aktuellerWert: 0.8, quelle: 'eingabe', kategorie: 'scanner' },
  { id: 'verteilweg', name: 'Gewichteter Verteilweg', einheit: 'm', standardwert: 101, aktuellerWert: 101, quelle: 'layout', kategorie: 'verteiler', beschreibung: 'Gemessen: 101m (Stapler, gewichtet nach Colli)' },
  { id: 'schnellaeuferGeschwindigkeit', name: 'Verteilgeschwindigkeit (Stapler)', einheit: 'm/s', standardwert: 2.7, aktuellerWert: 2.7, quelle: 'eingabe', kategorie: 'verteiler', beschreibung: 'Geis Nürnberg: 100% Stapler-Verteilung' },
  { id: 'colliAbstellenZeit', name: 'Colli abstellen', einheit: 'Sek', standardwert: 10.4, aktuellerWert: 10.4, quelle: 'eingabe', kategorie: 'verteiler' },
  { id: 'colliProFahrt', name: 'Colli pro Verteiler-Fahrt', einheit: 'Cll/Fahrt', standardwert: 1.46, aktuellerWert: 1.46, quelle: 'eingabe', kategorie: 'verteiler', beschreibung: 'Gemessen: 1.46 Colli/Bewegung (Stapler-Verteilung)' },
];
