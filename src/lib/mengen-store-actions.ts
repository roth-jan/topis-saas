/**
 * Lastenheft 3.2.1 — Prozess- und Mengenkategorien
 *
 * Reine Helper-Funktionen für das Mengen-Modell. Liefern neue Listen +
 * Counter-Updates zurück; modifizieren KEINEN State direkt. Werden im Store
 * via set((state) => helper(state, ...)) angewandt.
 *
 * Aufbau:
 *  - Prozesskategorien (Name + optionale Subprozesse)
 *  - MengenEinträge (pro Prozess/Subprozess/Relation: Anzahl + Packstück-Typ +
 *    Maße + stapelbar)
 *  - CSV-Import (Semikolon-CSV mit Header,
 *    Spalten: prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar)
 */

import type { Prozesskategorie, MengenEintrag, PackstueckTyp } from '@/types/topis';

export interface MengenSlice {
  prozesskategorien: Prozesskategorie[];
  prozesskategorieIdCounter: number;
  mengenEintraege: MengenEintrag[];
  mengenEintragIdCounter: number;
}

export const PACKSTUECK_TYPEN: PackstueckTyp[] = [
  'palette',
  'halbpalette',
  'chep',
  'gibo',
  'industriepalette',
  'colli',
  'sonstiges',
];

export function isPackstueckTyp(v: string): v is PackstueckTyp {
  return (PACKSTUECK_TYPEN as string[]).includes(v);
}

// ==================== PROZESSKATEGORIE ====================

/** Hängt eine neue Prozesskategorie an und gibt den nächsten Slice-Patch zurück. */
export function addProzesskategoriePatch(
  slice: MengenSlice,
  name: string,
  subprozesse?: string[]
): Pick<MengenSlice, 'prozesskategorien' | 'prozesskategorieIdCounter'> {
  const trimmed = name.trim();
  if (!trimmed) {
    return {
      prozesskategorien: slice.prozesskategorien,
      prozesskategorieIdCounter: slice.prozesskategorieIdCounter,
    };
  }
  const cleanedSubs = (subprozesse ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const next: Prozesskategorie = {
    id: slice.prozesskategorieIdCounter,
    name: trimmed,
    ...(cleanedSubs.length > 0 ? { subprozesse: cleanedSubs } : {}),
  };
  return {
    prozesskategorien: [...slice.prozesskategorien, next],
    prozesskategorieIdCounter: slice.prozesskategorieIdCounter + 1,
  };
}

export function updateProzesskategoriePatch(
  slice: MengenSlice,
  id: number,
  updates: Partial<Omit<Prozesskategorie, 'id'>>
): Pick<MengenSlice, 'prozesskategorien'> {
  const cleanedUpdates: Partial<Omit<Prozesskategorie, 'id'>> = { ...updates };
  if (cleanedUpdates.name !== undefined) cleanedUpdates.name = cleanedUpdates.name.trim();
  if (cleanedUpdates.subprozesse !== undefined) {
    const cleaned = cleanedUpdates.subprozesse.map((s) => s.trim()).filter((s) => s.length > 0);
    if (cleaned.length === 0) {
      delete cleanedUpdates.subprozesse;
    } else {
      cleanedUpdates.subprozesse = cleaned;
    }
  }
  return {
    prozesskategorien: slice.prozesskategorien.map((p) =>
      p.id === id ? { ...p, ...cleanedUpdates } : p
    ),
  };
}

/** Löscht eine Prozesskategorie und kaskadiert auf alle MengenEinträge, die
 * über den Kategorie-Namen referenziert werden. */
export function deleteProzesskategoriePatch(
  slice: MengenSlice,
  id: number
): Pick<MengenSlice, 'prozesskategorien' | 'mengenEintraege'> {
  const target = slice.prozesskategorien.find((p) => p.id === id);
  if (!target) {
    return {
      prozesskategorien: slice.prozesskategorien,
      mengenEintraege: slice.mengenEintraege,
    };
  }
  return {
    prozesskategorien: slice.prozesskategorien.filter((p) => p.id !== id),
    mengenEintraege: slice.mengenEintraege.filter((m) => m.prozess !== target.name),
  };
}

// ==================== MENGEN-EINTRAG ====================

export function addMengenEintragPatch(
  slice: MengenSlice,
  entry: Omit<MengenEintrag, 'id'>
): Pick<MengenSlice, 'mengenEintraege' | 'mengenEintragIdCounter'> {
  const next: MengenEintrag = { ...entry, id: slice.mengenEintragIdCounter };
  return {
    mengenEintraege: [...slice.mengenEintraege, next],
    mengenEintragIdCounter: slice.mengenEintragIdCounter + 1,
  };
}

export function updateMengenEintragPatch(
  slice: MengenSlice,
  id: number,
  updates: Partial<Omit<MengenEintrag, 'id'>>
): Pick<MengenSlice, 'mengenEintraege'> {
  return {
    mengenEintraege: slice.mengenEintraege.map((m) => (m.id === id ? { ...m, ...updates } : m)),
  };
}

export function deleteMengenEintragPatch(
  slice: MengenSlice,
  id: number
): Pick<MengenSlice, 'mengenEintraege'> {
  return {
    mengenEintraege: slice.mengenEintraege.filter((m) => m.id !== id),
  };
}

// ==================== CSV-IMPORT ====================

export interface CsvImportResult {
  patch: Pick<MengenSlice, 'mengenEintraege' | 'mengenEintragIdCounter'>;
  imported: number;
  skipped: number;
  warnings: string[];
  ersetzteProzesse: string[];
}

const EXPECTED_HEADERS = ['prozess', 'subprozess', 'relation', 'anzahl', 'typ', 'laenge', 'breite', 'hoehe', 'stapelbar'];

function isHeaderRow(cells: string[]): boolean {
  const lc = cells.map((c) => c.trim().toLowerCase());
  // Erste 5 Pflichtspalten reichen für Header-Erkennung
  return lc.slice(0, 5).join(';') === EXPECTED_HEADERS.slice(0, 5).join(';');
}

/** Akzeptiert deutsche Dezimal-Notation (Komma) und englische (Punkt). */
function parseNumber(raw: string): number | null {
  if (raw == null) return null;
  const cleaned = raw.trim().replace(/\./g, '').replace(',', '.');
  // Falls Eingabe Punkt als Dezimaltrenner verwendete und kein Tausenderpunkt war:
  // Erlaube zusätzlich reine Punkt-Notation (kein Komma vorhanden)
  if (!raw.includes(',')) {
    const v = parseFloat(raw.trim());
    if (Number.isFinite(v)) return v;
  }
  const v = parseFloat(cleaned);
  return Number.isFinite(v) ? v : null;
}

function parseBoolean(raw: string): boolean | undefined {
  if (raw == null) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === '') return undefined;
  if (['1', 'true', 'wahr', 'ja', 'j', 'y', 'yes', 'x'].includes(v)) return true;
  if (['0', 'false', 'falsch', 'nein', 'n', 'no'].includes(v)) return false;
  return undefined;
}

/**
 * Parst Semikolon-CSV und liefert einen Patch zur Anwendung im Store.
 *
 * Modus:
 *  - 'append': Neue Einträge werden an die bestehende Liste angehängt.
 *  - 'replace': Vor dem Anhängen werden alle existierenden Einträge gelöscht,
 *    deren `prozess` in der CSV vorkommt. Andere Prozesse bleiben unberührt.
 *
 * Zeilen mit ungültigem PackstueckTyp oder fehlenden Pflichtfeldern werden
 * übersprungen und in `warnings` gemeldet.
 */
export function importMengenFromCsv(
  slice: MengenSlice,
  csvText: string,
  modus: 'append' | 'replace'
): CsvImportResult {
  const warnings: string[] = [];
  let imported = 0;
  let skipped = 0;

  const rawLines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (rawLines.length === 0) {
    return {
      patch: {
        mengenEintraege: slice.mengenEintraege,
        mengenEintragIdCounter: slice.mengenEintragIdCounter,
      },
      imported: 0,
      skipped: 0,
      warnings: ['Leere CSV.'],
      ersetzteProzesse: [],
    };
  }

  // Header erkennen + überspringen
  const firstCells = rawLines[0].split(';');
  const startIndex = isHeaderRow(firstCells) ? 1 : 0;

  let counter = slice.mengenEintragIdCounter;
  const newEntries: MengenEintrag[] = [];
  const ersetzteProzesseSet = new Set<string>();

  for (let lineIdx = startIndex; lineIdx < rawLines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const cells = rawLines[lineIdx].split(';');
    if (cells.length < 5) {
      warnings.push(`Zeile ${lineNum}: zu wenige Spalten (${cells.length}) — übersprungen`);
      skipped++;
      continue;
    }
    const [prozessRaw, subprozessRaw, relationRaw, anzahlRaw, typRaw, laengeRaw, breiteRaw, hoeheRaw, stapelbarRaw] = cells;
    const prozess = (prozessRaw ?? '').trim();
    const subprozess = (subprozessRaw ?? '').trim();
    const relation = (relationRaw ?? '').trim();
    const typ = (typRaw ?? '').trim().toLowerCase();

    if (!prozess) {
      warnings.push(`Zeile ${lineNum}: Prozess fehlt — übersprungen`);
      skipped++;
      continue;
    }
    if (!relation) {
      warnings.push(`Zeile ${lineNum}: Relation fehlt — übersprungen`);
      skipped++;
      continue;
    }
    if (!isPackstueckTyp(typ)) {
      warnings.push(`Zeile ${lineNum}: ungültiger Packstück-Typ "${typRaw}" — übersprungen`);
      skipped++;
      continue;
    }
    const anzahl = parseNumber(anzahlRaw ?? '');
    if (anzahl === null) {
      warnings.push(`Zeile ${lineNum}: ungültige Anzahl "${anzahlRaw}" — übersprungen`);
      skipped++;
      continue;
    }
    // Anzahl auf 2 NK runden (Lastenheft 3.2.1)
    const anzahlRounded = Math.round(anzahl * 100) / 100;

    const eintrag: MengenEintrag = {
      id: counter++,
      prozess,
      relation,
      anzahl: anzahlRounded,
      typ,
    };
    if (subprozess) eintrag.subprozess = subprozess;
    const laenge = parseNumber(laengeRaw ?? '');
    const breite = parseNumber(breiteRaw ?? '');
    const hoehe = parseNumber(hoeheRaw ?? '');
    if (laenge !== null) eintrag.laenge = laenge;
    if (breite !== null) eintrag.breite = breite;
    if (hoehe !== null) eintrag.hoehe = hoehe;
    const stapelbar = parseBoolean(stapelbarRaw ?? '');
    if (stapelbar !== undefined) eintrag.stapelbar = stapelbar;

    newEntries.push(eintrag);
    ersetzteProzesseSet.add(prozess);
    imported++;
  }

  const ersetzteProzesse = Array.from(ersetzteProzesseSet);

  let basis = slice.mengenEintraege;
  if (modus === 'replace') {
    basis = basis.filter((m) => !ersetzteProzesseSet.has(m.prozess));
  }

  return {
    patch: {
      mengenEintraege: [...basis, ...newEntries],
      mengenEintragIdCounter: counter,
    },
    imported,
    skipped,
    warnings,
    ersetzteProzesse,
  };
}

// ==================== CSV-EXPORT ====================

function csvEscape(v: string): string {
  if (v.includes(';') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/** Erzeugt eine Semikolon-CSV mit Header. Zahlen mit Punkt-Dezimal (für
 * Round-Trip-Kompatibilität sowohl mit deutschen als auch englischen Excel-
 * Versionen reicht der Punkt; der Import akzeptiert beides). */
export function exportMengenAsCsv(entries: MengenEintrag[]): string {
  const lines: string[] = [EXPECTED_HEADERS.join(';')];
  for (const m of entries) {
    const row = [
      csvEscape(m.prozess),
      csvEscape(m.subprozess ?? ''),
      csvEscape(m.relation),
      String(m.anzahl),
      m.typ,
      m.laenge != null ? String(m.laenge) : '',
      m.breite != null ? String(m.breite) : '',
      m.hoehe != null ? String(m.hoehe) : '',
      m.stapelbar == null ? '' : m.stapelbar ? 'ja' : 'nein',
    ];
    lines.push(row.join(';'));
  }
  return lines.join('\n');
}
