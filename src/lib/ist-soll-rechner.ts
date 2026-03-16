import type { StundenAggregation } from '@/lib/betriebsdaten-store';

/**
 * Typen für die IST-SOLL-Analyse.
 */
export interface IstSollStunde {
  stunde: number;
  /** SOLL: benötigte MA basierend auf Colli × Min/Colli / 52.9 */
  sollMA: number;
  /** IST: tatsächlich eingesetzte MA */
  istMA: number;
  /** Delta (positiv = Überbesetzung, negativ = Unterbesetzung) */
  delta: number;
  /** Produktivitätslücke in % */
  lueckeProzent: number;
  /** Colli in dieser Stunde */
  colli: number;
  /** Status */
  status: 'ueberbesetzt' | 'passend' | 'unterbesetzt';
}

export interface IstSollAnalyse {
  /** Ergebnisse pro Stunde (nur Stunden mit Aktivität) */
  stunden: IstSollStunde[];
  /** Durchschnittliche Produktivitätslücke */
  durchschnittLuecke: number;
  /** Gesamt SOLL-MA-Stunden */
  gesamtSollStunden: number;
  /** Gesamt IST-MA-Stunden */
  gesamtIstStunden: number;
  /** Gesamt Differenz */
  gesamtDelta: number;
  /** Min/Colli verwendet */
  minProColli: number;
  /** Arbeitsmin/Stunde verwendet */
  arbeitsminProStunde: number;
}

/**
 * Berechnet die IST-SOLL-Analyse.
 *
 * SOLL pro Stunde = colliInStunde × minProColli / arbeitsminProStunde
 * IST = eingegebene MA-Zahlen pro Stunde
 *
 * @param stundenAggregation - Stündlich aggregierte Scandaten
 * @param istMAProStunde - Map: Stunde → eingesetzte MA (Benutzereingabe)
 * @param minProColli - Berechneter Wert aus Prozessmodell
 * @param arbeitsminProStunde - Standard: 52.9
 * @param arbeitstage - Anzahl Arbeitstage im Messzeitraum
 */
export function berechneIstSoll(
  stundenAggregation: StundenAggregation[],
  istMAProStunde: Record<number, number>,
  minProColli: number,
  arbeitsminProStunde: number = 52.9,
  arbeitstage: number = 1
): IstSollAnalyse {
  const stunden: IstSollStunde[] = [];
  let gesamtSollStunden = 0;
  let gesamtIstStunden = 0;

  // Nur Stunden mit Aktivität
  const aktiveStunden = stundenAggregation.filter((a) => a.colli > 0);

  aktiveStunden.forEach((agg) => {
    // Colli pro Stunde (Durchschnitt pro Tag)
    const colliProStunde = arbeitstage > 1 ? agg.colli / arbeitstage : agg.colli;

    // SOLL-MA für diese Stunde
    const sollMA = (colliProStunde * minProColli) / arbeitsminProStunde;

    // IST-MA
    const istMA = istMAProStunde[agg.stunde] || 0;

    const delta = istMA - sollMA;
    const lueckeProzent = sollMA > 0 ? ((istMA - sollMA) / sollMA) * 100 : 0;

    let status: IstSollStunde['status'] = 'passend';
    if (delta > 0.5) status = 'ueberbesetzt';
    else if (delta < -0.5) status = 'unterbesetzt';

    stunden.push({
      stunde: agg.stunde,
      sollMA,
      istMA,
      delta,
      lueckeProzent,
      colli: colliProStunde,
      status,
    });

    gesamtSollStunden += sollMA;
    gesamtIstStunden += istMA;
  });

  const durchschnittLuecke =
    gesamtSollStunden > 0 ? ((gesamtIstStunden - gesamtSollStunden) / gesamtSollStunden) * 100 : 0;

  return {
    stunden,
    durchschnittLuecke,
    gesamtSollStunden,
    gesamtIstStunden,
    gesamtDelta: gesamtIstStunden - gesamtSollStunden,
    minProColli,
    arbeitsminProStunde,
  };
}
