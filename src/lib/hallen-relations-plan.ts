// Hallen-Relations-Plan (Lastenheft 3.2.3 Stellplatzauswertung)
//
// Rein-funktionale Aggregation der Stellplatz-Relationen für die
// gleichnamige Auswertung: „Verteilung Relationen auf Stellplätze,
// Mehrfach-Zuordnungen, ein-/ausblenden nach Prozess, Menge je Stellplatz
// als Heatmap/Farbabstufung."
//
// Keine Store-Abhängigkeit — Input ist `TopisObject[]`, Output sind reine
// Daten-Strukturen, damit dieser Code vom Dialog UND von Tests gleich
// benutzt werden kann.

import type { TopisObject } from '@/types/topis';

/** Detail-Datensatz einer einzelnen Relation auf einem Stellplatz. */
export interface RelationDetail {
  prozess: string;
  relation: string;
  menge: number;
  verladebereich?: string;
  bereichGruppe?: string;
}

/** Aggregierte Sicht auf einen Stellplatz für die Hallen-Relations-Auswertung.
 *
 * `prozesse` enthält pro Prozess die summierte Menge (Mehrfach-Zuordnungen
 * derselben Prozess+Relation werden also addiert, wie im Lastenheft
 * gefordert: „Mehrfach-Zuordnungen").
 *
 * `kapazitaet` kommt aus `kapazitaetMulti.packstuecke` — die Spezifikation
 * fordert die Kapazität in dieser Einheit, weil Mengen am Stellplatz
 * ebenfalls in Packstücken/Colli gepflegt werden.
 */
export interface StellplatzAggregat {
  stellplatzId: number;
  stellplatzName: string;
  prozesse: Record<string, number>;
  gesamtMenge: number;
  kapazitaet?: number;
  fuellgrad?: number;
  relationen: RelationDetail[];
}

/** Lastenheft 3.1.3.1 Default-Schwellen falls am Stellplatz keine
 * Füllgrad-Farben gepflegt sind. */
export const FUELLGRAD_DEFAULT = { gruenBis: 0.7, gelbBis: 0.9 } as const;

/**
 * Aggregiert alle Relationen je Stellplatz.
 *
 * Berücksichtigt werden ausschließlich Objekte vom Typ `stellplatz`. Tore,
 * Bereiche oder Regale sind hier bewusst ausgeklammert — Regal-Ebenen
 * wären eine separate Auswertung (siehe `regalEbenen[].relationen`).
 *
 * Stellplätze ohne Relationen werden mit `gesamtMenge: 0` zurückgegeben,
 * damit man im Dialog auch leere Stellplätze sieht (sonst würde der
 * Dialog bei frischen Layouts komplett leer bleiben).
 */
export function aggregateRelationenProStellplatz(
  objects: TopisObject[]
): StellplatzAggregat[] {
  const stellplaetze = objects.filter((o) => o.type === 'stellplatz');
  const result: StellplatzAggregat[] = [];

  for (const sp of stellplaetze) {
    const relationen = sp.relationen ?? [];
    const prozesse: Record<string, number> = {};
    const details: RelationDetail[] = [];
    let gesamtMenge = 0;

    for (const r of relationen) {
      const menge = Number.isFinite(r.menge) ? r.menge : 0;
      prozesse[r.prozess] = (prozesse[r.prozess] ?? 0) + menge;
      gesamtMenge += menge;
      details.push({
        prozess: r.prozess,
        relation: r.relation,
        menge,
        verladebereich: r.verladebereich,
        bereichGruppe: r.bereichGruppe,
      });
    }

    const kapazitaet = sp.kapazitaetMulti?.packstuecke;
    const fuellgrad =
      kapazitaet && kapazitaet > 0 ? gesamtMenge / kapazitaet : undefined;

    result.push({
      stellplatzId: sp.id,
      stellplatzName: sp.name || `Stellplatz ${sp.id}`,
      prozesse,
      gesamtMenge,
      kapazitaet,
      fuellgrad,
      relationen: details,
    });
  }

  return result;
}

/**
 * Übersetzt einen Füllgrad in eine Ampel-Farbe.
 *
 * Schwellen sind pro Stellplatz konfigurierbar (Lastenheft 3.1.3.1
 * „Füllgrad-Ampel-Schwellen"). Werte ≤ `gruenBis` → grün, ≤ `gelbBis`
 * → gelb, darüber → rot. Default 0.7 / 0.9.
 */
export function getFuellgradFarbe(
  fuellgrad: number,
  farben?: { gruenBis: number; gelbBis: number }
): 'gruen' | 'gelb' | 'rot' {
  const gruenBis = farben?.gruenBis ?? FUELLGRAD_DEFAULT.gruenBis;
  const gelbBis = farben?.gelbBis ?? FUELLGRAD_DEFAULT.gelbBis;
  if (fuellgrad <= gruenBis) return 'gruen';
  if (fuellgrad <= gelbBis) return 'gelb';
  return 'rot';
}

/**
 * Filtert die Aggregate auf aktive Prozesse.
 *
 * Stellplätze, deren Relationen nach dem Filter komplett wegfallen UND
 * die schon vorher keine Relationen hatten, werden ausgeblendet.
 * Stellplätze die nur Relationen ausgefilterter Prozesse hatten, fliegen
 * ebenfalls raus — sonst sieht man im Dialog eine Zeile mit Gesamt-Menge
 * 0 obwohl die Relationen ja existieren, nur eben gerade ausgeblendet.
 *
 * Wenn `aktiveProzesse` leer ist, wird **alles** ausgeblendet (Nutzer hat
 * alle Checkboxen deaktiviert → konsistente UI).
 */
export function filterByProzesse(
  aggregate: StellplatzAggregat[],
  aktiveProzesse: Set<string>
): StellplatzAggregat[] {
  return aggregate
    .map((a) => {
      const relationen = a.relationen.filter((r) =>
        aktiveProzesse.has(r.prozess)
      );
      const prozesse: Record<string, number> = {};
      let gesamtMenge = 0;
      for (const r of relationen) {
        prozesse[r.prozess] = (prozesse[r.prozess] ?? 0) + r.menge;
        gesamtMenge += r.menge;
      }
      const fuellgrad =
        a.kapazitaet && a.kapazitaet > 0
          ? gesamtMenge / a.kapazitaet
          : undefined;
      return {
        ...a,
        prozesse,
        gesamtMenge,
        fuellgrad,
        relationen,
      };
    })
    .filter((a) => {
      // Wenn am Originalstellplatz Relationen vorhanden waren, aber der
      // Filter alle entfernt, ist die Zeile unbrauchbar → ausblenden.
      // Wenn Originalstellplatz schon leer war, ebenfalls ausblenden —
      // sonst macht der Filter optisch keinen Unterschied (alle leeren
      // Zeilen kleben weiterhin in der Tabelle).
      return a.relationen.length > 0;
    });
}

/**
 * Sammelt alle Prozess-Namen aus den Aggregaten für die Filter-Checkboxen.
 */
export function getAlleProzesse(aggregate: StellplatzAggregat[]): string[] {
  const set = new Set<string>();
  for (const a of aggregate) {
    for (const r of a.relationen) set.add(r.prozess);
  }
  return Array.from(set).sort();
}

/**
 * Zählt die Gesamtanzahl der Relations-Datensätze über alle Stellplätze.
 * Für den Dialog-Header („3 Stellplätze, 17 Relationen").
 */
export function countRelationen(aggregate: StellplatzAggregat[]): number {
  return aggregate.reduce((sum, a) => sum + a.relationen.length, 0);
}
