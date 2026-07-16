import { evalAusdruck } from './prozessmodell-excel-engine';
import type { AsProzessModell, ModellBlock, ModellGroesse, ModellSchritt } from './prozessmodell-excel-modell';

/**
 * NATIVES Prozessmodell — TOPIS als bessere Excel.
 *
 * Das Modell lebt hier als eigene, voll editierbare Struktur (nicht mehr als
 * gerechnete Datei): ein globaler Namensraum aus Knoten (Mengen, Parameter,
 * interne Ableitungen), Blöcke mit Schritten, Übersicht. Ausdrücke sind
 * Excel-Syntax mit benannten Referenzen (`_xE6` = Knoten, `_s50` = Anteil
 * eines Schritts, `_AT` = Arbeitstage) — ausgewertet vom selben verifizierten
 * Recursive-Descent-Parser wie die Excel-Engine.
 *
 * Entsteht per Excel-Import (Konverter), aus Vorlagen oder von Hand — und
 * MUSS beim Import dieselben Endwerte liefern wie die Datei (18/18 Δ=0,
 * Gate-Test in prozessmodell-nativ.test.ts).
 */

// ---------------------------------------------------------------------------
// Datenmodell (JSON-serialisierbar → Cloud/localStorage)
// ---------------------------------------------------------------------------

export interface NativKnoten {
  id: string; // "_xE6" (Import) oder "_k1" (neu)
  name: string | null; // sichtbarer Name; null = interner Ableitungsknoten
  region: 'menge' | 'parameter' | 'intern';
  blockId: string | null;
  /** Eingabewert (editierbar), wenn kein Ausdruck. */
  wert: number | null;
  /** Ausdruck (abgeleitet); hat Vorrang vor `wert`. */
  expr: string | null;
  /** Herkunftszelle in der Original-Excel (für Export-Diffs). */
  origin: { sheet: string; addr: string } | null;
}

export interface NativSchritt {
  id: string; // "_s50" (Import) oder "_n1" (neu angelegt)
  nr: number | null;
  name: string;
  abteilung: string;
  wegM: number | string | null; // Zahl ODER Ausdruck
  geschwMs: number | string | null;
  standardSek: number | string | null;
  anteil: number | string;
  /** Häufigkeit/Tag als voller Ausdruck (enthält i.d.R. `_s{id}*…`). */
  haeufigkeitExpr: string;
}

export interface NativBlock {
  id: string; // "b0"…
  name: string;
  /** Divisor der Gewichtung (i.d.R. Colli je Tag), z.B. "_xF6". */
  basisExpr: string | null;
  schritte: NativSchritt[];
}

export interface NativUebersichtEintrag {
  sektion: string; // "Sammelguteingang" | "Sammelgutausgang"
  name: string;
  mengeExpr: string | null;
  blockId: string | null; // Min/Colli-Quelle; null → 0
}

export interface NativesProzessmodell {
  version: 1;
  name: string;
  monat: string;
  arbeitstage: number;
  arbeitsminProStunde: number;
  knoten: NativKnoten[];
  bloecke: NativBlock[];
  uebersicht: NativUebersichtEintrag[];
  sonstige: { sektion: string; name: string; maStunden: number }[];
  nextId: number; // Zähler für neue Knoten/Schritte
}

// ---------------------------------------------------------------------------
// Rechner
// ---------------------------------------------------------------------------

export interface NativErgebnis {
  /** View-Modell in der Form, die das Cockpit-UI bereits kennt. */
  modell: AsProzessModell;
  warnungen: string[];
}

/** Rechnet das native Modell komplett durch und liefert das UI-View-Modell. */
export function rechneNativesModell(m: NativesProzessmodell): NativErgebnis {
  const warnungen: string[] = [];
  const knotenById = new Map(m.knoten.map((k) => [k.id, k]));
  const schrittById = new Map<string, NativSchritt>();
  for (const b of m.bloecke) for (const s of b.schritte) schrittById.set(s.id, s);

  const memo = new Map<string, number>();
  const laufend = new Set<string>();

  const resolve = (name: string): number | undefined => {
    if (name === '_AT') return m.arbeitstage;
    if (knotenById.has(name)) return knotenWert(name);
    if (schrittById.has(name)) return schrittAnteil(name);
    return undefined; // unbekannt → Parser meldet
  };

  const evalExpr = (expr: string, kontext: string): number => {
    try {
      return evalAusdruck(expr, resolve);
    } catch (e) {
      warnungen.push(`${kontext}: ${(e as Error).message}`);
      return 0;
    }
  };

  const knotenWert = (id: string): number => {
    const hit = memo.get(id);
    if (hit !== undefined) return hit;
    if (laufend.has(id)) {
      warnungen.push(`Zyklus bei ${id}`);
      return 0;
    }
    laufend.add(id);
    const k = knotenById.get(id)!;
    const v = k.expr != null ? evalExpr(k.expr, `Knoten ${k.name ?? id}`) : k.wert ?? 0;
    laufend.delete(id);
    memo.set(id, v);
    return v;
  };

  const schrittAnteil = (id: string): number => {
    const key = `s:${id}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    if (laufend.has(key)) {
      warnungen.push(`Zyklus bei Schritt-Anteil ${id}`);
      return 0;
    }
    laufend.add(key);
    const s = schrittById.get(id)!;
    const v = typeof s.anteil === 'number' ? s.anteil : evalExpr(s.anteil, `Anteil ${s.name}`);
    laufend.delete(key);
    memo.set(key, v);
    return v;
  };

  const feldWert = (f: number | string | null, kontext: string): number | null => {
    if (f == null) return null;
    return typeof f === 'number' ? f : evalExpr(f, kontext);
  };

  // Blöcke rechnen (Struktur exakt wie die verifizierte Referenz:
  // J=(G/H+I)/60 bzw. I/60 · M=Häufigkeits-Ausdruck · N=J·M/Basis)
  const uiBloecke: ModellBlock[] = m.bloecke.map((b, bi) => {
    const basis = b.basisExpr ? evalExpr(b.basisExpr, `Basis ${b.name}`) : 0;
    // Silent-Failure-Schutz: Ein Block mit echten Schrittzeiten aber ohne
    // Basis-Divisor würde still 0 liefern — das MUSS der Nutzer sehen.
    if (basis === 0 && b.schritte.some((s) => (typeof s.standardSek === 'number' && s.standardSek > 0) || s.wegM != null)) {
      warnungen.push(
        `Block „${b.name}": keine Mengen-Basis (Colli je Tag) ${b.basisExpr ? 'berechenbar (= 0)' : 'erkannt'} — Min/Colli wird 0 gerechnet.`,
      );
    }
    const schritte: ModellSchritt[] = [];
    const proAbteilung: Record<string, number> = {};
    let sum = 0;
    b.schritte.forEach((s, si) => {
      const G = feldWert(s.wegM, `Weg ${s.name}`);
      const H = feldWert(s.geschwMs, `Geschw ${s.name}`);
      const I = feldWert(s.standardSek, `Zeit ${s.name}`) ?? 0;
      const J = G != null && G !== 0 && H != null && H !== 0 ? (G / H + I) / 60 : I / 60;
      const M = evalExpr(s.haeufigkeitExpr, `Häufigkeit ${s.name}`);
      const N = basis ? (J * M) / basis : 0;
      sum += N;
      proAbteilung[s.abteilung] = (proAbteilung[s.abteilung] ?? 0) + N;
      schritte.push({
        nr: s.nr ?? 0,
        name: s.name,
        abteilung: s.abteilung,
        wegM: G,
        geschwMs: H,
        standardSek: I,
        anteil: schrittAnteil(s.id),
        haeufigkeitJeTag: M,
        zeitJeSchrittMin: J,
        minProColli: N,
        row: 100000 + bi * 1000 + si, // stabile UI-Keys
        nativId: s.id,
      });
    });
    // Sichtbare Größen dieses Blocks (Mengen + Parameter)
    const mengen: ModellGroesse[] = [];
    const parameter: ModellGroesse[] = [];
    m.knoten.forEach((k, ki) => {
      if (k.blockId !== b.id || k.region === 'intern' || !k.name) return;
      const g: ModellGroesse = {
        name: k.name,
        row: 200000 + ki,
        region: k.region as 'menge' | 'parameter',
        wert: knotenWert(k.id),
        origin: k.origin,
        editierbar: k.expr == null,
        abgeleitet: k.expr != null,
        nativId: k.id,
      };
      (k.region === 'menge' ? mengen : parameter).push(g);
    });
    return {
      name: b.name,
      startRow: 0,
      headerRow: 0,
      endRow: 0,
      mengen,
      parameter,
      schritte,
      minProColli: sum,
      proAbteilung,
      nativId: b.id,
    } as ModellBlock;
  });

  // Übersicht (MA-Stunden)
  const blockSum = new Map(m.bloecke.map((b, i) => [b.id, uiBloecke[i].minProColli]));
  const sektionen = new Map<string, { titel: string; prozesse: { name: string; menge: number; minProColli: number; maStunden: number }[]; sonstige: { name: string; maStunden: number }[]; summeProzesse: number }>();
  const sektion = (titel: string) => {
    let s = sektionen.get(titel);
    if (!s) {
      s = { titel, prozesse: [], sonstige: [], summeProzesse: 0 };
      sektionen.set(titel, s);
    }
    return s;
  };
  for (const e of m.uebersicht) {
    const menge = e.mengeExpr ? evalExpr(e.mengeExpr, `Übersicht ${e.name}`) : 0;
    const minColli = e.blockId ? blockSum.get(e.blockId) ?? 0 : 0;
    const maStunden = (menge * minColli) / m.arbeitsminProStunde;
    const s = sektion(e.sektion);
    s.prozesse.push({ name: e.name, menge, minProColli: minColli, maStunden });
    s.summeProzesse += maStunden;
  }
  for (const so of m.sonstige) sektion(so.sektion).sonstige.push({ name: so.name, maStunden: so.maStunden });

  const uebersicht = [...sektionen.values()];
  const maStundenProzesse = uebersicht.reduce((a, s) => a + s.summeProzesse, 0);

  return {
    modell: {
      bloecke: uiBloecke,
      uebersicht,
      arbeitsminutenJeStunde: m.arbeitsminProStunde,
      maStundenProzesse,
      monat: m.monat,
    },
    warnungen,
  };
}

// ---------------------------------------------------------------------------
// Mutationen (geben NEUE Modell-Objekte zurück — React-freundlich)
// ---------------------------------------------------------------------------

export function setzeKnotenWert(m: NativesProzessmodell, knotenId: string, wert: number): NativesProzessmodell {
  return {
    ...m,
    knoten: m.knoten.map((k) => (k.id === knotenId && k.expr == null ? { ...k, wert } : k)),
  };
}

export function setzeArbeitstage(m: NativesProzessmodell, arbeitstage: number): NativesProzessmodell {
  return { ...m, arbeitstage };
}

export type SchrittFeld = 'name' | 'abteilung' | 'wegM' | 'geschwMs' | 'standardSek' | 'anteil';

/** Ändert ein Schritt-Feld. Zahlenfelder ersetzen einen evtl. Ausdruck durch die Zahl (wie Excel: Formel überschreiben). */
export function setzeSchrittFeld(
  m: NativesProzessmodell,
  schrittId: string,
  feld: SchrittFeld,
  wert: string | number | null,
): NativesProzessmodell {
  return {
    ...m,
    bloecke: m.bloecke.map((b) => ({
      ...b,
      schritte: b.schritte.map((s) => (s.id === schrittId ? { ...s, [feld]: wert } : s)),
    })),
  };
}

/** Neuer Schritt: Häufigkeit = Anteil × Blockbasis (je Colli), Standardzeit 0. */
export function neuerSchritt(m: NativesProzessmodell, blockId: string, nachSchrittId?: string): NativesProzessmodell {
  const id = `_n${m.nextId}`;
  return {
    ...m,
    nextId: m.nextId + 1,
    bloecke: m.bloecke.map((b) => {
      if (b.id !== blockId) return b;
      const s: NativSchritt = {
        id,
        nr: null,
        name: 'Neuer Prozessschritt',
        abteilung: b.schritte[b.schritte.length - 1]?.abteilung ?? 'Entlader',
        wegM: null,
        geschwMs: null,
        standardSek: 0,
        anteil: 1,
        haeufigkeitExpr: b.basisExpr ? `${id}*(${b.basisExpr})` : `${id}`,
      };
      const idx = nachSchrittId ? b.schritte.findIndex((x) => x.id === nachSchrittId) : b.schritte.length - 1;
      const schritte = [...b.schritte];
      schritte.splice(idx + 1, 0, s);
      return { ...b, schritte };
    }),
  };
}

/** Ersetzt `_s{id}`-Referenzen (mit Zahlgrenze, damit _s20 nicht _s200 trifft)
 * in einem Ausdruck durch den eingefrorenen Zahlenwert. */
function ersetzeSchrittRef(expr: string, schrittId: string, wert: number): string {
  const re = new RegExp(schrittId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![0-9])', 'g');
  return expr.replace(re, `(${wert})`);
}

export function loescheSchritt(m: NativesProzessmodell, schrittId: string): NativesProzessmodell {
  // Andere Ausdrücke können den Anteil dieses Schritts referenzieren (der
  // Konverter erzeugt solche `_s`-Bezüge systematisch aus L-Zellrefs).
  // Excel-Semantik beim Löschen: Referenzen werden durch den letzten WERT
  // ersetzt (Formel → Wert), statt still auf 0 zu fallen.
  const erg = rechneNativesModell(m);
  let anteilWert = 0;
  for (const b of erg.modell.bloecke) {
    const s = b.schritte.find((x) => x.nativId === schrittId);
    if (s) { anteilWert = s.anteil; break; }
  }
  const fix = (f: number | string | null): number | string | null =>
    typeof f === 'string' ? ersetzeSchrittRef(f, schrittId, anteilWert) : f;

  return {
    ...m,
    knoten: m.knoten.map((k) => (k.expr != null ? { ...k, expr: ersetzeSchrittRef(k.expr, schrittId, anteilWert) } : k)),
    bloecke: m.bloecke.map((b) => ({
      ...b,
      basisExpr: b.basisExpr != null ? ersetzeSchrittRef(b.basisExpr, schrittId, anteilWert) : b.basisExpr,
      schritte: b.schritte
        .filter((s) => s.id !== schrittId)
        .map((s) => ({
          ...s,
          anteil: typeof s.anteil === 'string' ? ersetzeSchrittRef(s.anteil, schrittId, anteilWert) : s.anteil,
          haeufigkeitExpr: ersetzeSchrittRef(s.haeufigkeitExpr, schrittId, anteilWert),
          wegM: fix(s.wegM),
          geschwMs: fix(s.geschwMs),
          standardSek: fix(s.standardSek),
        })),
    })),
  };
}

// ---------------------------------------------------------------------------
// Monats-Rhythmus: neuer Monat ohne Datei (Mengen-Formular)
// ---------------------------------------------------------------------------

/** Ein monatliches Eingabefeld — ggf. von mehreren Knoten geteilt (gleiche Herkunftszelle). */
export interface MonatsEingabe {
  key: string;
  name: string;
  wert: number;
  knotenIds: string[];
  blockId?: string;
}

/** Alle monatlichen Eingaben des Modells (Mengen + Dateneingabe-Herkünfte),
 * dedupliziert über die Herkunftszelle. Zeitaufnahme-Parameter gehören NICHT
 * dazu — die ändern sich nicht monatlich. */
export function listeMonatsEingaben(m: NativesProzessmodell): MonatsEingabe[] {
  const blockName = new Map(m.bloecke.map((b) => [b.id, b.name]));
  const gruppen = new Map<string, MonatsEingabe>();
  const namenZaehler = new Map<string, number>();
  for (const k of m.knoten) {
    if (k.expr != null || k.wert == null) continue;
    const monatlich = k.region === 'menge' || k.origin?.sheet === 'Dateneingabe';
    if (!monatlich) continue;
    const key = k.origin ? `${k.origin.sheet}!${k.origin.addr}` : k.id;
    const g = gruppen.get(key);
    if (g) {
      g.knotenIds.push(k.id);
      if (k.name && (g.name.startsWith('_') || g.name.includes('!'))) g.name = k.name;
    } else {
      // Mehrdeutige Namen (z.B. beide SE+SA haben „Colli je Monat", Fund #13)
      // mit dem Blocknamen disambiguieren.
      const name = k.name ?? key;
      if (k.name && k.blockId) {
        namenZaehler.set(k.name, (namenZaehler.get(k.name) ?? 0) + 1);
      }
      gruppen.set(key, { key, name, wert: k.wert, knotenIds: [k.id], blockId: k.blockId ?? undefined });
    }
  }
  const eingaben = [...gruppen.values()];
  // Nur wo derselbe Name mehrfach vorkommt: Blockname voranstellen.
  const mehrfach = new Set([...namenZaehler.entries()].filter(([, n]) => n > 1).map(([n]) => n));
  return eingaben.map((e) =>
    mehrfach.has(e.name) && e.blockId
      ? { ...e, name: `${kurz(blockName.get(e.blockId) ?? '')} · ${e.name}` }
      : e,
  );
}

/** Blockname für die Anzeige kürzen: „SE: Entladung …" → „SE". */
function kurz(name: string): string {
  const m = /^(SE|SA|SI|SG|AMAZON)\b/i.exec(name);
  return m ? m[1].toUpperCase() : name.slice(0, 14);
}

/** Neuen Monat aus dem aktuellen Modell erzeugen: gleiche Struktur und
 * Parameter, neue Mengen + Monat + Arbeitstage. Herkunft: kein Datei-Upload. */
export function neuerMonatAusEingaben(
  m: NativesProzessmodell,
  monat: string,
  arbeitstage: number,
  eingaben: { knotenIds: string[]; wert: number }[],
): NativesProzessmodell {
  const neueWerte = new Map<string, number>();
  for (const e of eingaben) for (const id of e.knotenIds) neueWerte.set(id, e.wert);
  return {
    ...m,
    monat,
    arbeitstage,
    knoten: m.knoten.map((k) => (neueWerte.has(k.id) ? { ...k, wert: neueWerte.get(k.id)! } : k)),
  };
}

/** Wert-Diffs für den Excel-Export: geänderte Eingabe-Knoten mit Original-Zelle. */
export function exportDiffs(
  m: NativesProzessmodell,
  importStand: NativesProzessmodell,
): { sheet: string; addr: string; value: number }[] {
  const alt = new Map(importStand.knoten.map((k) => [k.id, k.wert]));
  const out: { sheet: string; addr: string; value: number }[] = [];
  for (const k of m.knoten) {
    if (k.expr != null || !k.origin || k.wert == null) continue;
    const vorher = alt.get(k.id);
    if (vorher == null || Math.abs(vorher - k.wert) > 1e-12) {
      if (vorher != null && Math.abs(vorher - k.wert) <= 1e-12) continue;
      out.push({ sheet: k.origin.sheet, addr: k.origin.addr, value: k.wert });
    }
  }
  if (Math.abs(m.arbeitstage - importStand.arbeitstage) > 1e-12) {
    out.push({ sheet: 'Dateneingabe', addr: 'E3', value: m.arbeitstage });
  }
  return out;
}

/** Irgendeine WERT-Änderung (Knoten oder Arbeitstage) gegenüber dem Basis-Stand?
 * Anders als exportDiffs unabhängig von einer Excel-Herkunft — greift also auch
 * bei Vorlagen- und Leer-Modellen (Review-Fund #22). */
export function hatWertAenderung(m: NativesProzessmodell, basis: NativesProzessmodell): boolean {
  if (Math.abs(m.arbeitstage - basis.arbeitstage) > 1e-12) return true;
  const alt = new Map(basis.knoten.map((k) => [k.id, k.wert]));
  for (const k of m.knoten) {
    if (k.expr != null) continue;
    const v = alt.get(k.id);
    if (v == null && k.wert == null) continue;
    if (v == null || k.wert == null || Math.abs(v - k.wert) > 1e-12) return true;
  }
  return false;
}

/** Strukturänderung (Schritte) gegenüber dem Importstand? → Export-Hinweis. */
export function hatStrukturAenderung(m: NativesProzessmodell, importStand: NativesProzessmodell): boolean {
  if (m.bloecke.length !== importStand.bloecke.length) return true;
  for (let i = 0; i < m.bloecke.length; i++) {
    const a = m.bloecke[i].schritte;
    const b = importStand.bloecke[i].schritte;
    if (a.length !== b.length) return true;
    for (let j = 0; j < a.length; j++) {
      const x = a[j], y = b[j];
      if (
        x.id !== y.id || x.name !== y.name || x.abteilung !== y.abteilung ||
        x.wegM !== y.wegM || x.geschwMs !== y.geschwMs ||
        x.standardSek !== y.standardSek || x.anteil !== y.anteil
      ) return true;
    }
  }
  return false;
}
