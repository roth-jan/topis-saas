/** Stable string fragments to look up TOPIS toolbar buttons + dropdown items.
 * The UI is German. Update here if labels are renamed in the app, not in each spec. */

export const TOOLBAR = {
  // IA-Pass Commit b30f5cb2: "Lastenheft"-Dropdown aufgeteilt. Verlader-Modul +
  // Unterflurförderkette liegen jetzt im "Module"-Dropdown (Layout-Phase); die
  // Analyse-Dialoge (Mengen-Modell / Relations-Plan / Bereichseinteilung) sind
  // eigene Buttons in der Auswertungs-Phase.
  moduleDropdown: 'Module',
  objekteDropdown: 'Objekte',
  bearbeitenDropdown: 'Bearbeiten',
  ansichtDropdown: 'Ansicht',
  multiInsert: 'Multi-Insert',
};

export const TOOLS = {
  auswahl: 'Auswahl',
  verschieben: 'Verschieben',
  tor: 'Tor',
  stellplatz: 'Stellplatz',
  regal: 'Regal',
  bereich: 'Bereich',
  weg: 'Weg',
  fahrgang: 'Fahrgang',
  foerderband: 'Förderband',
  messen: 'Messen',
};

// Frühere "Lastenheft"-Einträge, jetzt an zwei Orten (siehe TOOLBAR-Kommentar).
// AUSWERTUNG_BUTTONS: Buttons in der Auswertungs-Phase (Button-Text, ggf. gekürzt).
// MODULE_MENU: Menüeinträge im "Module"-Dropdown der Layout-Phase.
export const AUSWERTUNG_BUTTONS = {
  hallenRelationsPlan: 'Relations-Plan',   // Button-Text (Dialog-Titel: "Hallen-Relations-Plan")
  bereichsEinteilung: 'Bereichseinteilung',
  mengenModell: 'Mengen-Modell',
};

export const MODULE_MENU = {
  verlader: 'Verlader-Modul',
  kette: 'Unterflurförderkette',
};

export const PANEL_CARDS = {
  wandVerankerung: 'Wand-Verankerung',
  ueberladebruecke: 'Überladebrücke',
  torVerknuepfungen: 'Tor-Verknüpfungen',
  wegpunkt: 'Wegpunkt',
  kapazitaet: 'Kapazität',
  regalEbenenDetailliert: 'Regal-Ebenen detailliert',
  form: 'Form (Lastenheft 3.1.3.1)',
  verankerungBezeichnung: 'Verankerung + Bezeichnung',
};
