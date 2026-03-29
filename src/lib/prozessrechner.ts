import type {
  ProzessmodellConfig,
  ProzessParameter,
  GesamtErgebnis,
  AbteilungsErgebnis,
  Prozessschritt,
} from '@/types/prozessmodell';
import type { FFZ } from '@/types/topis';

/**
 * FFZ-Fahrzeugmix für die Verteilweg-Berechnung.
 * Jeder Eintrag definiert ein Flurförderzeug mit Geschwindigkeit, Colli/Bewegung und Anteil.
 *
 * Lastenheft-Formel:
 *   Wegzeit = Σ(anteil_FFZ × distanz / geschwindigkeit_FFZ / colliProBewegung_FFZ)
 *
 * Beispiel AS Gersthofen 2020:
 *   80% Schnelläufer (2.44 m/s, 1.4 Colli/Bew.) + 20% Stapler (2.86 m/s, 1.2 Colli/Bew.)
 */
export interface FFZMixEintrag {
  name: string;
  geschwindigkeitMs: number;
  colliProBewegung: number;
  anteil: number; // 0-1
}

/** Standard-Mix (Fallback): 100% Schnelläufer mit altem globalem colliProFahrt */
const DEFAULT_FFZ_MIX: FFZMixEintrag[] = [
  { name: 'Schnelläufer', geschwindigkeitMs: 2.44, colliProBewegung: 1.4, anteil: 0.8 },
  { name: 'Stapler', geschwindigkeitMs: 2.86, colliProBewegung: 1.2, anteil: 0.2 },
];

/**
 * Erzeugt FFZMixEinträge aus FFZ-Objekten (aus dem Store).
 * Nur FFZ mit anteil > 0 werden berücksichtigt.
 */
export function ffzToMix(ffzListe: FFZ[]): FFZMixEintrag[] {
  const mitAnteil = ffzListe.filter((f) => f.anteil > 0 && f.colliProBewegung > 0);
  if (mitAnteil.length === 0) return DEFAULT_FFZ_MIX;
  return mitAnteil.map((f) => ({
    name: f.name,
    geschwindigkeitMs: f.geschwindigkeit,
    colliProBewegung: f.colliProBewegung,
    anteil: f.anteil,
  }));
}

/**
 * Berechnet die gewichtete Wegzeit gemäß Lastenheft-Formel.
 *
 *   Wegzeit = Σ(anteil × distanz / geschwindigkeit / colliProBewegung)
 *
 * Falls kein FFZ-Mix übergeben wird, wird der alte globale colliProFahrt-Fallback genutzt.
 */
function berechneGewichteteWegzeit(
  distanzM: number,
  ffzMix: FFZMixEintrag[],
  fallbackGeschwindigkeit: number = 2.44,
  fallbackColliProFahrt: number = 1
): number {
  if (ffzMix.length === 0) {
    const zeit = distanzM / fallbackGeschwindigkeit;
    return fallbackColliProFahrt > 1 ? zeit / fallbackColliProFahrt : zeit;
  }

  let gesamt = 0;
  for (const ffz of ffzMix) {
    if (ffz.geschwindigkeitMs <= 0) continue;
    const fahrzeit = distanzM / ffz.geschwindigkeitMs;
    const zeitProColli = ffz.colliProBewegung > 1 ? fahrzeit / ffz.colliProBewegung : fahrzeit;
    gesamt += ffz.anteil * zeitProColli;
  }
  return gesamt;
}

/**
 * Berechnet Min/Colli für ein gegebenes Prozessmodell.
 *
 * Kernformel: Min/Colli = Σ(Standardzeit × Anteil × Häufigkeit) / 60
 *
 * Bei wegAusLayout-Schritten wird die Lastenheft-Formel verwendet:
 *   Wegzeit = Σ(anteil_FFZ × distanz / geschwindigkeit_FFZ / colliProBewegung_FFZ)
 *
 * @param ffzMix - Optional: Fahrzeugmix für Verteilweg-Berechnung. Wenn leer → Fallback auf globale Parameter.
 */
export function berechneMinProColli(
  modell: ProzessmodellConfig,
  parameter: ProzessParameter[],
  ffzMix?: FFZMixEintrag[]
): GesamtErgebnis {
  const getParam = (id: string): number => {
    const p = parameter.find((p) => p.id === id);
    return p?.aktuellerWert ?? p?.standardwert ?? 0;
  };

  const verteilweg = getParam('verteilweg');
  const colliProTag = getParam('colliProTag');
  const arbeitsminProStunde = getParam('arbeitsminProStunde') || 52.9;
  const arbeitsstundenProTag = getParam('arbeitsstundenProTag') || 8.0;

  // Fallback-Werte für Rückwärtskompatibilität (wenn kein FFZ-Mix übergeben)
  const fallbackGeschwindigkeit = getParam('schnellaeuferGeschwindigkeit') || 2.44;
  const fallbackColliProFahrt = getParam('colliProFahrt') || 1;
  const mix = ffzMix && ffzMix.length > 0 ? ffzMix : DEFAULT_FFZ_MIX;

  // Schritte mit aktualisierten Wegen berechnen
  const aktualisierteScritte: Prozessschritt[] = modell.schritte.map((schritt) => {
    let zeitSek = schritt.standardzeitSek;

    // Weg-abhängige Schritte: Lastenheft-Formel mit FFZ-Mix
    if (schritt.wegAusLayout && verteilweg > 0) {
      zeitSek = berechneGewichteteWegzeit(verteilweg, mix, fallbackGeschwindigkeit, fallbackColliProFahrt);
    }
    // Equipment-parametrische Schritte (Stapler, Ameise auf offenem Boden)
    else if (schritt.geschwindigkeitsParameter && schritt.wegM > 0) {
      const paramSpeed = getParam(schritt.geschwindigkeitsParameter);
      if (paramSpeed > 0) {
        zeitSek = schritt.wegM / paramSpeed;
      }
    }

    const berechneteZeit = zeitSek * schritt.anteil * schritt.haeufigkeit;

    return {
      ...schritt,
      standardzeitSek: zeitSek,
      berechneteZeitSek: berechneteZeit,
    };
  });

  // Abteilungen dynamisch aus dem Modell ableiten
  const abteilungIds = modell.abteilungen.map((a) => a.id);
  const abteilungsErgebnisse: AbteilungsErgebnis[] = abteilungIds.map((abtId) => {
    const abtDef = modell.abteilungen.find((a) => a.id === abtId)!;
    const schritte = aktualisierteScritte.filter((s) => s.abteilung === abtId);
    const gesamtSek = schritte.reduce((sum, s) => sum + (s.berechneteZeitSek || 0), 0);
    const minProColli = gesamtSek / 60;

    return {
      abteilung: abtId,
      label: abtDef.label,
      color: abtDef.color,
      minProColli,
      anteilGesamt: 0, // Wird unten berechnet
      schritteAnzahl: schritte.length,
      hauptzeitSek: gesamtSek,
    };
  });

  const gesamtMinProColli = abteilungsErgebnisse.reduce((sum, a) => sum + a.minProColli, 0);

  // Anteile berechnen
  abteilungsErgebnisse.forEach((a) => {
    a.anteilGesamt = gesamtMinProColli > 0 ? a.minProColli / gesamtMinProColli : 0;
  });

  // MA-Bedarf berechnen
  const { stunden, fte } = berechneMABedarf(colliProTag, gesamtMinProColli, arbeitsminProStunde, arbeitsstundenProTag);

  return {
    minProColli: gesamtMinProColli,
    abteilungen: abteilungsErgebnisse,
    maStundenBedarf: stunden,
    fte,
    colliProTag,
    arbeitsminProStunde,
  };
}

/**
 * Berechnet den MA-Stundenbedarf und FTE.
 *
 * MA-Stundenbedarf = (Colli/Tag × Min/Colli) / Arbeitsmin. pro Stunde
 * FTE = MA-Stundenbedarf / Arbeitsstunden pro Tag
 */
export function berechneMABedarf(
  colliProTag: number,
  minProColli: number,
  arbeitsminProStunde: number = 52.9,
  arbeitsstundenProTag: number = 8.0
): { stunden: number; fte: number } {
  const gesamtMinuten = colliProTag * minProColli;
  const stunden = gesamtMinuten / arbeitsminProStunde;
  const fte = stunden / arbeitsstundenProTag;

  return { stunden, fte };
}

/**
 * Berechnet Verteilweg-Zeit in Sekunden für gegebenen Weg und Geschwindigkeit.
 */
export function berechneWegzeit(wegM: number, geschwindigkeitMs: number): number {
  if (geschwindigkeitMs <= 0) return 0;
  return wegM / geschwindigkeitMs;
}
