/**
 * Dummy-Test-Halle für Pfad-Werkzeug-Tests.
 *
 * 40×20m. 8 Tore (4 Nord + 4 Süd). 4 Bereiche. 1 Brandschutzwand mit Tür in der Mitte.
 * 9 Gänge (1 Hauptgang horizontal + 8 Quergänge). 9 pathAreas.
 *
 * Test-Szenarien:
 * 1. Bug A — Klick auf Brandschutzwand (x=20, y=4..18) darf nicht als Pfad-Anker zählen.
 * 2. Bug B — 3 Klicks im Hauptgang + Enter → 3 Waypoints, kein Doppelklick-Race.
 * 3. Bug C — Klick außerhalb pathAreas wird abgelehnt (Toast).
 * 4. Türen-Durchlass — Pfad durch (20, 10) (=Tür) geht, sonst Wand blockiert.
 * 5. Auto-Wegberechnung — 8 Tore × 4 Bereiche = 32 Pfade über das Gang-Netz.
 */
import type { ProjektVorlage } from '@/types/projekt';
import type { TopisObject, Gang, PathArea } from '@/types/topis';
import layoutJson from '@/data/layouts/dummy-test.json';

export const DUMMY_TEST: ProjektVorlage = {
  id: 'dummy_test',
  name: 'Dummy Test-Halle',
  standort: 'intern (Pfad-Test)',
  jahr: 2026,
  beschreibung: '40×20m, 8 Tore, 4 Bereiche, Brandschutzwand mit Tür — minimal für Pfad-Werkzeug-Tests',
  hall: {
    width: layoutJson.hall.width,
    height: layoutJson.hall.height,
    name: layoutJson.hall.name,
    color: layoutJson.hall.color,
  },
  objects: layoutJson.objects as unknown as Omit<TopisObject, 'id'>[],
  gaenge: layoutJson.gaenge as unknown as Gang[],
  pathAreas: layoutJson.pathAreas as unknown as Omit<PathArea, 'id'>[],
  prozessmodell: 'se_standard',
  parameterOverrides: {
    colliProTag: 1000,
  },
};
