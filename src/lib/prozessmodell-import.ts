import { xlsxToRows } from '@/lib/xlsx-utils';
import type { ProzessmodellConfig, ProzessParameter, Prozessschritt, AbteilungDefinition } from '@/types/prozessmodell';

// Farben für automatisch erkannte Abteilungen
const ABTEILUNGS_FARBEN = [
  '#ef4444', // rot
  '#3b82f6', // blau
  '#22c55e', // grün
  '#f59e0b', // amber
  '#a855f7', // lila
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#64748b', // slate
];

/**
 * Parst ein Prozessmodell aus einer Excel-Datei.
 *
 * Erwartetes Format im Sheet "Prozessmodell" (oder erstes Sheet):
 * - Spalten: Nr, Beschreibung, Abteilung, Hilfsmittel, Weg(m), Geschw.(m/s), Zeit(s), Anteil, Häufigkeit
 * - Sektionen erkennbar an "SE:" oder "SA:" oder Abteilungsnamen in eigener Zeile
 *
 * Sheet "Übersicht" (optional):
 * - Parameter wie arbeitsminProStunde, colliProTag etc.
 */
export async function parseProzessmodellExcel(file: File): Promise<{
  modell: ProzessmodellConfig;
  parameter: ProzessParameter[];
}> {
  // Zuerst Sheet-Namen lesen
  const { rows: firstRows, sheetNames } = await xlsxToRows(file);

  // Prozessmodell-Sheet finden
  const prozessSheet = sheetNames.find((n) =>
    n.toLowerCase().includes('prozess') || n.toLowerCase().includes('modell')
  ) || sheetNames[0];

  // Richtiges Sheet lesen (wenn nicht schon das erste)
  const { rows: prozessRows } = prozessSheet === sheetNames[0]
    ? { rows: firstRows }
    : await xlsxToRows(file, prozessSheet);

  if (prozessRows.length < 3) {
    throw new Error('Zu wenige Zeilen im Prozessmodell-Sheet');
  }

  // Header erkennen
  const headerRow = prozessRows.findIndex((row) =>
    row && row.some((cell) => {
      const s = String(cell || '').toLowerCase();
      return s.includes('nr') || s.includes('beschreibung') || s.includes('schritt');
    })
  );

  if (headerRow === -1) {
    throw new Error('Keine Header-Zeile gefunden (erwarte "Nr", "Beschreibung" etc.)');
  }

  const headers = (prozessRows[headerRow] || []).map((h) => String(h || '').toLowerCase().trim());

  const findIdx = (...candidates: string[]): number =>
    headers.findIndex((h) => candidates.some((c) => h.includes(c)));

  const nrIdx = findIdx('nr', 'nummer', '#', 'schritt');
  const beschreibungIdx = findIdx('beschreibung', 'name', 'tätigkeit', 'prozessschritt');
  const abteilungIdx = findIdx('abteilung', 'bereich', 'department');
  const hilfsmittelIdx = findIdx('hilfsmittel', 'mittel', 'werkzeug', 'tool');
  const wegIdx = findIdx('weg', 'distanz', 'meter', 'strecke');
  const geschwindigkeitIdx = findIdx('geschw', 'speed', 'v(m/s)', 'm/s');
  const zeitIdx = findIdx('zeit', 'dauer', 'time', 'sek', 'standardzeit');
  const anteilIdx = findIdx('anteil', 'häufigkeit anteil', 'ratio', 'share');
  const haeufigkeitIdx = findIdx('häufig', 'frequenz', 'frequency', 'mult');

  if (beschreibungIdx === -1) {
    throw new Error('Keine "Beschreibung"-Spalte gefunden');
  }

  // Schritte parsen
  const schritte: Prozessschritt[] = [];
  const abteilungenSet = new Map<string, string>(); // id → label
  let currentAbteilung = 'unbekannt';

  for (let i = headerRow + 1; i < prozessRows.length; i++) {
    const row = prozessRows[i];
    if (!row || row.every((c) => c == null || String(c).trim() === '')) continue;

    // Prüfe ob Abteilungs-Header (ganzes Row nur in einer Zelle Text)
    const nonEmpty = row.filter((c) => c != null && String(c).trim() !== '');
    if (nonEmpty.length === 1) {
      const text = String(nonEmpty[0]).trim();
      if (text.includes(':') || text.length > 3) {
        currentAbteilung = text.replace(/^(SE|SA)\s*:\s*/i, '').trim();
        const abtId = currentAbteilung.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (!abteilungenSet.has(abtId)) {
          abteilungenSet.set(abtId, currentAbteilung);
        }
        continue;
      }
    }

    // Normalen Schritt parsen
    const nr = nrIdx !== -1 ? Number(row[nrIdx]) || schritte.length + 1 : schritte.length + 1;
    const beschreibung = String(row[beschreibungIdx] || '').trim();
    if (!beschreibung) continue;

    const abteilung = abteilungIdx !== -1 && row[abteilungIdx]
      ? String(row[abteilungIdx]).trim()
      : currentAbteilung;

    const abtId = abteilung.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!abteilungenSet.has(abtId)) {
      abteilungenSet.set(abtId, abteilung);
    }

    const hilfsmittel = hilfsmittelIdx !== -1 && row[hilfsmittelIdx]
      ? String(row[hilfsmittelIdx]).trim()
      : '';

    const wegM = wegIdx !== -1 ? Number(row[wegIdx]) || 0 : 0;
    const geschwindigkeit = geschwindigkeitIdx !== -1 ? Number(row[geschwindigkeitIdx]) || 0 : 0;
    const standardzeit = zeitIdx !== -1 ? Number(row[zeitIdx]) || 0 : 0;
    const anteil = anteilIdx !== -1 ? Number(row[anteilIdx]) || 1 : 1;
    const haeufigkeit = haeufigkeitIdx !== -1 ? Number(row[haeufigkeitIdx]) || 1 : 1;

    schritte.push({
      nr,
      beschreibung,
      abteilung: abtId,
      hilfsmittel,
      wegM,
      wegAusLayout: false,
      geschwindigkeitMs: geschwindigkeit,
      standardzeitSek: standardzeit > 0 ? standardzeit : (wegM > 0 && geschwindigkeit > 0 ? wegM / geschwindigkeit : 0),
      anteil: anteil > 1 ? anteil / 100 : anteil, // Normalisierung: 100% → 1.0
      haeufigkeit,
    });
  }

  if (schritte.length === 0) {
    throw new Error('Keine Prozessschritte gefunden');
  }

  // Abteilungen-Array erzeugen
  const abteilungen: AbteilungDefinition[] = [];
  let colorIdx = 0;
  abteilungenSet.forEach((label, id) => {
    abteilungen.push({
      id,
      label,
      color: ABTEILUNGS_FARBEN[colorIdx % ABTEILUNGS_FARBEN.length],
    });
    colorIdx++;
  });

  // Prozesstyp erkennen
  const name = file.name.replace(/\.(xlsx|xls)$/i, '');
  const nameLower = name.toLowerCase();
  const prozessTyp: ProzessmodellConfig['prozessTyp'] =
    nameLower.includes('sa') && nameLower.includes('se') ? 'se_sa_kombi'
    : nameLower.includes('sa') ? 'sa'
    : nameLower.includes('se') ? 'se'
    : 'custom';

  const modell: ProzessmodellConfig = {
    id: `imported_${Date.now()}`,
    name: `Importiert: ${name}`,
    beschreibung: `Aus Excel importiert (${schritte.length} Schritte, ${abteilungen.length} Abteilungen)`,
    schritte,
    prozessTyp,
    abteilungen,
  };

  // Parameter aus "Übersicht" Sheet lesen (optional)
  const parameter: ProzessParameter[] = [];
  const uebersichtSheet = sheetNames.find((n) =>
    n.toLowerCase().includes('übersicht') || n.toLowerCase().includes('uebersicht') || n.toLowerCase().includes('parameter') || n.toLowerCase().includes('overview')
  );

  if (uebersichtSheet) {
    try {
      const { rows: paramRows } = await xlsxToRows(file, uebersichtSheet);
      for (const row of paramRows) {
        if (!row || row.length < 2) continue;
        const key = String(row[0] || '').toLowerCase().trim();
        const value = Number(row[1]);
        if (isNaN(value)) continue;

        if (key.includes('arbeitsmin')) {
          parameter.push({
            id: 'arbeitsminProStunde',
            name: 'Arbeitsminuten/Stunde',
            einheit: 'min',
            standardwert: 52.9,
            aktuellerWert: value,
            quelle: 'eingabe',
            kategorie: 'allgemein',
          });
        } else if (key.includes('colli') && key.includes('tag')) {
          parameter.push({
            id: 'colliProTag',
            name: 'Colli/Tag',
            einheit: 'Colli',
            standardwert: 15000,
            aktuellerWert: value,
            quelle: 'eingabe',
            kategorie: 'allgemein',
          });
        } else if (key.includes('verteilweg')) {
          parameter.push({
            id: 'verteilweg',
            name: 'Gewichteter Verteilweg',
            einheit: 'm',
            standardwert: 138.8,
            aktuellerWert: value,
            quelle: 'eingabe',
            kategorie: 'allgemein',
          });
        }
      }
    } catch {
      // Parameter-Sheet optional, Fehler ignorieren
    }
  }

  return { modell, parameter };
}
