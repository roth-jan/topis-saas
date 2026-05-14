import { useTopisStore } from '@/lib/store';
import { TopisObject, Gang } from '@/types/topis';
import type { ProjektVorlage } from '@/types/projekt';
import layoutJson from '@/data/layouts/schmid-halle6-2026.json';

/**
 * Andreas Schmid Gersthofen - Halle 6 mit Anbau 2026
 *
 * Quelle: Hallenplan_2026.xlsx (Tim Winkler / Michael Laufenburg, 12.05.2026)
 * Extrahiert aus SharePoint: Logistikberatung / Andreas Schmid 2026 / Prozessaufnahme
 *
 * Halle: 173.6m × 42m
 * Tore: 107 (Süd 1-52, Nord 61-115)
 * 9 Sektionen Nord (TU AS, TU Tiroch, TU DS, TU Alexandru, TU Guth, TU Tuncay,
 *                   TU Silaghi, TU Bogos, TU Yeritsan)
 * 13 Sektionen Süd (TU LT, TU Ciortan, Entladezone, TU Strauß, TU Fischer, VP,
 *                    Sonepar, Dehner, MAN/Everlance, Federal Mogul, Bohner,
 *                    Eisen Fischer, Segmüller)
 *
 * Layout-Daten als JSON in src/data/layouts/schmid-halle6-2026.json
 * → editierbar ohne Code-Change, kompatibel mit JSON-Import-Pfad
 */
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
    addObject(obj as unknown as Omit<TopisObject, 'id'>);
  }

  setGaenge(layoutJson.gaenge as unknown as Gang[]);
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
  beschreibung: '107 Tore (Süd 1-52, Nord 61-115), 173,6×42m, Anbau +3.600 m²',
  hall: {
    width: layoutJson.hall.width,
    height: layoutJson.hall.height,
    name: layoutJson.hall.name,
    color: layoutJson.hall.color,
  },
  objects: layoutJson.objects as unknown as Omit<TopisObject, 'id'>[],
  gaenge: layoutJson.gaenge as unknown as Gang[],
  prozessmodell: 'se_standard',
  parameterOverrides: {
    colliProTag: 15000,
    verteilweg: 177,  // Ø Fahrweg 2026 laut Michaels Auswertung (war 132 in 2020)
    schnellaeuferGeschwindigkeit: 2.44,
    colliProFahrt: 3.39,
    arbeitsminProStunde: 52.9,
    staplerGeschwindigkeit: 2.86,
  },
  referenz: {
    minProColli: 1.917,
    colliProMAStd: 27.6,
    fte: 54.5,
    quelle: 'ROTH Prozessmodell 2019 (kalibriert), Hallenplan 2026 Tim Winkler / Michael Laufenburg',
  },
};
