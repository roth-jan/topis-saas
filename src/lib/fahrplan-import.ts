import { xlsxToRows, excelTimeToHHMM } from '@/lib/xlsx-utils';
import type { Fahrplan, FahrplanEintragSE, TorbelegungZelle } from '@/types/torbelegung';

/**
 * Parst eine Ankunftszeiten-Excel (wie "Eingänge Ankunftszeiten März.xlsx")
 * und erzeugt ein Fahrplan-Objekt für die Torbelegung.
 *
 * Erwartetes Format:
 * - Ist-Ankunftszeit in einer Spalte (Excel-Dezimalzeit oder HH:MM)
 * - Entladebeginn/-ende in weiteren Spalten
 * - Borderonummer/Relation
 * - Tor/Stellplatz
 * - Gewicht
 *
 * Die Funktion versucht die Spalten automatisch zu erkennen.
 */
export async function parseAnkunftszeitenExcel(file: File): Promise<Fahrplan> {
  const { rows } = await xlsxToRows(file);

  if (rows.length < 2) {
    throw new Error('Excel-Datei enthält zu wenige Zeilen');
  }

  // Header normalisieren
  const rawHeaders = (rows[0] || []).map((h) => String(h || '').trim());
  const headers = rawHeaders.map((h) => h.toLowerCase());

  // Spaltenindizes finden (flexibel)
  const findCol = (...candidates: string[]): number => {
    for (const cand of candidates) {
      const idx = headers.findIndex((h) => h.includes(cand));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const ankunftIdx = findCol('ist-ankunft', 'ankunft', 'ist ankunft', 'arrival', 'ankzeit');
  const entladeBeginnIdx = findCol('entladebeginn', 'entlade beginn', 'beginn entlad', 'unloading start');
  const entladeEndeIdx = findCol('entladeende', 'entlade ende', 'ende entlad', 'unloading end');
  const relationIdx = findCol('bordero', 'relation', 'tour', 'linie', 'borderonummer');
  const torIdx = findCol('tor', 'gate', 'stellplatz', 'rampe');
  const gewichtIdx = findCol('gewicht', 'weight', 'kg', 'gew');
  const netzwerkIdx = findCol('netzwerk', 'network', 'spediteur', 'carrier');

  const seAnkuenfte: FahrplanEintragSE[] = [];
  const torbelegungMap = new Map<string, Map<string, { count: number; relationen: string[] }>>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    // Ankunftszeit parsen
    let sollZeit = '00:00';
    if (ankunftIdx !== -1 && row[ankunftIdx] != null) {
      const val = row[ankunftIdx];
      if (typeof val === 'number' && val < 1) {
        // Excel-Dezimalzeit (z.B. 0.125 = 03:00)
        sollZeit = excelTimeToHHMM(val);
      } else if (typeof val === 'number' && val >= 1) {
        // Könnte eine Excel Serial Date+Time sein
        const timePart = val % 1;
        sollZeit = excelTimeToHHMM(timePart);
      } else {
        const str = String(val).trim();
        const match = str.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          sollZeit = `${match[1].padStart(2, '0')}:${match[2]}`;
        }
      }
    }

    // Relation/Bordero
    const relation = relationIdx !== -1 && row[relationIdx] != null
      ? String(row[relationIdx]).trim()
      : `Zeile ${i}`;

    // Tor
    const tor = torIdx !== -1 && row[torIdx] != null
      ? String(row[torIdx]).trim()
      : undefined;

    // Netzwerk
    const netzwerk = netzwerkIdx !== -1 && row[netzwerkIdx] != null
      ? String(row[netzwerkIdx]).trim()
      : 'Unbekannt';

    if (sollZeit === '00:00' && !relation) continue;

    seAnkuenfte.push({
      typ: 'SE',
      netzwerk,
      verkehrsart: 'L',
      relation,
      sollZeit,
      tor,
    });

    // Torbelegung berechnen (Halbstunden-Raster)
    if (tor) {
      const [h, m] = sollZeit.split(':').map(Number);
      const halbstundeKey = `${h}:${m >= 30 ? 30 : 0}`;

      if (!torbelegungMap.has(tor)) {
        torbelegungMap.set(tor, new Map());
      }
      const torMap = torbelegungMap.get(tor)!;
      if (!torMap.has(halbstundeKey)) {
        torMap.set(halbstundeKey, { count: 0, relationen: [] });
      }
      const slot = torMap.get(halbstundeKey)!;
      slot.count++;
      if (!slot.relationen.includes(relation)) {
        slot.relationen.push(relation);
      }
    }
  }

  // Torbelegung-Zellen erzeugen
  const torbelegung: TorbelegungZelle[] = [];
  torbelegungMap.forEach((torMap, tor) => {
    torMap.forEach((slot, key) => {
      const [stunde, minute] = key.split(':').map(Number);
      torbelegung.push({
        tor,
        stunde,
        minute,
        auslastung: slot.count,
        relationen: slot.relationen,
      });
    });
  });

  // Name aus Dateiname ableiten
  const name = file.name.replace(/\.(xlsx|xls)$/i, '');

  return {
    name,
    seAnkuenfte,
    saAbfahrten: [], // Ankunftszeiten-Excel hat keine SA-Daten
    torbelegung,
    verladebereiche: [],
  };
}
