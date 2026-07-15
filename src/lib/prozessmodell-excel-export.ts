import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';

/**
 * Excel-Roundtrip: schreibt geänderte Zellwerte in die ORIGINAL-Datei zurück.
 *
 * Ansatz: xlsx = Zip. Wir entpacken die Original-Mappe, ersetzen NUR die
 * `<v>`-Werte der überschriebenen Konstanten-Zellen in den Sheet-XMLs und
 * setzen `fullCalcOnLoad`, damit Excel beim Öffnen alle Formeln neu rechnet.
 * Alles andere (Formeln, Formatierung, Druckbereiche, Kommentare …) bleibt
 * unangetastet — volle Datei-Treue, die SheetJS-Write nicht bieten kann.
 *
 * Voraussetzung (per Konstruktion erfüllt): Overrides zielen ausschließlich
 * auf Konstanten-Zellen (Mengen in `Dateneingabe`, Parameter-Zellen ohne
 * Formel) — nie auf Formelzellen.
 */

export interface ExportOverride {
  sheet: string;
  addr: string; // "C7"
  value: number | string | boolean | null;
}

export interface ExportErgebnis {
  datei: Uint8Array;
  ersetzteZellen: number;
  nichtGefunden: { sheet: string; addr: string }[];
}

/** Sheet-Name → Pfad im Zip (xl/worksheets/sheetN.xml) über workbook.xml + rels. */
function sheetPfade(dateien: Record<string, Uint8Array>): Map<string, string> {
  const workbook = strFromU8(dateien['xl/workbook.xml']);
  const rels = strFromU8(dateien['xl/_rels/workbook.xml.rels']);

  // rId → Ziel (worksheets/sheet2.xml)
  const relZiel = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>(?:<\/Relationship>)?/g)) {
    relZiel.set(m[1], m[2]);
  }
  // Manche Dateien haben die Attribute in anderer Reihenfolge
  for (const m of rels.matchAll(/<Relationship[^>]*Target="([^"]+)"[^>]*Id="([^"]+)"[^>]*\/?>/g)) {
    if (!relZiel.has(m[2])) relZiel.set(m[2], m[1]);
  }

  const map = new Map<string, string>();
  for (const m of workbook.matchAll(/<sheet[^>]*\/?>/g)) {
    const tag = m[0];
    const name = /name="([^"]+)"/.exec(tag)?.[1];
    const rid = /r:id="([^"]+)"/.exec(tag)?.[1];
    if (!name || !rid) continue;
    const ziel = relZiel.get(rid);
    if (!ziel) continue;
    const pfad = ziel.startsWith('/') ? ziel.slice(1) : `xl/${ziel}`;
    map.set(entschaerfeXmlEntities(name), pfad);
  }
  return map;
}

function entschaerfeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function zahlAlsXml(value: ExportOverride['value']): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(',', '.'));
    if (Number.isFinite(n)) return String(n);
  }
  return '0';
}

/** Ersetzt in einem Sheet-XML den Wert einer Zelle (Konstante). */
function patchZelle(xml: string, addr: string, wert: string): string | null {
  const a = escapeRegex(addr);
  // Zelle mit Inhalt: <c r="C7" ...>...</c> — inneres <v> ersetzen, <f> (falls da) entfernen.
  const voll = new RegExp(`(<c\\s+r="${a}"(?:\\s[^>]*)?>)([\\s\\S]*?)(</c>)`);
  const mVoll = voll.exec(xml);
  if (mVoll) {
    // t="s" (Shared String) / t="str" wäre ein Typkonflikt → Typ-Attribut entfernen (Zahl).
    const kopf = mVoll[1].replace(/\s+t="[^"]*"/, '');
    return xml.replace(voll, `${kopf}<v>${wert}</v>$3`);
  }
  // Leere/selbstschließende Zelle: <c r="C7" s="3"/>
  const leer = new RegExp(`<c\\s+r="${a}"((?:\\s[^>]*)?)/>`);
  const mLeer = leer.exec(xml);
  if (mLeer) {
    const attrs = mLeer[1].replace(/\s+t="[^"]*"/, '');
    return xml.replace(leer, `<c r="${addr}"${attrs}><v>${wert}</v></c>`);
  }
  return null;
}

/** Setzt fullCalcOnLoad, damit Excel beim Öffnen ALLE Formeln neu rechnet
 * (die gecachten Formelwerte in der Datei sind nach dem Patch veraltet). */
function patchCalcPr(dateien: Record<string, Uint8Array>): void {
  let workbook = strFromU8(dateien['xl/workbook.xml']);
  if (/<calcPr[^>]*fullCalcOnLoad="1"/.test(workbook)) {
    return;
  }
  if (/<calcPr[^>]*\/>/.test(workbook)) {
    workbook = workbook.replace(/<calcPr([^>]*)\/>/, '<calcPr$1 fullCalcOnLoad="1"/>');
  } else {
    workbook = workbook.replace('</workbook>', '<calcPr fullCalcOnLoad="1"/></workbook>');
  }
  dateien['xl/workbook.xml'] = strToU8(workbook);
}

/**
 * Schreibt Overrides in die Original-xlsx zurück (Zip-Patch, volle Datei-Treue).
 * Gibt die neue Datei + Statistik zurück; nicht auffindbare Zellen werden
 * gemeldet statt still verschluckt.
 */
export function exportiereMitOverrides(original: ArrayBuffer, overrides: ExportOverride[]): ExportErgebnis {
  const dateien = unzipSync(new Uint8Array(original));
  if (!dateien['xl/workbook.xml']) throw new Error('Keine gültige xlsx-Datei (xl/workbook.xml fehlt)');
  const pfade = sheetPfade(dateien);

  let ersetzt = 0;
  const nichtGefunden: { sheet: string; addr: string }[] = [];
  // Sheet-XMLs nur einmal dekodieren/patchen
  const geaendert = new Map<string, string>();

  for (const o of overrides) {
    const pfad = pfade.get(o.sheet);
    if (!pfad || !dateien[pfad]) {
      nichtGefunden.push({ sheet: o.sheet, addr: o.addr });
      continue;
    }
    const xml = geaendert.get(pfad) ?? strFromU8(dateien[pfad]);
    const neu = patchZelle(xml, o.addr, zahlAlsXml(o.value));
    if (neu == null) {
      nichtGefunden.push({ sheet: o.sheet, addr: o.addr });
      continue;
    }
    geaendert.set(pfad, neu);
    ersetzt++;
  }

  for (const [pfad, xml] of geaendert) dateien[pfad] = strToU8(xml);
  if (ersetzt > 0) patchCalcPr(dateien);

  return { datei: zipSync(dateien), ersetzteZellen: ersetzt, nichtGefunden };
}

/** Browser-Download einer exportierten Datei. */
export function downloadXlsx(datei: Uint8Array, dateiname: string): void {
  const blob = new Blob([datei.slice().buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  a.click();
  URL.revokeObjectURL(url);
}
