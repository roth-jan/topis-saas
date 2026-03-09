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
  | 'custom';

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
  // Tor-Kalkulation (Papa's Anforderungen)
  palettenProTag?: number;        // Anzahl Paletten pro Tag
  entladeZeitSek?: number;        // Zeit pro Palette beim Entladen (Sekunden)
  beladeZeitSek?: number;         // Zeit pro Palette beim Beladen (Sekunden)
  istEingang?: boolean;           // Wareneingang
  istAusgang?: boolean;           // Warenausgang
  zielObjektId?: number;          // Ziel-Stellplatz/Regal für Berechnung
}

// ==================== PATHS ====================
export interface Waypoint {
  x: number;
  y: number;
  objectId: number | null;
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
}

// ==================== FFZ ====================
export type FFZType = 'gabelstapler' | 'ameise' | 'schlepper' | 'agv' | 'handhubwagen' | 'kommissionierer';

export interface FFZ {
  id: number;
  name: string;
  type: FFZType;
  mindestBreite: number;
  geschwindigkeit: number; // km/h
  aufnahmeZeit: number; // seconds
  abgabeZeit: number; // seconds
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
  | 'measure';

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

  // Gangs
  gaenge: Gang[];
  showGaenge: boolean;

  // FFZ
  ffz: FFZ[];

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

  // Project
  projektVergleich: ProjektVergleich;
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
  color: '#16213e'
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
};

// FFZ defaults
export const DEFAULT_FFZ: FFZ[] = [
  { id: 1, name: 'Gabelstapler', type: 'gabelstapler', mindestBreite: 3.5, geschwindigkeit: 12, aufnahmeZeit: 15, abgabeZeit: 12, maxHubhoehe: 6, tragkraft: 2500 },
  { id: 2, name: 'Ameise', type: 'ameise', mindestBreite: 2.5, geschwindigkeit: 6, aufnahmeZeit: 20, abgabeZeit: 15, maxHubhoehe: 0.2, tragkraft: 2000 },
  { id: 3, name: 'Schlepper', type: 'schlepper', mindestBreite: 2.0, geschwindigkeit: 15, aufnahmeZeit: 10, abgabeZeit: 10, tragkraft: 5000 },
  { id: 4, name: 'AGV', type: 'agv', mindestBreite: 2.0, geschwindigkeit: 5, aufnahmeZeit: 25, abgabeZeit: 25, tragkraft: 1500 },
  { id: 5, name: 'Handhubwagen', type: 'handhubwagen', mindestBreite: 1.8, geschwindigkeit: 4, aufnahmeZeit: 30, abgabeZeit: 25, maxHubhoehe: 0.2, tragkraft: 2500 },
  { id: 6, name: 'Kommissionierer', type: 'kommissionierer', mindestBreite: 2.2, geschwindigkeit: 8, aufnahmeZeit: 12, abgabeZeit: 10, maxHubhoehe: 3, tragkraft: 1000 },
];
