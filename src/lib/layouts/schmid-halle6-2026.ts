import { useTopisStore } from '@/lib/store';
import { TopisObject, Gang, PathArea } from '@/types/topis';
import { connectGangsToBounds, generateTorAnbindungsGaenge } from '@/lib/pathfinding';
type PathAreaInit = Omit<PathArea, 'id'>;
import type { ProjektVorlage } from '@/types/projekt';
import layoutJson from '@/data/layouts/schmid-halle6-2026.json';

/**
 * Andreas Schmid Gersthofen - Halle 6 mit Anbau 2026
 *
 * Quelle: Hallenplan_2026.xlsx (Tim Winkler / Michael Laufenburg, 12.05.2026)
 * Halle: 198,1m × 58m, 115 Tore (Süd 1-52, Nord 61-115)
 */
function enrichObject(obj: Record<string, unknown>): Omit<TopisObject, 'id'> {
  // CSV-Demo-Daten haben messpunkt=MP{torNummer}. Damit der Import die Tore
  // findet, brauchen sie tags=['messpunkt'] + meta.code='MP{nr}'.
  if (obj.type === 'tor' && typeof obj.torNummer === 'number') {
    const existingTags = Array.isArray(obj.tags) ? (obj.tags as string[]) : [];
    const tags = existingTags.includes('messpunkt') ? existingTags : [...existingTags, 'messpunkt'];
    const existingMeta = (obj.meta && typeof obj.meta === 'object') ? obj.meta as Record<string, unknown> : {};
    const meta = { ...existingMeta, code: existingMeta.code ?? `MP${obj.torNummer}` };
    return { ...obj, tags, meta } as unknown as Omit<TopisObject, 'id'>;
  }
  return obj as unknown as Omit<TopisObject, 'id'>;
}

export function loadSchmidHalle6_2026() {
  const { resetState, updateHall, addObject, setGaenge } = useTopisStore.getState();

  resetState();
  updateHall(1, {
    width: layoutJson.hall.width,
    height: layoutJson.hall.height,
    name: layoutJson.hall.name,
    color: layoutJson.hall.color,
  });

  for (const obj of layoutJson.objects) {
    addObject(enrichObject(obj as Record<string, unknown>));
  }

  // Gang-Topologie reparieren: Tor-Anbindungs-Gänge erzeugen + V-Gänge bis dahin
  // verlängern. Sonst sind Nord- und Süd-Tor-Reihen nicht über die Topologie
  // erreichbar und A* fällt auf Luftlinie zurück.
  const baseGaenge = layoutJson.gaenge as unknown as Gang[];
  const maxGangId = baseGaenge.reduce((m, g) => Math.max(m, (g as Gang).id ?? 0), 0);
  const tore = (layoutJson.objects as unknown as TopisObject[]).filter((o) => o.type === 'tor');
  const anbindungen = generateTorAnbindungsGaenge(tore, layoutJson.hall.width, layoutJson.hall.height, maxGangId + 1);
  const mitAnbindung = [...baseGaenge, ...anbindungen];
  const verbundeneGaenge = connectGangsToBounds(
    mitAnbindung,
    0,
    layoutJson.hall.height,
    0,
    layoutJson.hall.width,
  );
  setGaenge(verbundeneGaenge);

  // pathAreas (Wegflächen) direkt ins Array — der Store hat nur addPathArea (einzeln).
  const rawAreas = (layoutJson as unknown as { pathAreas?: unknown[] }).pathAreas ?? [];
  if (rawAreas.length > 0) {
    const counter = useTopisStore.getState().pathAreaIdCounter;
    const areas: PathArea[] = rawAreas.map((a, i) => ({ ...(a as object), id: counter + i } as PathArea));
    useTopisStore.setState({
      pathAreas: areas,
      pathAreaIdCounter: counter + areas.length,
    });
  }
}

export const HALLE6_2026_META = layoutJson.meta;

/**
 * Andreas Schmid Halle 6 mit Anbau 2026 als ProjektVorlage.
 */
export const PROJEKT_GERSTHOFEN_2026: ProjektVorlage = {
  id: 'as_gersthofen_2026',
  name: 'Andreas Schmid',
  standort: 'Gersthofen (Halle 6 + Anbau 2026)',
  jahr: 2026,
  beschreibung: '115 Tore (Süd 1-52, Nord 61-115), 198,1×58m, Anbau +3.600 m²',
  hall: {
    width: layoutJson.hall.width,
    height: layoutJson.hall.height,
    name: layoutJson.hall.name,
    color: layoutJson.hall.color,
  },
  objects: (layoutJson.objects as unknown as Record<string, unknown>[]).map(enrichObject),
  gaenge: (() => {
    const base = layoutJson.gaenge as unknown as Gang[];
    const maxId = base.reduce((m, g) => Math.max(m, (g as Gang).id ?? 0), 0);
    const tore = (layoutJson.objects as unknown as TopisObject[]).filter((o) => o.type === 'tor');
    const anbindungen = generateTorAnbindungsGaenge(tore, layoutJson.hall.width, layoutJson.hall.height, maxId + 1);
    return connectGangsToBounds([...base, ...anbindungen], 0, layoutJson.hall.height, 0, layoutJson.hall.width);
  })(),
  pathAreas: ((layoutJson as unknown as { pathAreas?: unknown[] }).pathAreas ?? []) as PathAreaInit[],
  prozessmodell: 'se_standard',
  parameterOverrides: {
    colliProTag: 3970,  // Tim Winkler 19.05.2026: real Ø Nov 2025 - Feb 2026
    verteilweg: 176,    // Roth Abschluss-PPT 22.05.2026 Folie 27: heutiger Ø Fahrweg
                        // in Halle 6 (mit Anbau) = 176 m. 2020 war 132 m, durch
                        // Anbau gestiegen.
    schnellaeuferGeschwindigkeit: 2.44,
    colliProFahrt: 3.39,
    arbeitsminProStunde: 52.9,
    staplerGeschwindigkeit: 2.86,
  },
  referenz: {
    minProColli: 1.917,
    colliProMAStd: 27.6,
    fte: 55,
    quelle: 'ROTH Prozessmodell 2019 (kalibriert), Hallenplan 2026 Tim Winkler / Michael Laufenburg',
  },
};
