import { TopisObject, Hall, Gang, OBJECT_DEFAULTS, OBJECT_COLORS } from '@/types/topis';

// Showcase step definition
export interface ShowcaseStep {
  id: number;
  name: string;
  description: string;
  duration: number; // ms
  action: () => void;
}

// Demo scenario objects
export interface DemoScenario {
  name: string;
  description: string;
  hall: Partial<Hall>;
  objects: Omit<TopisObject, 'id'>[];
  gaenge: Gang[];
}

// Generate demo objects for standard hall scenario
export function generateStandardDemoObjects(): Omit<TopisObject, 'id'>[] {
  const objects: Omit<TopisObject, 'id'>[] = [];

  // Tore an der Nordseite
  for (let i = 0; i < 4; i++) {
    objects.push({
      type: 'tor',
      x: 15 + i * 20,
      y: 0,
      width: OBJECT_DEFAULTS.tor.width,
      height: OBJECT_DEFAULTS.tor.height,
      name: `Tor ${i + 1}`,
      color: OBJECT_COLORS.tor,
    });
  }

  // Stellplätze in der Mitte
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 5; col++) {
      objects.push({
        type: 'stellplatz',
        x: 10 + col * 18,
        y: 8 + row * 8,
        width: OBJECT_DEFAULTS.stellplatz.width,
        height: OBJECT_DEFAULTS.stellplatz.height,
        name: `SP ${row * 5 + col + 1}`,
        color: OBJECT_COLORS.stellplatz,
      });
    }
  }

  // Regale
  for (let i = 0; i < 3; i++) {
    objects.push({
      type: 'regal',
      x: 10 + i * 30,
      y: 30,
      width: OBJECT_DEFAULTS.regal.width,
      height: OBJECT_DEFAULTS.regal.height,
      name: `Regal ${i + 1}`,
      color: OBJECT_COLORS.regal,
      ebenen: 4,
    });
  }

  // Bereiche
  objects.push({
    type: 'bereich',
    x: 5,
    y: 35,
    width: 20,
    height: 12,
    name: 'Wareneingang',
    color: OBJECT_COLORS.bereich,
  });

  objects.push({
    type: 'bereich',
    x: 75,
    y: 35,
    width: 20,
    height: 12,
    name: 'Warenausgang',
    color: OBJECT_COLORS.bereich,
  });

  // Büro
  objects.push({
    type: 'buero',
    x: 90,
    y: 3,
    width: OBJECT_DEFAULTS.buero.width,
    height: OBJECT_DEFAULTS.buero.height,
    name: 'Büro',
    color: OBJECT_COLORS.buero,
  });

  // Sozialraum und WC
  objects.push({
    type: 'sozialraum',
    x: 90,
    y: 10,
    width: OBJECT_DEFAULTS.sozialraum.width,
    height: OBJECT_DEFAULTS.sozialraum.height,
    name: 'Sozialraum',
    color: OBJECT_COLORS.sozialraum,
  });

  objects.push({
    type: 'wc',
    x: 90,
    y: 18,
    width: OBJECT_DEFAULTS.wc.width,
    height: OBJECT_DEFAULTS.wc.height,
    name: 'WC',
    color: OBJECT_COLORS.wc,
  });

  // Ladestation
  objects.push({
    type: 'ladestation',
    x: 5,
    y: 20,
    width: OBJECT_DEFAULTS.ladestation.width,
    height: OBJECT_DEFAULTS.ladestation.height,
    name: 'Ladestation',
    color: OBJECT_COLORS.ladestation,
  });

  return objects;
}

// Papa's test hall based on PDF sketch
// Layout nach Zeichnung vom 30.01.2026
export function generatePapaHalleObjects(): Omit<TopisObject, 'id'>[] {
  const objects: Omit<TopisObject, 'id'>[] = [];

  // ============ TORE LINKS OBEN (Eingang) - Tor 7, 8, 9, 10 ============
  objects.push({
    type: 'tor',
    x: 0,
    y: 5,
    width: 1.5,
    height: 3.5,
    name: 'Tor 10',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 40,
    entladeZeitSek: 30,
  });

  objects.push({
    type: 'tor',
    x: 0,
    y: 12,
    width: 1.5,
    height: 3.5,
    name: 'Tor 9',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 35,
    entladeZeitSek: 30,
  });

  objects.push({
    type: 'tor',
    x: 0,
    y: 19,
    width: 1.5,
    height: 3.5,
    name: 'Tor 8',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 30,
    entladeZeitSek: 30,
  });

  objects.push({
    type: 'tor',
    x: 0,
    y: 26,
    width: 1.5,
    height: 3.5,
    name: 'Tor 7',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 45,
    entladeZeitSek: 30,
  });

  // ============ TORE LINKS UNTEN (Eingang) - Tor 1, 2, 3, 6 ============
  objects.push({
    type: 'tor',
    x: 0,
    y: 35,
    width: 1.5,
    height: 3.5,
    name: 'Tor 1',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 50,
    entladeZeitSek: 30,
  });

  objects.push({
    type: 'tor',
    x: 0,
    y: 42,
    width: 1.5,
    height: 3.5,
    name: 'Tor 2',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 50,
    entladeZeitSek: 30,
  });

  objects.push({
    type: 'tor',
    x: 0,
    y: 49,
    width: 1.5,
    height: 3.5,
    name: 'Tor 3',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 50,
    entladeZeitSek: 30,
  });

  objects.push({
    type: 'tor',
    x: 0,
    y: 56,
    width: 1.5,
    height: 3.5,
    name: 'Tor 6',
    color: OBJECT_COLORS.tor,
    istEingang: true,
    palettenProTag: 40,
    entladeZeitSek: 30,
  });

  // ============ TORE RECHTS (Ausgang) ============
  objects.push({
    type: 'tor',
    x: 98.5,
    y: 15,
    width: 1.5,
    height: 3.5,
    name: 'Tor Aus 1',
    color: OBJECT_COLORS.tor,
    istAusgang: true,
    palettenProTag: 60,
    beladeZeitSek: 25,
  });

  objects.push({
    type: 'tor',
    x: 98.5,
    y: 25,
    width: 1.5,
    height: 3.5,
    name: 'Tor Aus 2',
    color: OBJECT_COLORS.tor,
    istAusgang: true,
    palettenProTag: 60,
    beladeZeitSek: 25,
  });

  // ============ NAH VARIABEL - Stellplätze nahe Toren ============
  for (let i = 0; i < 4; i++) {
    objects.push({
      type: 'stellplatz',
      x: 5,
      y: 5 + i * 8,
      width: 10,
      height: 5,
      name: `Nah ${i + 1}`,
      color: OBJECT_COLORS.stellplatz,
    });
  }

  // ============ BEREICHE 1, 2, 3, 4 (Mitte) ============
  // Bereich 1 - oben rechts
  objects.push({
    type: 'bereich',
    x: 55,
    y: 5,
    width: 18,
    height: 14,
    name: 'Bereich 1',
    color: '#3b5998',
  });

  // Bereich 2 - mitte rechts
  objects.push({
    type: 'bereich',
    x: 55,
    y: 22,
    width: 18,
    height: 14,
    name: 'Bereich 2',
    color: '#4a69bd',
  });

  // Bereich 3 - oben mitte
  objects.push({
    type: 'bereich',
    x: 32,
    y: 5,
    width: 18,
    height: 14,
    name: 'Bereich 3',
    color: '#6a89cc',
  });

  // Bereich 4 - mitte mitte
  objects.push({
    type: 'bereich',
    x: 32,
    y: 22,
    width: 18,
    height: 14,
    name: 'Bereich 4',
    color: '#82ccdd',
  });

  // ============ HOCHREGALLAGER (links unten) ============
  objects.push({
    type: 'bereich',
    x: 5,
    y: 45,
    width: 22,
    height: 20,
    name: 'Hochregal',
    color: '#2c3e50',
  });

  // Regalreihen im Hochregallager
  for (let i = 0; i < 4; i++) {
    objects.push({
      type: 'regal',
      x: 7,
      y: 48 + i * 4,
      width: 18,
      height: 1.2,
      name: `HR ${i + 1}`,
      color: OBJECT_COLORS.regal,
      ebenen: 6,
    });
  }

  // ============ KOMMISSIONIERUNG ============
  objects.push({
    type: 'bereich',
    x: 32,
    y: 45,
    width: 15,
    height: 10,
    name: 'Kommission.',
    color: '#8e44ad',
  });

  // ============ BLECHE 03 ============
  objects.push({
    type: 'bereich',
    x: 50,
    y: 45,
    width: 12,
    height: 10,
    name: 'Bleche 03',
    color: '#7f8c8d',
  });

  // ============ STANGEN ============
  objects.push({
    type: 'bereich',
    x: 65,
    y: 45,
    width: 10,
    height: 10,
    name: 'Stangen',
    color: '#95a5a6',
  });

  // ============ KRAN 06 GLEISE ============
  objects.push({
    type: 'bereich',
    x: 32,
    y: 58,
    width: 43,
    height: 6,
    name: 'Kran 06 Gleise',
    color: '#e74c3c',
  });

  // ============ ENTLADEBEREICHE hinter Eingangs-Toren ============
  objects.push({
    type: 'entladebereich',
    x: 18,
    y: 5,
    width: 10,
    height: 30,
    name: 'Entlade Ein',
    color: OBJECT_COLORS.entladebereich,
  });

  // ============ INFRASTRUKTUR ============
  objects.push({
    type: 'buero',
    x: 80,
    y: 5,
    width: 8,
    height: 6,
    name: 'Büro',
    color: OBJECT_COLORS.buero,
  });

  objects.push({
    type: 'ladestation',
    x: 80,
    y: 55,
    width: 4,
    height: 4,
    name: 'Ladestation',
    color: OBJECT_COLORS.ladestation,
  });

  return objects;
}

// Pre-defined demo scenarios
export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  papa: {
    name: "Papa's Testhalle",
    description: 'Umschlaghalle mit 10 Toren, Hochregal, Kommissionierung, Kran - nach Zeichnung.',
    hall: {
      width: 100,
      height: 68,
      name: 'Papa Halle',
      color: '#1a1a2e',
    },
    objects: generatePapaHalleObjects(),
    gaenge: [],
  },
  standard: {
    name: 'Standard-Umschlaghalle',
    description: 'Eine typische 100×50m Umschlaghalle mit Toren, Stellplätzen und Regalen.',
    hall: {
      width: 100,
      height: 50,
      name: 'Demo-Halle',
      color: '#16213e',
    },
    objects: generateStandardDemoObjects(),
    gaenge: [],
  },
  lager: {
    name: 'Lager mit Hochregalen',
    description: 'Ein Lager mit mehreren Regalreihen und optimierten Fahrgängen.',
    hall: {
      width: 80,
      height: 60,
      name: 'Lagerhalle',
      color: '#1a1a2e',
    },
    objects: [
      // Multiple regal rows
      ...Array.from({ length: 6 }, (_, i) => ({
        type: 'regal' as const,
        x: 10,
        y: 5 + i * 8,
        width: 60,
        height: 1.2,
        name: `Regalreihe ${i + 1}`,
        color: OBJECT_COLORS.regal,
        ebenen: 5,
      })),
      // Tore
      { type: 'tor' as const, x: 10, y: 0, width: 4, height: 1.5, name: 'Tor WE', color: OBJECT_COLORS.tor },
      { type: 'tor' as const, x: 66, y: 0, width: 4, height: 1.5, name: 'Tor WA', color: OBJECT_COLORS.tor },
      // Bereiche
      { type: 'bereich' as const, x: 5, y: 52, width: 15, height: 6, name: 'Wareneingang', color: OBJECT_COLORS.bereich },
      { type: 'bereich' as const, x: 60, y: 52, width: 15, height: 6, name: 'Warenausgang', color: OBJECT_COLORS.bereich },
    ],
    gaenge: [],
  },
  umschlag: {
    name: 'Cross-Docking Terminal',
    description: 'Ein Umschlagterminal für schnellen Warendurchsatz.',
    hall: {
      width: 150,
      height: 50,
      name: 'Cross-Dock',
      color: '#0f172a',
    },
    objects: [
      // Tore Nordseite (Wareneingang)
      ...Array.from({ length: 8 }, (_, i) => ({
        type: 'tor' as const,
        x: 10 + i * 17,
        y: 0,
        width: 3.5,
        height: 1.5,
        name: `WE ${i + 1}`,
        color: OBJECT_COLORS.tor,
      })),
      // Tore Südseite (Warenausgang)
      ...Array.from({ length: 8 }, (_, i) => ({
        type: 'tor' as const,
        x: 10 + i * 17,
        y: 48.5,
        width: 3.5,
        height: 1.5,
        name: `WA ${i + 1}`,
        color: OBJECT_COLORS.tor,
      })),
      // Mittige Sortierfläche
      { type: 'bereich' as const, x: 30, y: 18, width: 90, height: 14, name: 'Sortierfläche', color: OBJECT_COLORS.bereich },
      // Büro
      { type: 'buero' as const, x: 5, y: 20, width: 8, height: 10, name: 'Disposition', color: OBJECT_COLORS.buero },
    ],
    gaenge: [],
  },
};

// Showcase animation state
export interface ShowcaseState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  scenario: string;
}

export const createInitialShowcaseState = (): ShowcaseState => ({
  isRunning: false,
  currentStep: 0,
  totalSteps: 5,
  scenario: 'standard',
});
