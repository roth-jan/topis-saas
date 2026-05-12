import * as XLSX from 'xlsx';

/**
 * Excel-Datum (Serial Number) in ISO-String konvertieren.
 * Excel speichert Daten als Tage seit 1900-01-01 (mit dem 1900-Bug).
 */
export function excelDateToISO(serial: number): string {
  // Excel 1900 date system: serial 1 = 1900-01-01
  // Bug: Excel denkt 1900 war ein Schaltjahr, daher -1 ab serial > 60
  const utcDays = serial - 25569; // 25569 = Tage von 1900-01-01 bis 1970-01-01
  const utcMs = utcDays * 86400000;
  const d = new Date(utcMs);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Excel-Zeitwert (Dezimalzahl 0.0 - 1.0) in HH:MM konvertieren.
 * z.B. 0.5 → "12:00", 0.125 → "03:00"
 */
export function excelTimeToHHMM(decimal: number): string {
  const totalMinutes = Math.round(decimal * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * XLSX-Datei lesen und als CSV-Text zurückgeben.
 * Bei Multi-Sheet: gibt alle Sheet-Namen zurück.
 */
export async function xlsxToCSV(
  file: File
): Promise<{ csvText: string; sheetNames: string[]; activeSheet: string }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  const activeSheet = sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];

  const csvText = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

  return { csvText, sheetNames, activeSheet };
}

/**
 * Bestimmtes Sheet einer XLSX-Datei als CSV-Text zurückgeben.
 */
export async function xlsxSheetToCSV(
  file: File,
  sheetName: string
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" nicht gefunden`);
  }

  return XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
}

/**
 * XLSX-Datei lesen und als 2D-Array zurückgeben (für Spezial-Parsing).
 */
export async function xlsxToRows(
  file: File,
  sheetName?: string
): Promise<{ rows: (string | number | null)[][]; sheetNames: string[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  const sheet = sheetName || sheetNames[0];
  const worksheet = workbook.Sheets[sheet];

  if (!worksheet) {
    throw new Error(`Sheet "${sheet}" nicht gefunden`);
  }

  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  return { rows, sheetNames };
}

/**
 * Produktivstunden-Excel parsen: Stunde → MA-Anzahl.
 * Erwartet eine Tabelle mit Spalten wie "Stunde" und "MA" oder "Mitarbeiter".
 */
export async function parseProduktivstundenExcel(
  file: File
): Promise<Record<number, number>> {
  const { rows } = await xlsxToRows(file);
  const result: Record<number, number> = {};

  if (rows.length < 2) return result;

  // Header finden
  const headers = (rows[0] || []).map((h) =>
    String(h || '').toLowerCase().trim()
  );

  // Spaltenindizes finden
  const stundeIdx = headers.findIndex((h) =>
    ['stunde', 'hour', 'uhrzeit', 'zeit', 'h'].includes(h)
  );
  const maIdx = headers.findIndex((h) =>
    ['ma', 'mitarbeiter', 'ist', 'ist-ma', 'istma', 'fte', 'anzahl', 'personal'].includes(h)
  );

  /**
   * Zellenwert in Integer-Stunde (0-23) konvertieren.
   * Akzeptiert: 6, "06:00", 0.25 (Excel-Dezimalzeit = 06:00), "6"
   */
  const parseStunde = (val: string | number | null): number | null => {
    if (val == null) return null;
    if (typeof val === 'number') {
      // Excel-Dezimalzeit: 0.0-1.0 → Stunde 0-23
      if (val >= 0 && val < 1) {
        return Math.floor(val * 24);
      }
      // Bereits Integer-Stunde
      if (Number.isInteger(val) && val >= 0 && val <= 23) {
        return val;
      }
      // Excel serial date+time (>1): Zeitteil extrahieren
      if (val >= 1) {
        const timePart = val % 1;
        return Math.floor(timePart * 24);
      }
      return null;
    }
    // String: "06:00" oder "6"
    const str = String(val).trim();
    const timeMatch = str.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1]);
      return h >= 0 && h <= 23 ? h : null;
    }
    const num = parseInt(str);
    return !isNaN(num) && num >= 0 && num <= 23 ? num : null;
  };

  if (stundeIdx === -1 || maIdx === -1) {
    // Fallback: Erste Spalte = Stunde, zweite = MA
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;
      const stunde = parseStunde(row[0]);
      const ma = Number(row[1]);
      if (stunde !== null && !isNaN(ma) && ma > 0) {
        result[stunde] = ma;
      }
    }
    return result;
  }

  // Mit erkannten Spalten parsen
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const stunde = parseStunde(row[stundeIdx]);
    const ma = Number(row[maIdx]);
    if (stunde !== null && !isNaN(ma) && ma > 0) {
      result[stunde] = ma;
    }
  }

  return result;
}

/**
 * Prüft ob eine Datei eine Excel-Datei ist (nach Extension).
 */
export function isExcelFile(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext === 'xlsx' || ext === 'xls';
}
