// TOPIS Type Definitions

// ==================== HALL ====================
export interface Hall {
  id: number;
  shape: 'rect' | 'L' | 'T' | 'U' | 'C';
  width: number;
  height: number;
  name: string;
  walls: Wall[];
  offsetX: number;
  offsetY: number;
  color: string;
}

export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ==================== OBJECTS ====================
export type ObjectType =
  | 'tor'
  | 'stellplatz'
  | 'bereich'
  | 'regal'
  | 'hindernis'
  | 'rampe'
  | 'leveller'
  | 'pfosten'
  | 'treppe'
  | 'ladestation'
  | 'gefahrgut'
  | 'sperrplatz'
  | 'klaerplatz'
  | 'buero'
  | 'sozialraum'
  | 'wc'
  | 'wand'
  | 'tuer'
  | 'entladebereich'
  | 'outdoor_area'
  | 'outdoor_road'
  | 'trailer_spot'
  | 'parking'
  | 'custom'
  // Neue Typen aus Lastenheft-Gegencheck 2026-05-31
  | 'kommissionierflaeche'   // 3.1.3.4 — eigene Kategorie
  | 'wertverschlag'          // 3.1.3.3 — Käfig
  | 'hallenterminal'         // 3.1.3.3 — Hallenterminal
  | 'av_platz'               // 3.1.3.3 — Annahmeverweigerung
  | 'uz_platz'               // 3.1.3.3 — Überzähligkeit
  | 'palettenlager'          // 3.1.3.3 — Palettenlager
  | 'sattelplatz'            // 3.1.6 — Außengelände Sattelplatz
  | 'wechselbrueckenplatz';  // 3.1.6 — Außengelände Wechselbrückenplatz

export interface TopisObject {
  id: number;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  rotation?: number;
  color?: string;
  side?: 'north' | 'south' | 'east' | 'west';
  capacity?: number;
  currentLoad?: number;
  // Regal-spezifisch (Lastenheft + Papa)
  regalTyp?: 'palettenregal' | 'fachbodenregal' | 'kragarmregal' | 'durchlaufregal';
  ebenen?: number;                    // Anzahl Ebenen (2-n)
  unterkante?: number;                // Unterkante erste Ebene in m
  ebenenHoehe?: number;               // Höhe pro Ebene in m
  palettenPlaetzeProEbene?: number;   // Palettenplätze pro Ebene
  einlagerungszeitSek?: number;       // Zeit für Einlagerung pro Ebene (Sekunden)

  // Stellplatz-spezifisch (Papa: Stapeln auf Boden)
  stapelHoehe?: number;               // Wie viele Paletten übereinander (1-4 typisch)
  palettenProStellplatz?: number;     // Kapazität in Paletten (berechnet: Fläche × Stapelhöhe)
  // Tor-spezifisch
  torTyp?: 'sektionaltor' | 'rolltor' | 'schnelllauftor';
  torNummer?: number;
  // Lastenheft 3.1.2: „Als zeichnerisches Element ohne Funktion sind sog.
  // Überladebrücken **optional** bei den Toren vorzusehen. Die Überladebrücken
  // sind rechteckig, **in der Breite des Tores**, mit **einzutragender Länge**
  // darzustellen und liegen **im inneren Layout direkt vor dem Tor**."
  // Wenn ueberladebrueckeAktiv === true, wird beim Render ein Rechteck in
  // Tor-Breite × ueberladebrueckeLaenge direkt vor dem Tor gezeichnet.
  ueberladebrueckeAktiv?: boolean;
  ueberladebrueckeLaenge?: number;
  // Tor-Kalkulation (Papa's Anforderungen)
  palettenProTag?: number;        // Anzahl Paletten pro Tag
  entladeZeitSek?: number;        // Zeit pro Palette beim Entladen (Sekunden)
  beladeZeitSek?: number;         // Zeit pro Palette beim Beladen (Sekunden)
  istEingang?: boolean;           // Wareneingang
  istAusgang?: boolean;           // Warenausgang
  zielObjektId?: number;          // Ziel-Stellplatz/Regal für Berechnung
  // ===== Generischer Erweiterungs-Pfad (Daniel-Lastenheft "Individualobjekt") =====
  // Tags: Klassifikation ohne Typ-Eingriff. Beispiele: ['messpunkt'], ['scanner','eingang'],
  // ['rfid','tor-scan']. Tags ermöglichen Filter/Heatmap/Auswertungen, ohne dass für jede
  // Spezialform ein neuer ObjectType nötig wird.
  tags?: string[];
  // Freie Metadaten als Key/Value. Eine KI / ein Berater kann beliebige Felder hinzufügen,
  // ohne Code zu ändern. Beispiele: { code: "MP5", rolle: "Entladung FV", externeId: "scanner-12" }
  meta?: Record<string, string>;
  // Visuelle Form-Variante (default: rect). Ermöglicht Sonder-Rendering ohne neuen Typ.
  shape?: 'rect' | 'circle';
  // Optionales Icon-Schlüsselwort für KI/Renderer (z.B. "crosshair", "scanner"). Frei wählbar.
  icon?: string;
  // Wenn true: dieses Objekt blockiert Stapler-Wege (A* findet keinen Pfad durch).
  // Standard: bei type 'wand', 'bereich', 'regal', 'hindernis' implizit true (im Code abgebildet),
  // bei anderen Typen über dieses Flag explizit setzbar.
  istUndurchlaessig?: boolean;

  // ===== Parent-Bindung (Lastenheft 3.1.2 Überladebrücke „direkt vor dem Tor") =====
  // Wenn gesetzt: dieses Objekt folgt seinem Parent (z.B. eine Überladebrücke an
  // einem Tor). Beim Verschieben/Löschen des Parents wandert/verschwindet das
  // Kind automatisch. parentOffset speichert die Welt-Differenz zur Parent-Position
  // zum Zeitpunkt der Bindung — bleibt damit auch bei Tor-Move erhalten.
  parentObjectId?: number;
  parentOffset?: { x: number; y: number };

  // ===== Tor↔Auswertungs-Verknüpfungen (Lastenheft 3.1.2) =====
  // 1 Tor = 1..n Verlader / Stellplätze / Fahrzeuge. Persistierte Relation für
  // Auswertungen (Verladeplan, Tor-Belegung, Cross-Docking).
  bedientStellplatzIds?: number[];
  bedientVerladerIds?: number[];
  bedientFahrzeugIds?: number[];

  // ===== Wegpunkt-Property (Lastenheft 3.1.2 Tore, 3.1.3.2 Stellplätze) =====
  // Markiert ob das Element als Start, Endpunkt, beides oder keiner für Wege
  // dienen darf. Default: 'beides' (Backwards-Compat — alle Tore/Bereiche/
  // Stellplätze gelten heute pauschal als beides).
  wegpunktRolle?: 'beides' | 'start' | 'ende' | 'keiner';

  // Wegpunkt-Anker-Position: relative Position innerhalb des Element-Rechtecks
  // (0..1). Default {x: 0.5, y: 0.5} = Mittelpunkt. Lastenheft erlaubt
  // alternativ Rand-Anker. Tore mit y=0 (Nord) bekommen typisch {0.5, 1.0}
  // damit der Stapler innen am Tor startet, nicht draußen.
  wegpunktOffset?: { x: number; y: number };

  // ===== Lastenheft-Aufholplan 2026-05-31 =====

  // 3.1.1.2 — Verankerung-Property („verankert (starr/verschiebbar)")
  verankert?: 'starr' | 'verschiebbar';

  // 3.1.1.2 — Einschränkungen (Positionierung / Zusammenspiel mit anderen Objekten)
  einschraenkungen?: string;

  // 3.1.3.1 — Bezeichnungstext formatierbar (Schriftgröße, Fett, Kursiv)
  bezeichnungStil?: { fontSize?: number; bold?: boolean; italic?: boolean; color?: string };

  // 3.1.7 — Eigenschaften je nach Ansicht ein-/ausblendbar (Bildschirm vs. Druckmodus)
  // Key = Property-Name (z.B. 'name', 'kapazitaet'), Value = sichtbar.
  // Default (nicht gesetzt) bedeutet „sichtbar".
  bildschirmSichtbar?: Record<string, boolean>;
  druckSichtbar?: Record<string, boolean>;

  // 3.1.2 — Tor MUSS Außenwand-Kontakt haben. aussenwandRef referenziert den
  // Wand-Index in halls[activeHall].walls und speichert die Position als
  // Abstand von Eckpunkten S (Start) und E (End) der Wand.
  // wallIndex < 0 = noch nicht verankert (Migration alter Tore).
  aussenwandRef?: { wallIndex: number; abstandS: number; abstandE: number };

  // 3.1.3.1 — Stellplatz↔Tor umgekehrt (am Stellplatz gespeichert welche Tore ihn bedienen)
  bedientToreVon?: number[];

  // 3.1.3.1 — n Relationen pro Stellplatz (Prozess + Relation + Menge + Verladebereich + Fahrzeuge)
  relationen?: StellplatzRelation[];

  // 3.1.3.1 — Kapazität in 3 Einheiten (Packstücke, Lademeter, qm)
  kapazitaetMulti?: { packstuecke?: number; lademeter?: number; qm?: number };

  // 3.1.3.1 — Füllgrad-Ampel-Schwellen (Menge/Kapazität → grün/gelb/rot)
  fuellgradFarben?: { gruenBis: number; gelbBis: number };

  // 3.1.3.2 — Regal-Ebenen als Array (jede Ebene = eigener Stellplatz mit Properties)
  regalEbenen?: RegalEbene[];

  // 3.1.2 — Nummerierungs-Schema beim Mehrfach-Insert
  // '1' = 1,2,3   |   'A1' = A1,A2,A3   |   '1A' = 1A,1B,1C   |   'A' = A,B,C
  nummernSchema?: '1' | 'A1' | '1A' | 'A';

  // 3.1.3.1 — Form-Variante (Kreis, Trapez, Polygon zusätzlich zu rect/circle in shape)
  formVariante?: 'rect' | 'circle' | 'trapez' | 'polygon';
  // Für trapez/polygon: relative Polygon-Punkte 0..1 relativ zu width/height
  polygonPunkte?: { x: number; y: number }[];

  // 3.1.2 — Tor-Art als eigene Property (separat zu torTyp)
  torArt?: string;  // max. 100 Zeichen freier Text laut Lastenheft

  // 3.1.4.2 — Manuelle Wege ausgenommen von Auto-Aktualisierung (für Kettenanbindung)
  // (Auf Path-Ebene, aber hier für Element-Verknüpfungen relevant)
}

// ==================== STELLPLATZ-RELATIONEN (Lastenheft 3.1.3.1 + 3.2.2) ====================
/** Eine Zuordnung von Mengen + Verladebereich + Fahrzeugen zu einem Stellplatz.
 * Ein Stellplatz kann n Relationen haben (n:m mit Prozessen), eine Relation
 * kann sich prozentual auf mehrere Stellplätze verteilen. */
export interface StellplatzRelation {
  id: number;
  prozess: string;         // z.B. „SE", „SA", „Cross-Dock"
  relation: string;        // z.B. „Berlin-001", „München-Süd"
  menge: number;           // Anzahl Colli/Paletten in dieser Relation
  verladebereich?: string; // z.B. „B1", „B2"
  fahrzeugIds?: number[];  // Verknüpfte Fahrzeuge
  prozentAnteil?: number;  // 0..1 — falls Relation auf mehrere Stellplätze verteilt
  bereichGruppe?: string;  // Untergruppierung der Relationen (Lastenheft)
}

// ==================== REGAL-EBENEN (Lastenheft 3.1.3.2) ====================
/** Eine Regal-Ebene ist laut Lastenheft ein eigener Stellplatz mit allen
 * Stellplatz-Eigenschaften plus pro-Ebene-Properties (Unterkante, Höhe, Plätze). */
export interface RegalEbene {
  id: number;
  name: string;            // Pro-Ebene-Bezeichnung (auf Canvas anzeigbar)
  unterkante: number;      // m über Boden
  hoehe: number;           // m Ebenenhöhe
  palettenplaetze: number; // Plätze pro Ebene
  // Stellplatz-Properties pro Ebene (optional, sonst Regal-Defaults)
  kapazitaetMulti?: { packstuecke?: number; lademeter?: number; qm?: number };
  relationen?: StellplatzRelation[];
}

// ==================== MENGEN-MODELL (Lastenheft 3.2.1) ====================
/** Prozesskategorie mit optionalen Subprozessen. */
export interface Prozesskategorie {
  id: number;
  name: string;
  subprozesse?: string[];
}

export type PackstueckTyp =
  | 'palette'
  | 'halbpalette'
  | 'chep'
  | 'gibo'
  | 'industriepalette'
  | 'colli'
  | 'sonstiges';

/** Ein einzelner Mengen-Eintrag pro Prozess+Relation+Typ. */
export interface MengenEintrag {
  id: number;
  prozess: string;          // Verweis auf Prozesskategorie
  subprozess?: string;
  relation: string;
  anzahl: number;            // 2 NK Präzision
  typ: PackstueckTyp;
  laenge?: number;           // m
  breite?: number;           // m
  hoehe?: number;            // m
  stapelbar?: boolean;
}

// ==================== KETTEN-WEGBEREICH (Lastenheft 3.1.5) ====================
/** Unterflurförderkette als eigener Wegbereich. Hat eigene Breite, Fließrichtung,
 * Kurven+Geraden, darf sich mit normalen Wegen überlappen aber keine Nutzflächen
 * dürfen darin liegen. */
export interface KettenWegbereich {
  id: number;
  name: string;
  punkte: { x: number; y: number }[]; // Pfad-Stützpunkte (Kurven via Bezier-Approx)
  breite: number;
  fliessrichtung: 'vorwaerts' | 'rueckwaerts'; // Pfeil-Visualisierung
  farbe?: string;
}

// ==================== BEREICHSEINTEILUNG (Lastenheft 3.2.5) ====================
/** Gruppierung von Toren + Stellplätzen für Auswertungen.
 * „Menge der zugeordneten Relationen je Prozesskategorie summiert" — pro Bereich
 * werden Tor-Belegung + Stellplatz-Mengen je Prozess aufsummiert. */
export interface BereichsEinteilung {
  id: number;
  name: string;
  torIds: number[];
  stellplatzIds: number[];
  color?: string;
}

// ==================== AUSSENGELÄNDE (Lastenheft 3.1.6) ====================
/** Außengelände-Container: Gebäude, Straßen, Sattel-/Wechselbrücken-Plätze
 * schematisch. Sattel-/Wechselbrücken-Plätze sind separat als TopisObject mit
 * type='sattelplatz'/'wechselbrueckenplatz' modelliert, hier nur die
 * abstrakte Gelände-Definition mit Außenflächen. */
export interface Aussengelaende {
  id: number;
  name: string;
  // Gelände-Umriss als Polygon (außerhalb der Halle)
  punkte: { x: number; y: number }[];
  farbe?: string;
  beschreibung?: string;
}

// ==================== PATHS ====================
export interface Waypoint {
  x: number;
  y: number;
  objectId: number | null;
}

/** Lastenheft 3.2.4: Mittlerer-Weg-Run — eine Berechnung mit Bezeichnung,
 * Prozess-Zuordnung und Zeitstempel, wiederholbar. */
export interface MittlererWegRun {
  id: number;
  name: string;
  prozess?: string;
  timestamp: string;
  startIds: number[];
  endIds: number[];
  ffzId?: number;
  ergebnisVerteilweg?: number;
  ergebnisAnzahl?: number;
}

export interface Path {
  id: number;
  name: string;
  waypoints: Waypoint[];
  color?: string;
  // Verknüpfte Objekte
  startObjectId?: number;
  startObjectName?: string;
  endObjectId?: number;
  endObjectName?: string;
  // Auto-generated path fields
  autoGenerated?: boolean;
  distance?: number;  // meters (cached)
  time?: number;      // seconds (cached)
  /** Original User-Klicks (Stützpunkte). Wenn vorhanden, wird beim Recompute
   * zwischen jedem Stützpunkt-Paar A* neu berechnet, statt nur startObj→endObj.
   * Lastenheft 3.1.4.2: Wege haben Start, Wegpunkte, Endpunkt. */
  stuetzpunkte?: Waypoint[];
}

export interface PathArea {
  id: number;
  name: string;
  // Support both polygon (points) and rectangle (x,y,width,height)
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
}

// ==================== GANGS ====================
export interface Gang {
  id: number;
  name: string;
  points: { x: number; y: number }[];
  breite: number;
  typ: 'hauptgang' | 'quergang' | 'regalgang';
  istHauptgang?: boolean;
  farbe?: string;
  /** Wenn gesetzt: dieser Gang wurde automatisch aus der pathArea mit dieser ID
   * abgeleitet (Lastenheft 3.1.4.2 "orientiert an Mitte des Wegs"). Wird beim
   * Bearbeiten/Löschen der pathArea synchron mit aktualisiert. */
  autoFromPathAreaId?: number;
}

// ==================== FFZ ====================
export type FFZType = 'gabelstapler' | 'schnelllaeufer' | 'langgabel' | 'ameise' | 'schlepper' | 'agv' | 'handhubwagen' | 'kommissionierer';

export interface FFZ {
  id: number;
  name: string;
  type: FFZType;
  mindestBreite: number;
  geschwindigkeit: number; // m/s (ACHTUNG: m/s nicht km/h!)
  aufnahmeZeit: number; // seconds
  abgabeZeit: number; // seconds
  colliProBewegung: number; // Colli pro Fahrt/Bewegung (z.B. 1.4 für Schnelläufer, 1.2 für Stapler)
  anteil: number; // Anteil am Gesamtprozess (0-1, z.B. 0.8 = 80%)
  maxHubhoehe?: number;
  tragkraft?: number;
}

// ==================== CONVEYORS ====================
export interface Conveyor {
  id: number;
  name: string;
  points: { x: number; y: number; objectId?: number | null; isWaypoint?: boolean }[];
  speed: number; // m/s
  capacity: number; // pallets/hour
}

// ==================== PROJECT ====================
export interface ProjektVergleich {
  vorher: ProjektSnapshot | null;
  nachher: ProjektSnapshot | null;
  vorherScreenshot: string | null;
  nachherScreenshot: string | null;
}

export interface ProjektSnapshot {
  halls: Hall[];
  objects: TopisObject[];
  paths: Path[];
  pathAreas: PathArea[];
  gaenge: Gang[];
  ffz: FFZ[];
  conveyors: Conveyor[];
  avgDistanz: number;
  prozesszeit: number;
  timestamp: string;
}

// ==================== STATE ====================
export type Tool =
  | 'select'
  | 'pan'
  | 'tor'
  | 'tor-pinsel'         // Tor-Reihe: an der Wand ziehen → mehrere Tore auf einmal
  | 'stellplatz'
  | 'bereich'
  | 'regal'
  | 'hindernis'
  | 'rampe'
  | 'leveller'
  | 'pfosten'
  | 'treppe'
  | 'ladestation'
  | 'gefahrgut'
  | 'sperrplatz'
  | 'klaerplatz'
  | 'buero'
  | 'sozialraum'
  | 'wc'
  | 'wand'
  | 'tuer'
  | 'entladebereich'
  | 'outdoor_area'
  | 'outdoor_road'
  | 'trailer_spot'
  | 'parking'
  | 'custom'
  | 'path'
  | 'pathArea'
  | 'gang'
  | 'conveyor'
  | 'measure'
  | 'auftrag'
  // Lastenheft-Aufholplan 2026-05-31 — neue Tool-Buttons
  | 'kommissionierflaeche'
  | 'wertverschlag'
  | 'hallenterminal'
  | 'av_platz'
  | 'uz_platz'
  | 'palettenlager'
  | 'sattelplatz'
  | 'wechselbrueckenplatz'
  | 'kette'              // 3.1.5 — Unterflurförderkette zeichnen
  | 'aussengelaende'     // 3.1.6 — Außengelände-Polygon
  | 'format-uebertragen'; // 3.1.1.2 — Format Übertragen

/**
 * Simulierter Auftrag — wird per Klick im Canvas angelegt (Tor 1 → Tor 2 → Colli).
 * Geht in die Auftrags-Tabelle als zusätzliche SOLL-Zeile ein, wird mit
 * den durchschnittlichen Min/Colli des Prozessmodells × FFZ-Wegzeit
 * gerechnet und liefert Kosten = Std × Stundensatz.
 */
export interface SimAuftrag {
  id: string;
  vonObjectId: number;
  nachObjectId: number;
  colli: number;
  /** Optional: pro Auftrag überschriebene Min/Colli (sonst Standard) */
  minProColliOverride?: number;
  notiz?: string;
  /**
   * Wenn gesetzt: dieser Auftrag ist eine SIM-Variante eines anderen
   * Auftrags (parentId). IST = Original-Plan, SIM = was-wäre-wenn.
   * IST-Auftrag mit aktiver SIM bleibt sichtbar, aber rechnet nicht in
   * die SIM-Summe ein (statt dessen nimmt die SIM seinen Platz).
   */
  parentId?: string;
}

export interface TopisState {
  // Halls
  halls: Hall[];
  activeHallId: number;
  hall: {
    width: number;
    height: number;
    shape: string;
    walls: Wall[];
  };

  // Objects
  objects: TopisObject[];
  objectIdCounter: number;
  selectedObject: TopisObject | null;

  // Paths
  paths: Path[];
  pathIdCounter: number;
  selectedPath: Path | null;
  currentPath: Path | null;

  // Path Areas
  pathAreas: PathArea[];
  pathAreaIdCounter: number;

  // Mittlerer-Weg-Runs (Lastenheft 3.2.4)
  mittlereWegRuns: MittlererWegRun[];
  mittlererWegRunIdCounter: number;

  // Gangs
  gaenge: Gang[];
  showGaenge: boolean;
  selectedGang: Gang | null;

  // FFZ
  ffz: FFZ[];

  // PathAreas
  selectedPathArea: PathArea | null;

  // Conveyors
  conveyors: Conveyor[];
  conveyorIdCounter: number;
  selectedConveyor: Conveyor | null;
  currentConveyor: Conveyor | null;

  // View
  zoom: number;
  pan: { x: number; y: number };
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;

  // Tools
  currentTool: Tool;
  filterType: string;
  // KI-Textbuilder (nicht persistiert): Ghost-Vorschau + Panel-Zustand.
  nlGhost: { hall: { width: number; height: number; name: string }; objects: Omit<TopisObject, 'id'>[] } | null;
  nlBuilderOpen: boolean;

  // Project
  projektVergleich: ProjektVergleich;

  // Cockpit-Route: zwei Objekt-IDs, deren A*-Pfad live im Canvas gezeichnet wird
  cockpitRoute: { startId: number; endId: number } | null;

  /** Simulierte Aufträge — vom Berater per Klick im Canvas angelegt */
  simAuftraege: SimAuftrag[];
  /** Pendender Auftrag (1. Tor schon geklickt, 2. noch nicht) */
  simAuftragPending: { vonObjectId: number } | null;
  /** Aktuell fokussiertes Tor — nur dessen Wege werden gezeichnet (sonst nur Marker) */
  focusedTorId: number | null;
  /** Wenn true: alle Wege gleichzeitig anzeigen (Übersichts-Modus) */
  showAllSimRoutes: boolean;
  /** Aktive Stapler-Animation: welche Sim-Auftrags-ID läuft gerade ab, oder null */
  animationActiveId: string | null;

  // ===== Lastenheft-Aufholplan 2026-05-31 =====
  // 3.2.1 — Mengen-Modell
  prozesskategorien: Prozesskategorie[];
  prozesskategorieIdCounter: number;
  mengenEintraege: MengenEintrag[];
  mengenEintragIdCounter: number;
  // 3.1.5 — Unterflurförderkette
  kettenWegbereiche: KettenWegbereich[];
  kettenWegbereichIdCounter: number;
  selectedKette: KettenWegbereich | null;
  // 3.2.5 — Bereichseinteilung (Auswertungs-Gruppen aus Toren + Stellplätzen)
  bereichsEinteilungen: BereichsEinteilung[];
  bereichsEinteilungIdCounter: number;
  // 3.1.6 — Außengelände
  aussengelaende: Aussengelaende[];
  aussengelaendeIdCounter: number;
  // 3.1.1.2 — Format Übertragen: zuletzt kopierte Eigenschaften
  formatClipboard: {
    sourceObjectId: number;
    propertyNames: string[]; // welche Properties beim nächsten Klick übertragen
  } | null;
  // 3.1.7 — Anzeige-Modus
  ansichtsModus: 'bildschirm' | 'druck';

  // Lastenheft Kapitel 4 — Verlader
  verlader: Verlader[];
  verladerIdCounter: number;
  selectedVerlader: Verlader | null;
}

// ==================== CONSTANTS ====================
export const SCALE = 10; // pixels per meter

export const DEFAULT_HALL: Hall = {
  id: 1,
  shape: 'rect',
  width: 100,
  height: 50,
  name: 'Neue Halle',
  walls: [],
  offsetX: 0,
  offsetY: 0,
  color: '#26262a'
};

// Object colors matching NTC theme
export const OBJECT_COLORS: Record<ObjectType, string> = {
  tor: '#3b82f6',           // Blue
  stellplatz: '#22c55e',    // Green
  bereich: '#a855f7',       // Purple
  regal: '#f59e0b',         // Amber
  hindernis: '#6b7280',     // Gray
  rampe: '#f97316',         // Orange
  leveller: '#ea580c',      // Dark Orange
  pfosten: '#94a3b8',       // Slate
  treppe: '#a16207',        // Brown
  ladestation: '#10b981',   // Emerald
  gefahrgut: '#ef4444',     // Red
  sperrplatz: '#dc2626',    // Dark Red
  klaerplatz: '#eab308',    // Yellow
  buero: '#6366f1',         // Indigo
  sozialraum: '#8b5cf6',    // Violet
  wc: '#06b6d4',            // Cyan
  wand: '#777777',          // Gray
  tuer: '#55aaaa',          // Teal
  entladebereich: '#4ade80', // Light Green
  outdoor_area: '#2d5a1d',  // Dark Green
  outdoor_road: '#4a4a4a',  // Dark Gray
  trailer_spot: '#664422',  // Brown
  parking: '#336699',       // Blue-Gray
  custom: '#7799aa',        // Custom Gray-Blue
  // Lastenheft-Aufholplan 2026-05-31
  kommissionierflaeche: '#84cc16', // Lime
  wertverschlag: '#a3a3a3',        // Gray
  hallenterminal: '#0ea5e9',       // Sky
  av_platz: '#fca5a5',             // Light Red (AV = Annahmeverweigerung)
  uz_platz: '#fde047',             // Light Yellow (ÜZ = Überzähligkeit)
  palettenlager: '#c2410c',        // Dark Orange
  sattelplatz: '#7c3aed',          // Violet
  wechselbrueckenplatz: '#92400e', // Brown
};

// Default sizes for each object type (in meters)
export const OBJECT_DEFAULTS: Record<ObjectType, { width: number; height: number; name: string }> = {
  tor: { width: 3.5, height: 1.5, name: 'Tor' },
  stellplatz: { width: 12, height: 5, name: 'Stellplatz' },
  bereich: { width: 15, height: 10, name: 'Bereich' },
  regal: { width: 10, height: 1.2, name: 'Regal' },
  hindernis: { width: 2, height: 2, name: 'Hindernis' },
  rampe: { width: 4, height: 8, name: 'Rampe' },
  leveller: { width: 2, height: 2.5, name: 'Leveller' },
  pfosten: { width: 0.5, height: 0.5, name: 'Pfosten' },
  treppe: { width: 3, height: 4, name: 'Treppe' },
  ladestation: { width: 2, height: 2, name: 'Ladestation' },
  gefahrgut: { width: 6, height: 4, name: 'Gefahrgut' },
  sperrplatz: { width: 8, height: 4, name: 'Sperrplatz' },
  klaerplatz: { width: 8, height: 4, name: 'Klärplatz' },
  buero: { width: 6, height: 5, name: 'Büro' },
  sozialraum: { width: 8, height: 6, name: 'Sozialraum' },
  wc: { width: 3, height: 4, name: 'WC' },
  wand: { width: 6, height: 0.3, name: 'Wand' },
  tuer: { width: 1.2, height: 0.3, name: 'Tür' },
  entladebereich: { width: 8, height: 6, name: 'Entladebereich' },
  outdoor_area: { width: 30, height: 20, name: 'Außenbereich' },
  outdoor_road: { width: 20, height: 4, name: 'Straße' },
  trailer_spot: { width: 15, height: 3, name: 'Wechselbrücke' },
  parking: { width: 5, height: 5, name: 'Parkplatz' },
  custom: { width: 4, height: 4, name: 'Objekt' },
  // Lastenheft-Aufholplan 2026-05-31
  kommissionierflaeche: { width: 10, height: 6, name: 'Kommissionierfläche' },
  wertverschlag: { width: 4, height: 3, name: 'Wertverschlag' },
  hallenterminal: { width: 2, height: 1.5, name: 'Hallenterminal' },
  av_platz: { width: 6, height: 3, name: 'AV-Platz' },
  uz_platz: { width: 6, height: 3, name: 'ÜZ-Platz' },
  palettenlager: { width: 10, height: 4, name: 'Palettenlager' },
  sattelplatz: { width: 16, height: 4, name: 'Sattelplatz' },
  wechselbrueckenplatz: { width: 8, height: 3, name: 'Wechselbrückenplatz' },
};

// German labels for object types
export const OBJECT_LABELS: Record<ObjectType, string> = {
  tor: 'Tor',
  stellplatz: 'Stellplatz',
  bereich: 'Bereich',
  regal: 'Regal',
  hindernis: 'Hindernis',
  rampe: 'Rampe',
  leveller: 'Leveller',
  pfosten: 'Pfosten',
  treppe: 'Treppe',
  ladestation: 'Ladestation',
  gefahrgut: 'Gefahrgut',
  sperrplatz: 'Sperrplatz',
  klaerplatz: 'Klärplatz',
  buero: 'Büro',
  sozialraum: 'Sozialraum',
  wc: 'WC',
  wand: 'Wand',
  tuer: 'Tür',
  entladebereich: 'Entladebereich',
  outdoor_area: 'Außenbereich',
  outdoor_road: 'Straße',
  trailer_spot: 'Wechselbrücke',
  parking: 'Parkplatz',
  custom: 'Benutzerdefiniert',
  // Lastenheft-Aufholplan 2026-05-31
  kommissionierflaeche: 'Kommissionierfläche',
  wertverschlag: 'Wertverschlag',
  hallenterminal: 'Hallenterminal',
  av_platz: 'AV-Platz',
  uz_platz: 'ÜZ-Platz',
  palettenlager: 'Palettenlager',
  sattelplatz: 'Sattelplatz',
  wechselbrueckenplatz: 'Wechselbrückenplatz',
};

// ==================== VERLADER (Lastenheft Kapitel 4) ====================
/** Ein Verlader bedient Tore und Stellplätze — typischerweise ein Mitarbeiter
 *  oder ein Team an einer Verladestelle. Hat optional eine Schicht-Zuordnung,
 *  ein bevorzugtes FFZ, eine Liste bedienter Tore/Stellplätze und eine
 *  Stunden-Kapazität (Colli/h) für Auslastungs- und Bedarfsrechnung. */
export type VerladerSchicht = 'frueh' | 'spaet' | 'nacht' | 'tag';

export interface Verlader {
  id: number;
  name: string;
  schicht?: VerladerSchicht;
  ffzId?: number;                  // Bevorzugtes FFZ
  bedientToreIds: number[];        // Welche Tore bedient er
  bedientStellplatzIds: number[];
  kapazitaetProStunde?: number;    // Colli/h
  notiz?: string;
}

// FFZ defaults
export const DEFAULT_FFZ: FFZ[] = [
  { id: 1, name: 'Gabelstapler', type: 'gabelstapler', mindestBreite: 3.5, geschwindigkeit: 12, aufnahmeZeit: 15, abgabeZeit: 12, colliProBewegung: 1.2, anteil: 0, maxHubhoehe: 6, tragkraft: 2500 },
  { id: 2, name: 'Schnelläufer', type: 'schnelllaeufer', mindestBreite: 2.0, geschwindigkeit: 8.8, aufnahmeZeit: 8, abgabeZeit: 8, colliProBewegung: 1.4, anteil: 0, maxHubhoehe: 0.3, tragkraft: 500 },
  { id: 3, name: 'Langgabel', type: 'langgabel', mindestBreite: 2.5, geschwindigkeit: 8, aufnahmeZeit: 12, abgabeZeit: 10, colliProBewegung: 1.0, anteil: 0, tragkraft: 1500 },
  { id: 4, name: 'Ameise', type: 'ameise', mindestBreite: 2.5, geschwindigkeit: 6, aufnahmeZeit: 20, abgabeZeit: 15, colliProBewegung: 1.0, anteil: 0, maxHubhoehe: 0.2, tragkraft: 2000 },
  { id: 5, name: 'Schlepper', type: 'schlepper', mindestBreite: 2.0, geschwindigkeit: 15, aufnahmeZeit: 10, abgabeZeit: 10, colliProBewegung: 5.0, anteil: 0, tragkraft: 5000 },
  { id: 6, name: 'AGV', type: 'agv', mindestBreite: 2.0, geschwindigkeit: 5, aufnahmeZeit: 25, abgabeZeit: 25, colliProBewegung: 1.0, anteil: 0, tragkraft: 1500 },
  { id: 7, name: 'Handhubwagen', type: 'handhubwagen', mindestBreite: 1.8, geschwindigkeit: 4, aufnahmeZeit: 30, abgabeZeit: 25, colliProBewegung: 1.0, anteil: 0, maxHubhoehe: 0.2, tragkraft: 2500 },
  { id: 8, name: 'Kommissionierer', type: 'kommissionierer', mindestBreite: 2.2, geschwindigkeit: 8, aufnahmeZeit: 12, abgabeZeit: 10, colliProBewegung: 2.0, anteil: 0, maxHubhoehe: 3, tragkraft: 1000 },
];
