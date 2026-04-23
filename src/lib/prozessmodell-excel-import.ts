import * as XLSX from 'xlsx';

/**
 * Parser für ROTH-Prozessmodell-Excels (Daniel-Kaiser-Methodik, Pflichtenheft V1.1).
 *
 * Quelle: z.B. 20260306_Prozessmodell_AS_Aktualisiert.xlsx — enthält im Sheet
 * "Prozessmodell" mehrere Prozessblöcke (SE: Entladung Fernverkehr, SA: Beladung FV,
 * AMAZON: …). Jeder Block hat:
 *   - Mengen (Colli/Monat, Colli/Tag, Gefäße, Ankünfte, Arbeitstage, …)
 *   - Parameter (Anteile + Werte, z.B. Verteilweg, Geschwindigkeiten, Colli/Bewegung)
 *   - Prozessschritte (Nr, Abteilung, Hilfsmittel, Standardzeit, Prozessgröße, Anteil,
 *     Häufigkeit/Tag, Zeit gewichtet [Min/Colli])
 *
 * Ziel: Die vollständige ROTH-Methodik unverändert abbilden — nicht vereinfachen.
 * Die Excel-berechneten "Zeit gewichtet [Min/Colli]"-Werte werden direkt übernommen,
 * damit `summeMinProColli` exakt dem Excel-Referenzwert entspricht (Δ 0.0%).
 */

const COL = {
  blockHeader: 0,
  section: 1,
  nr: 2,
  beschreibung: 3,
  abteilung: 4,
  hilfsmittel: 5,
  wegM: 6,
  geschwindigkeitMs: 7,
  standardzeitSek: 8,
  zeitJeSchrittMin: 9,
  prozessgroesse: 10,
  anteil: 11,
  haeufigkeitJeTag: 12,
  zeitGewichtetMinProColli: 13,
  bemerkung: 14,
} as const;

export interface ImportedSchritt {
  nr: number;
  beschreibung: string;
  abteilung: string;
  hilfsmittel: string;
  wegM: number | null;
  geschwindigkeitMs: number | null;
  standardzeitSek: number | null;
  prozessgroesse: string;
  anteil: number | null;
  haeufigkeitJeTag: number | null;
  zeitGewichtetMinProColli: number;
  bemerkung: string;
}

export interface ImportedProzess {
  name: string;
  startRow: number;
  endRow: number;
  schritte: ImportedSchritt[];
  summeProAbteilung: Record<string, number>;
  summeMinProColli: number;
}

type Cell = string | number | boolean | null;
type Row = Cell[];

function isBlockHeader(value: Cell): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length < 5 || v.length > 80) return false;
  return /^(SE|SA|SI|AMAZON|SG)\s*:/i.test(v);
}

function asNumber(v: Cell): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return null;
}

function asString(v: Cell): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
}

/** Parst einen einzelnen Prozessblock ab `startRow` bis (exklusiv) `endRow`. */
function parseBlock(rows: Row[], startRow: number, endRow: number): ImportedProzess {
  const headerCell = asString(rows[startRow]?.[COL.blockHeader]);
  const schritte: ImportedSchritt[] = [];

  // Letzter bekannter Schritt — wird fortgeschrieben wenn eine Folgezeile (gleiche Nr,
  // nur alternative Hilfsmittel/Abteilung) keine eigene Nr. hat.
  let last: ImportedSchritt | null = null;

  for (let r = startRow + 1; r < endRow; r++) {
    const row = rows[r] ?? [];
    const zeit = asNumber(row[COL.zeitGewichtetMinProColli]);
    const nr = asNumber(row[COL.nr]);

    // Zeilen ohne Zeit-Wert überspringen (Mengen-/Parameter-Zeilen).
    if (zeit == null) continue;

    // Schritt-Zeile: hat Nr ODER ist Folgezeile mit Abteilung/Hilfsmittel
    const abt = asString(row[COL.abteilung]);
    const hilf = asString(row[COL.hilfsmittel]);
    const desc = asString(row[COL.beschreibung]);

    if (nr == null && abt === '' && hilf === '' && desc === '') continue;

    const schritt: ImportedSchritt = {
      nr: nr ?? last?.nr ?? 0,
      beschreibung: desc || last?.beschreibung || '',
      abteilung: abt || (nr == null ? last?.abteilung ?? '' : ''),
      hilfsmittel: hilf,
      wegM: asNumber(row[COL.wegM]),
      geschwindigkeitMs: asNumber(row[COL.geschwindigkeitMs]),
      standardzeitSek: asNumber(row[COL.standardzeitSek]),
      prozessgroesse: asString(row[COL.prozessgroesse]),
      anteil: asNumber(row[COL.anteil]),
      haeufigkeitJeTag: asNumber(row[COL.haeufigkeitJeTag]),
      zeitGewichtetMinProColli: zeit,
      bemerkung: asString(row[COL.bemerkung]),
    };

    schritte.push(schritt);
    last = schritt;
  }

  const summeProAbteilung: Record<string, number> = {};
  let summeMinProColli = 0;
  for (const s of schritte) {
    const key = s.abteilung || '(unbekannt)';
    summeProAbteilung[key] = (summeProAbteilung[key] ?? 0) + s.zeitGewichtetMinProColli;
    summeMinProColli += s.zeitGewichtetMinProColli;
  }

  return {
    name: headerCell,
    startRow,
    endRow,
    schritte,
    summeProAbteilung,
    summeMinProColli,
  };
}

/**
 * Parst alle Prozessblöcke aus dem "Prozessmodell"-Sheet einer ROTH-Excel.
 * Erkennt Blöcke an Col-A-Headern mit Präfix SE:/SA:/AMAZON: etc.
 */
export function parseProzessmodellSheet(rows: Row[]): ImportedProzess[] {
  // Finde alle Block-Starts
  const starts: number[] = [];
  for (let r = 0; r < rows.length; r++) {
    if (isBlockHeader(rows[r]?.[COL.blockHeader] ?? null)) starts.push(r);
  }
  if (starts.length === 0) return [];

  const blocks: ImportedProzess[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : rows.length;
    blocks.push(parseBlock(rows, start, end));
  }
  return blocks;
}

/**
 * Convenience-Funktion: liest ein Workbook (aus ArrayBuffer) und parst es.
 * Sucht nach dem Sheet "Prozessmodell" oder nimmt das erste Sheet mit Block-Header.
 */
export function parseProzessmodellWorkbook(buffer: ArrayBuffer | Uint8Array): ImportedProzess[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const preferred = wb.SheetNames.find((n) => n.toLowerCase() === 'prozessmodell');
  const candidates = preferred ? [preferred] : wb.SheetNames;

  for (const sheetName of candidates) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<Row>(sheet, { header: 1, raw: true, defval: null });
    const blocks = parseProzessmodellSheet(rows);
    if (blocks.length > 0) return blocks;
  }
  return [];
}
