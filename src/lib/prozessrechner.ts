import type {
  ProzessmodellConfig,
  ProzessParameter,
  GesamtErgebnis,
  AbteilungsErgebnis,
  Prozessschritt,
} from '@/types/prozessmodell';

/**
 * Berechnet Min/Colli für ein gegebenes Prozessmodell.
 *
 * Kernformel: Min/Colli = Σ(Standardzeit × Anteil × Häufigkeit) / 60
 *
 * Die Summe wird pro Abteilung berechnet und dann summiert.
 * Bei wegAusLayout-Schritten wird die Wegzeit durch colliProFahrt (Batch-Faktor) geteilt.
 */
export function berechneMinProColli(
  modell: ProzessmodellConfig,
  parameter: ProzessParameter[]
): GesamtErgebnis {
  const getParam = (id: string): number => {
    const p = parameter.find((p) => p.id === id);
    return p?.aktuellerWert ?? p?.standardwert ?? 0;
  };

  const verteilweg = getParam('verteilweg');
  const schnellaeuferGeschwindigkeit = getParam('schnellaeuferGeschwindigkeit') || 2.44;
  const colliProTag = getParam('colliProTag');
  const arbeitsminProStunde = getParam('arbeitsminProStunde') || 52.9;
  const arbeitsstundenProTag = getParam('arbeitsstundenProTag') || 8.0;
  const colliProFahrt = getParam('colliProFahrt') || 1;

  // Schritte mit aktualisierten Wegen berechnen
  const aktualisierteScritte: Prozessschritt[] = modell.schritte.map((schritt) => {
    let zeitSek = schritt.standardzeitSek;

    // Weg-abhängige Schritte: Zeit aus Layout-Verteilweg berechnen
    if (schritt.wegAusLayout && verteilweg > 0) {
      const geschwindigkeit = schnellaeuferGeschwindigkeit || schritt.geschwindigkeitMs || 2.44;
      zeitSek = verteilweg / geschwindigkeit;
      // Batch-Faktor: Mehrere Colli pro Fahrt → Wegzeit teilen
      if (colliProFahrt > 1) {
        zeitSek = zeitSek / colliProFahrt;
      }
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
