import type { ScandatenRecord, RelationZuordnung } from '@/types/scandaten';
import type { TopisObject } from '@/types/topis';

/**
 * Ergebnis der Flächenbedarfsrechnung pro Relation.
 */
export interface FlaechenbedarfErgebnis {
  relation: string;
  objectId: number | null;
  objectName: string;
  /** Colli pro Tag (Durchschnitt) */
  colliProTag: number;
  /** Sendungen pro Tag */
  sendungenProTag: number;
  /** Gewicht pro Tag (kg) */
  gewichtProTag: number;
  /** Benötigte Fläche in qm */
  benoetigtQm: number;
  /** Verfügbare Fläche in qm (aus Layout-Objekt oder manuell) */
  verfuegbarQm: number;
  /** Delta (positiv = Überschuss, negativ = Unterversorgung) */
  deltaQm: number;
  /** Auslastung (0-x, 1 = 100%) */
  auslastung: number;
  /** Status */
  status: 'ok' | 'knapp' | 'ueberlastet' | 'unbekannt';
}

/**
 * Gesamtergebnis der Flächenbedarfsanalyse.
 */
export interface FlaechenAnalyse {
  /** Summe benötigte Fläche */
  gesamtBenoetigtQm: number;
  /** Summe verfügbare Fläche */
  gesamtVerfuegbarQm: number;
  /** Ergebnisse pro Relation */
  ergebnisse: FlaechenbedarfErgebnis[];
  /** Colli pro qm (Berechnungsfaktor) */
  colliProQm: number;
}

/** Standard-Faktor: 1.25 Colli pro qm Stellfläche */
const DEFAULT_COLLI_PRO_QM = 1.25;

/**
 * Berechnet den Flächenbedarf pro Relation.
 *
 * Formel: Flächenbedarf = Colli/Tag / 1.25 Colli/qm
 *
 * @param records - Scandaten-Records
 * @param relationZuordnungen - Zuordnung Relation → Layout-Bereich
 * @param objects - Layout-Objekte (für Flächenermittlung)
 * @param colliProQm - Colli pro Quadratmeter (Standard: 1.25)
 */
export function berechneFlaechenbedarf(
  records: ScandatenRecord[],
  relationZuordnungen: RelationZuordnung[],
  objects: TopisObject[],
  colliProQm: number = DEFAULT_COLLI_PRO_QM
): FlaechenAnalyse {
  // Arbeitstage ermitteln
  const daten = [...new Set(records.map((r) => r.scandatum).filter(Boolean))];
  const arbeitstage = Math.max(daten.length, 1);

  // Gruppiere nach Relation
  const relationGroups = new Map<string, ScandatenRecord[]>();
  records.forEach((r) => {
    const rel = r.ausgangsrelation || 'OHNE_RELATION';
    if (!relationGroups.has(rel)) relationGroups.set(rel, []);
    relationGroups.get(rel)!.push(r);
  });

  const ergebnisse: FlaechenbedarfErgebnis[] = [];
  let gesamtBenoetigtQm = 0;
  let gesamtVerfuegbarQm = 0;

  relationGroups.forEach((recs, relation) => {
    const totalColli = recs.reduce((s, r) => s + r.colli, 0);
    const totalSendungen = recs.reduce((s, r) => s + r.sendungen, 0);
    const totalGewicht = recs.reduce((s, r) => s + r.gewicht, 0);

    const colliProTag = totalColli / arbeitstage;
    const benoetigtQm = colliProTag / colliProQm;

    // Verfügbare Fläche aus Zuordnung oder Layout-Objekt
    const zuordnung = relationZuordnungen.find((z) => z.relationKey === relation);
    let verfuegbarQm = zuordnung?.flaecheQm || 0;

    if (verfuegbarQm === 0 && zuordnung?.objectId) {
      const obj = objects.find((o) => o.id === zuordnung.objectId);
      if (obj) {
        verfuegbarQm = obj.width * obj.height; // Fläche aus Objektgröße
      }
    }

    const deltaQm = verfuegbarQm - benoetigtQm;
    const auslastung = verfuegbarQm > 0 ? benoetigtQm / verfuegbarQm : 0;

    let status: FlaechenbedarfErgebnis['status'] = 'unbekannt';
    if (verfuegbarQm > 0) {
      if (auslastung <= 0.8) status = 'ok';
      else if (auslastung <= 1.0) status = 'knapp';
      else status = 'ueberlastet';
    }

    ergebnisse.push({
      relation,
      objectId: zuordnung?.objectId || null,
      objectName: zuordnung?.objectName || relation,
      colliProTag,
      sendungenProTag: totalSendungen / arbeitstage,
      gewichtProTag: totalGewicht / arbeitstage,
      benoetigtQm,
      verfuegbarQm,
      deltaQm,
      auslastung,
      status,
    });

    gesamtBenoetigtQm += benoetigtQm;
    gesamtVerfuegbarQm += verfuegbarQm;
  });

  // Sortiere nach Colli absteigend
  ergebnisse.sort((a, b) => b.colliProTag - a.colliProTag);

  return {
    gesamtBenoetigtQm,
    gesamtVerfuegbarQm,
    ergebnisse,
    colliProQm,
  };
}
