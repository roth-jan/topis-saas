// Auftrags-Aggregation für die Planungs-Seite.
//
// Aus den Scandaten (Zeile pro Scan-Event) entstehen Auftragszeilen
// pro (Tor × Bereich × Zeitraum). Pro Zeile wird die ROTH-Methodik
// aus dem Lastenheft V1.1 angewendet:
//
//   Min/Colli  =  fixe Schritte (Entlader + Scanner + Verlader)
//               + (Aufnahme + Abgabe + Weg / FFZ-Geschwindigkeit) / Colli-pro-Fahrt
//
// Die Wegzeit-Komponente kommt aus dem echten A*-Weg zwischen Tor
// und Ziel-Bereich, nicht aus einem Hallen-Durchschnitt.

import type { ScandatenRecord, TorZuordnung, RelationZuordnung } from '@/types/scandaten';
import type { TopisObject, Gang, FFZ, SimAuftrag } from '@/types/topis';
import { berechneDistanzMitCache } from '@/lib/verteilweg-rechner';
import { findPathBetweenObjects } from '@/lib/pathfinding';

export interface Auftragszeile {
  /** Stabile ID (Tor-ObjectId + Bereich-ObjectId) — gleich für IST und SOLL */
  id: string;
  torObjectId: number | null;
  torName: string;
  bereichObjectId: number | null;
  bereichName: string;

  /** Quell-Aggregation aus Scandaten */
  colli: number;
  sendungen: number;
  sourceRecords: number;

  /** Strecke + Zeitkomponenten — alle in Min/Colli */
  distanzM: number;             // A*-Weg Tor → Bereich (Einfachweg)
  ffzId: number | null;         // verwendete FFZ
  ffzName: string;
  minProColliFix: number;       // Entlader + Scanner + Verlader (aus Prozessmodell)
  minProColliWeg: number;       // (Aufnahme + Abgabe + Doppelweg / Geschw.) / Colli-pro-Fahrt
  minProColli: number;          // Σ

  /** Aggregate */
  gesamtMin: number;            // colli × minProColli
  gesamtStunden: number;        // gesamtMin / 60
  kosten: number;               // gesamtStunden × stundensatz

  /** Plausi-Marker */
  warnung: 'tor-nicht-gemappt' | 'bereich-nicht-gemappt' | 'weg-fehlt' | null;
  /** Quelle: aus Scandaten aggregiert oder per Klick im Canvas angelegt */
  quelle: 'ist' | 'sim';
  /** Bei sim: Verweis auf den simAuftrag im Layout-Store */
  simAuftragId?: string;
}

export interface AuftragsAggregationInput {
  records: ScandatenRecord[];
  objects: TopisObject[];
  gaenge: Gang[];
  torZuordnungen: TorZuordnung[];
  relationZuordnungen: RelationZuordnung[];
  ffzList: FFZ[];
  /** ID des Standard-FFZ. Wenn null: erstes aus ffzList. */
  defaultFfzId: number | null;
  stundensatzEuro: number;
  /** Fixe Min/Colli aus dem Prozessmodell (Entlader+Scanner+Verlader, ohne Weg). Default 1.17 (AS-kalibriert). */
  minProColliFix: number;
  /** Zeitraum-Filter — z.B. eine Kalenderwoche ('2026-W03') oder null für alles. */
  zeitraumFilter?: { start: string; ende: string } | null;
}

/**
 * Liefert ISO-Kalenderwoche im Format YYYY-Www.
 */
export function isoWeekOf(dateStr: string): string {
  // dateStr kann sein: 'YYYY-MM-DD', 'DD.MM.YYYY' oder ISO-Timestamp
  let d: Date;
  if (dateStr.match(/^\d{2}\.\d{2}\.\d{4}/)) {
    const [day, month, year] = dateStr.split('.');
    d = new Date(`${year}-${month}-${day}T00:00:00Z`);
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d.getTime())) return '';
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7; // Mon=0, Sun=6
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNr = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(weekNr).padStart(2, '0')}`;
}

/**
 * Hauptfunktion: aggregiert Scandaten zu Auftragszeilen.
 */
export function aggregateAuftragszeilen(input: AuftragsAggregationInput): {
  zeilen: Auftragszeile[];
  meta: {
    gesamtColli: number;
    gesamtStunden: number;
    gesamtKosten: number;
    zeilenAnzahl: number;
    arbeitstage: number;
    warnungen: number;
    durchschnittWegM: number;
  };
  verfuegbareWochen: string[];
} {
  const {
    records,
    objects,
    gaenge,
    torZuordnungen,
    relationZuordnungen,
    ffzList,
    defaultFfzId,
    stundensatzEuro,
    minProColliFix,
    zeitraumFilter,
  } = input;

  // FFZ wählen: defaultFfzId, sonst erstes aus Liste
  const defaultFfz: FFZ | null =
    (defaultFfzId != null && ffzList.find((f) => f.id === defaultFfzId)) ||
    ffzList[0] ||
    null;

  // Zeitraum-Filter erzeugt Set verfügbarer Wochen aus den Records
  const wochenSet = new Set<string>();

  // Aggregations-Map: Schlüssel = `${stellplatzKey}|${relationKey}`
  type Bucket = {
    stellplatzKey: string;
    relationKey: string;
    colli: number;
    sendungen: number;
    sourceRecords: number;
    tage: Set<string>;
  };
  const buckets = new Map<string, Bucket>();

  for (const r of records) {
    if (!r.stellplatz) continue;
    const woche = isoWeekOf(r.scandatum);
    if (woche) wochenSet.add(woche);
    if (zeitraumFilter && (r.scandatum < zeitraumFilter.start || r.scandatum > zeitraumFilter.ende)) continue;

    const rel = r.ausgangsrelation || r.dispogebiet || 'UNBEKANNT';
    const key = `${r.stellplatz}|${rel}`;
    let b = buckets.get(key);
    if (!b) {
      b = { stellplatzKey: r.stellplatz, relationKey: rel, colli: 0, sendungen: 0, sourceRecords: 0, tage: new Set() };
      buckets.set(key, b);
    }
    b.colli += r.colli || 0;
    b.sendungen += r.sendungen || 0;
    b.sourceRecords += 1;
    if (r.scandatum) b.tage.add(r.scandatum);
  }

  // Ø Wegberechnung — nur zur Plausibilisierung
  let sumWegColli = 0;
  let sumColli = 0;
  let warnCount = 0;

  const zeilen: Auftragszeile[] = [];
  for (const b of buckets.values()) {
    if (b.colli === 0) continue;

    const torZuord = torZuordnungen.find((z) => z.stellplatzKey === b.stellplatzKey);
    const torObj = torZuord?.objectId != null ? objects.find((o) => o.id === torZuord.objectId) ?? null : null;

    const relZuord = relationZuordnungen.find((z) => z.relationKey === b.relationKey);
    const bereichObj = relZuord?.objectId != null ? objects.find((o) => o.id === relZuord.objectId) ?? null : null;

    let distanzM = 0;
    let warnung: Auftragszeile['warnung'] = null;

    if (!torObj) {
      warnung = 'tor-nicht-gemappt';
    } else if (!bereichObj) {
      warnung = 'bereich-nicht-gemappt';
    } else {
      try {
        distanzM = berechneDistanzMitCache(torObj, bereichObj, gaenge, defaultFfz ?? undefined);
      } catch {
        distanzM = 0;
      }
      if (distanzM === 0) warnung = 'weg-fehlt';
    }
    if (warnung) warnCount += 1;

    // Wegzeit-Komponente: (Aufnahme + Abgabe + Doppelweg / Geschw_m_per_s) / Colli-pro-Fahrt
    // Geschwindigkeit liegt im FFZ als km/h vor → in m/s umrechnen
    let minProColliWeg = 0;
    if (defaultFfz && distanzM > 0) {
      const speed_kmh = defaultFfz.geschwindigkeit || 10;
      const speed_ms = (speed_kmh * 1000) / 3600;
      const doppelwegM = distanzM * 2;
      const wegSek = speed_ms > 0 ? doppelwegM / speed_ms : 0;
      const colliProFahrt = defaultFfz.colliProBewegung || 1.37;
      const sekProColli = (wegSek + (defaultFfz.aufnahmeZeit || 0) + (defaultFfz.abgabeZeit || 0)) / colliProFahrt;
      minProColliWeg = sekProColli / 60;
    }

    const minProColli = minProColliFix + minProColliWeg;
    const gesamtMin = b.colli * minProColli;
    const gesamtStunden = gesamtMin / 60;
    const kosten = gesamtStunden * stundensatzEuro;

    sumWegColli += distanzM * b.colli;
    sumColli += b.colli;

    zeilen.push({
      id: `${torZuord?.objectId ?? 'noTor'}|${relZuord?.objectId ?? 'noBereich'}|${b.stellplatzKey}|${b.relationKey}`,
      torObjectId: torObj?.id ?? null,
      torName: torObj?.name ?? b.stellplatzKey,
      bereichObjectId: bereichObj?.id ?? null,
      bereichName: bereichObj?.name ?? b.relationKey,
      colli: Math.round(b.colli),
      sendungen: Math.round(b.sendungen),
      sourceRecords: b.sourceRecords,
      distanzM,
      ffzId: defaultFfz?.id ?? null,
      ffzName: defaultFfz?.name ?? '–',
      minProColliFix,
      minProColliWeg,
      minProColli,
      gesamtMin,
      gesamtStunden,
      kosten,
      warnung,
      quelle: 'ist',
    });
  }

  zeilen.sort((a, b) => b.colli - a.colli);

  const gesamtColli = zeilen.reduce((s, z) => s + z.colli, 0);
  const gesamtStundenTotal = zeilen.reduce((s, z) => s + z.gesamtStunden, 0);
  const gesamtKostenTotal = zeilen.reduce((s, z) => s + z.kosten, 0);

  // Arbeitstage: alle distinct Tage über alle Buckets
  const alleTage = new Set<string>();
  buckets.forEach((b) => b.tage.forEach((t) => alleTage.add(t)));

  return {
    zeilen,
    meta: {
      gesamtColli,
      gesamtStunden: gesamtStundenTotal,
      gesamtKosten: gesamtKostenTotal,
      zeilenAnzahl: zeilen.length,
      arbeitstage: alleTage.size,
      warnungen: warnCount,
      durchschnittWegM: sumColli > 0 ? sumWegColli / sumColli : 0,
    },
    verfuegbareWochen: [...wochenSet].sort(),
  };
}

/**
 * Wandelt simulierte Aufträge (per Klick im Canvas angelegt) in Auftragszeilen
 * um — gleiche Formel wie IST-Aggregation, aber Quelle ist die `simAuftraege`-
 * Liste im Layout-Store, nicht die Scandaten.
 */
export function simAuftraegeToZeilen(input: {
  simAuftraege: SimAuftrag[];
  objects: TopisObject[];
  gaenge: Gang[];
  ffzList: FFZ[];
  defaultFfzId: number | null;
  stundensatzEuro: number;
  minProColliFix: number;
}): Auftragszeile[] {
  const { simAuftraege, objects, gaenge, ffzList, defaultFfzId, stundensatzEuro, minProColliFix } = input;
  const defaultFfz: FFZ | null =
    (defaultFfzId != null && ffzList.find((f) => f.id === defaultFfzId)) ||
    ffzList[0] ||
    null;

  const result: Auftragszeile[] = [];
  for (const a of simAuftraege) {
    const von = objects.find((o) => o.id === a.vonObjectId);
    const nach = objects.find((o) => o.id === a.nachObjectId);
    if (!von || !nach) continue;

    // Distanz: A*-Pfad. Wenn keiner gefunden → warnung markieren und
    // Luftlinie als grobe Schätzung verwenden (transparent gemacht).
    let distanzM = 0;
    let warnung: Auftragszeile['warnung'] = null;
    try {
      const pf = findPathBetweenObjects(von, nach, gaenge, defaultFfz ?? undefined);
      if (pf && pf.distance > 0) {
        distanzM = pf.distance;
      } else {
        // Luftlinie als Schätzung, plus warnung
        const dx = (nach.x + nach.width / 2) - (von.x + von.width / 2);
        const dy = (nach.y + nach.height / 2) - (von.y + von.height / 2);
        distanzM = Math.sqrt(dx * dx + dy * dy);
        warnung = 'weg-fehlt';
      }
    } catch {
      distanzM = 0;
      warnung = 'weg-fehlt';
    }

    let minProColliWeg = 0;
    if (defaultFfz && distanzM > 0) {
      const speed_ms = ((defaultFfz.geschwindigkeit || 10) * 1000) / 3600;
      const wegSek = speed_ms > 0 ? (distanzM * 2) / speed_ms : 0;
      const cpF = defaultFfz.colliProBewegung || 1.37;
      const sekProColli = (wegSek + (defaultFfz.aufnahmeZeit || 0) + (defaultFfz.abgabeZeit || 0)) / cpF;
      minProColliWeg = sekProColli / 60;
    }
    const fixUsed = a.minProColliOverride ?? minProColliFix;
    const minProColli = fixUsed + minProColliWeg;
    const gesamtMin = a.colli * minProColli;
    const gesamtStunden = gesamtMin / 60;
    const kosten = gesamtStunden * stundensatzEuro;

    result.push({
      id: `sim-${a.id}`,
      simAuftragId: a.id,
      quelle: 'sim',
      torObjectId: von.id,
      torName: von.name ?? `Tor ${von.id}`,
      bereichObjectId: nach.id,
      bereichName: nach.name ?? `Ziel ${nach.id}`,
      colli: a.colli,
      sendungen: 1,
      sourceRecords: 1,
      distanzM,
      ffzId: defaultFfz?.id ?? null,
      ffzName: defaultFfz?.name ?? '–',
      minProColliFix: fixUsed,
      minProColliWeg,
      minProColli,
      gesamtMin,
      gesamtStunden,
      kosten,
      warnung,
    });
  }
  return result;
}

/**
 * Wendet eine Bearbeitung auf eine Zeile an (für SOLL-Simulation) und
 * rechnet die abhängigen Felder neu durch.
 */
export function applyZeilenEdit(
  zeile: Auftragszeile,
  edit: Partial<Pick<Auftragszeile, 'torObjectId' | 'bereichObjectId' | 'colli' | 'ffzId'>>,
  ctx: {
    objects: TopisObject[];
    gaenge: Gang[];
    ffzList: FFZ[];
    stundensatzEuro: number;
  }
): Auftragszeile {
  const newZeile = { ...zeile, ...edit };

  const torObj = newZeile.torObjectId != null
    ? ctx.objects.find((o) => o.id === newZeile.torObjectId) ?? null
    : null;
  const bereichObj = newZeile.bereichObjectId != null
    ? ctx.objects.find((o) => o.id === newZeile.bereichObjectId) ?? null
    : null;
  const ffz = newZeile.ffzId != null
    ? ctx.ffzList.find((f) => f.id === newZeile.ffzId) ?? null
    : null;

  newZeile.torName = torObj?.name ?? zeile.torName;
  newZeile.bereichName = bereichObj?.name ?? zeile.bereichName;
  newZeile.ffzName = ffz?.name ?? zeile.ffzName;

  let distanzM = 0;
  let warnung: Auftragszeile['warnung'] = null;
  if (!torObj) warnung = 'tor-nicht-gemappt';
  else if (!bereichObj) warnung = 'bereich-nicht-gemappt';
  else {
    try {
      distanzM = berechneDistanzMitCache(torObj, bereichObj, ctx.gaenge, ffz ?? undefined);
    } catch {
      distanzM = 0;
    }
    if (distanzM === 0) warnung = 'weg-fehlt';
  }
  newZeile.distanzM = distanzM;
  newZeile.warnung = warnung;

  let minProColliWeg = 0;
  if (ffz && distanzM > 0) {
    const speed_ms = ((ffz.geschwindigkeit || 10) * 1000) / 3600;
    const wegSek = speed_ms > 0 ? (distanzM * 2) / speed_ms : 0;
    const cpF = ffz.colliProBewegung || 1.37;
    const sekProColli = (wegSek + (ffz.aufnahmeZeit || 0) + (ffz.abgabeZeit || 0)) / cpF;
    minProColliWeg = sekProColli / 60;
  }
  newZeile.minProColliWeg = minProColliWeg;
  newZeile.minProColli = newZeile.minProColliFix + minProColliWeg;
  newZeile.gesamtMin = newZeile.colli * newZeile.minProColli;
  newZeile.gesamtStunden = newZeile.gesamtMin / 60;
  newZeile.kosten = newZeile.gesamtStunden * ctx.stundensatzEuro;

  return newZeile;
}
