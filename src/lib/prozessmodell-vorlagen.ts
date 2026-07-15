import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from './data/prozessmodell-se';
import { PROZESSMODELL_SA, SA_STANDARD_PARAMETER } from './data/prozessmodell-sa';
import type { ProzessmodellConfig, ProzessParameter } from '@/types/prozessmodell';
import type { NativesProzessmodell, NativKnoten, NativSchritt, NativBlock } from './prozessmodell-nativ';

/**
 * Tür 2 & 3 des Cockpits: Prozessmodell OHNE Excel starten.
 *
 * - ROTH-Vorlage: baut aus den kalibrierten Standard-Modellen (SE/SA,
 *   ROTH-Zeitaufnahme — KEINE erfundenen Zahlen) ein natives Modell, das
 *   der Kunde mit wenigen Eckdaten (Colli/Monat, Arbeitstage, Verteilweg)
 *   sofort rechnen und danach frei verfeinern kann.
 * - Leeres Modell: minimales Gerüst zum Selberbauen (Berater-Einstieg).
 *
 * Abbildung der alten Kernformel in die native Struktur (bewiesen im
 * Gate-Test gegen `berechneMinProColli`):
 *   normaler Schritt   → I=standardzeitSek, M=anteil×häufigkeit×Colli/Tag
 *   Geräte-Wegschritt   → G=wegM, H=Geschwindigkeits-Knoten, I=0
 *   Verteilweg-Schritt  → G=Verteilweg-Knoten, H=Geschw-Knoten, I=0,
 *                         M zusätzlich ÷ Colli-pro-Fahrt (Batch)
 */

export interface VorlagenEckdaten {
  monat: string; // 'MM/YYYY'
  colliProMonat: number;
  arbeitstage: number;
  /** Optional: gewichteter Verteilweg in m (sonst Vorlagen-Standard). */
  verteilwegM?: number;
}

export type VorlagenTyp = 'se' | 'sa' | 'se_sa';

const SEKTION: Record<'se' | 'sa', string> = { se: 'Sammelguteingang', sa: 'Sammelgutausgang' };

function param(params: ProzessParameter[], id: string, fallback = 0): number {
  const p = params.find((x) => x.id === id);
  return p?.aktuellerWert ?? p?.standardwert ?? fallback;
}

/** Baut EINEN Block (+ zugehörige Knoten) aus einer alten Vorlagen-Config. */
function baueBlock(
  typ: 'se' | 'sa',
  config: ProzessmodellConfig,
  params: ProzessParameter[],
  eck: VorlagenEckdaten,
  blockIdx: number,
): { block: NativBlock; knoten: NativKnoten[]; mengeExpr: string } {
  const blockId = `b${blockIdx}`;
  const p = (kurz: string) => `_k${typ}${kurz}`;
  const abteilungLabel = (id: string) => config.abteilungen.find((a) => a.id === id)?.label ?? id;

  const verteilweg = eck.verteilwegM ?? param(params, 'verteilweg');
  const knoten: NativKnoten[] = [
    { id: p('cm'), name: 'Colli je Monat', region: 'menge', blockId, wert: eck.colliProMonat, expr: null, origin: null },
    { id: p('ct'), name: null, region: 'intern', blockId: null, wert: null, expr: `${p('cm')}/_AT`, origin: null },
    { id: p('vw'), name: 'ø Verteilweg', region: 'parameter', blockId, wert: verteilweg, expr: null, origin: null },
    { id: p('vg'), name: 'Verteil-Geschwindigkeit (m/s)', region: 'parameter', blockId, wert: param(params, 'schnellaeuferGeschwindigkeit', 2.44), expr: null, origin: null },
    { id: p('cpf'), name: 'Colli je Fahrt (Batch)', region: 'parameter', blockId, wert: param(params, 'colliProFahrt', 1), expr: null, origin: null },
  ];
  // Geräte-Geschwindigkeiten, die Schritte referenzieren (nur die wirklich verdrahteten)
  const geraete = new Map<string, string>(); // parameterId → knotenId
  for (const s of config.schritte) {
    if (s.geschwindigkeitsParameter && s.wegM > 0 && !geraete.has(s.geschwindigkeitsParameter)) {
      const id = p(`g${geraete.size}`);
      geraete.set(s.geschwindigkeitsParameter, id);
      const def = params.find((x) => x.id === s.geschwindigkeitsParameter);
      knoten.push({
        id,
        name: def?.name ?? s.geschwindigkeitsParameter,
        region: 'parameter',
        blockId,
        wert: def?.aktuellerWert ?? def?.standardwert ?? s.geschwindigkeitMs,
        expr: null,
        origin: null,
      });
    }
  }

  const schritte: NativSchritt[] = config.schritte.map((s, i) => {
    const id = `_v${typ}${i}`;
    const basis: Pick<NativSchritt, 'id' | 'nr' | 'name' | 'abteilung' | 'anteil'> = {
      id,
      nr: s.nr,
      name: s.beschreibung,
      abteilung: abteilungLabel(s.abteilung),
      anteil: s.anteil,
    };
    if (s.wegAusLayout) {
      // Verteilweg-Schritt: Wegzeit ÷ Batch (Colli je Fahrt)
      return {
        ...basis,
        wegM: p('vw'),
        geschwMs: p('vg'),
        standardSek: 0,
        haeufigkeitExpr: `${id}*${s.haeufigkeit}*(${p('ct')})/(${p('cpf')})`,
      };
    }
    if (s.geschwindigkeitsParameter && s.wegM > 0) {
      // Geräte-Wegschritt: Weg ÷ Geräte-Geschwindigkeit
      return {
        ...basis,
        wegM: s.wegM,
        geschwMs: geraete.get(s.geschwindigkeitsParameter)!,
        standardSek: 0,
        haeufigkeitExpr: `${id}*${s.haeufigkeit}*(${p('ct')})`,
      };
    }
    return {
      ...basis,
      wegM: null,
      geschwMs: null,
      standardSek: s.standardzeitSek,
      haeufigkeitExpr: `${id}*${s.haeufigkeit}*(${p('ct')})`,
    };
  });

  return {
    block: { id: blockId, name: `${typ.toUpperCase()}: ${config.name} — ROTH-Standard`, basisExpr: p('ct'), schritte },
    knoten,
    mengeExpr: p('cm'),
  };
}

/** ROTH-Vorlage → natives Modell (SE, SA oder beide). */
export function erzeugeModellAusVorlage(typ: VorlagenTyp, eck: VorlagenEckdaten): NativesProzessmodell {
  const teile: ('se' | 'sa')[] = typ === 'se_sa' ? ['se', 'sa'] : [typ];
  const knoten: NativKnoten[] = [];
  const bloecke: NativBlock[] = [];
  const uebersicht: NativesProzessmodell['uebersicht'] = [];

  teile.forEach((t, i) => {
    const config = t === 'se' ? PROZESSMODELL_SE : PROZESSMODELL_SA;
    const params = t === 'se' ? SE_STANDARD_PARAMETER : SA_STANDARD_PARAMETER;
    const { block, knoten: k, mengeExpr } = baueBlock(t, config, params, eck, i);
    knoten.push(...k);
    bloecke.push(block);
    uebersicht.push({ sektion: SEKTION[t], name: block.name, mengeExpr, blockId: block.id });
  });

  return {
    version: 1,
    name: typ === 'se_sa' ? 'ROTH-Vorlage SE + SA' : `ROTH-Vorlage ${typ.toUpperCase()}`,
    monat: eck.monat,
    arbeitstage: eck.arbeitstage,
    arbeitsminProStunde: param(SE_STANDARD_PARAMETER, 'arbeitsminProStunde', 52.9),
    knoten,
    bloecke,
    uebersicht,
    sonstige: [],
    nextId: 1,
  };
}

/** Leeres Modell zum Selberbauen (Berater-/Experten-Einstieg). */
export function erzeugeLeeresModell(monat: string, arbeitstage = 21): NativesProzessmodell {
  const knoten: NativKnoten[] = [
    { id: '_kcm', name: 'Colli je Monat', region: 'menge', blockId: 'b0', wert: 10000, expr: null, origin: null },
    { id: '_kct', name: null, region: 'intern', blockId: null, wert: null, expr: '_kcm/_AT', origin: null },
  ];
  const bloecke: NativBlock[] = [
    {
      id: 'b0',
      name: 'SE: Neuer Prozess',
      basisExpr: '_kct',
      schritte: [
        {
          id: '_v0',
          nr: 1,
          name: 'Erster Prozessschritt (Zeit eintragen)',
          abteilung: 'Entlader',
          wegM: null,
          geschwMs: null,
          standardSek: 0,
          anteil: 1,
          haeufigkeitExpr: '_v0*(_kct)',
        },
      ],
    },
  ];
  return {
    version: 1,
    name: 'Eigenes Prozessmodell',
    monat,
    arbeitstage,
    arbeitsminProStunde: 52.9,
    knoten,
    bloecke,
    uebersicht: [{ sektion: 'Prozesse', name: 'SE: Neuer Prozess', mengeExpr: '_kcm', blockId: 'b0' }],
    sonstige: [],
    nextId: 1,
  };
}
