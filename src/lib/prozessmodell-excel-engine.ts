import * as XLSX from 'xlsx';

/**
 * Rechnende, editierbare Engine für das AS-Prozessmodell (Beintner / Andreas Schmid).
 *
 * Im Gegensatz zu `prozessmodell-excel-import.ts` (liest nur die fertigen Excel-Werte,
 * read-only) rechnet diese Engine den kompletten Formelgraph aus den ROHDATEN neu auf —
 * adressbasiert, wie die verifizierte Python-Referenz (`address_engine.py`). Dadurch:
 *   - reproduziert sie alle 18 Prozessblöcke Δ = 0 (Min/Colli) und den MA-Stundenbedarf
 *     (Übersicht, Σ 6375,9 h) exakt,
 *   - und ist EDITIERBAR: ändert AS eine Menge (z.B. Colli/Monat), wird der gesamte
 *     Graph live neu gerechnet (Override auf die Input-Zelle → Cache invalidieren).
 *
 * Kein `eval`: ein Recursive-Descent-Evaluator wertet Excel-Formeln direkt aus
 * (Zellrefs mit $, Cross-Sheet-Refs, + − × ÷ ^ %, Vergleiche, IF/SUM/SUMIF/MAX/MIN/ROUND/ABS).
 */

// ---------------------------------------------------------------------------
// Workbook-Modell
// ---------------------------------------------------------------------------

export type CellValue = number | string | boolean | null;

interface Cell {
  v: CellValue; // gecachter Wert (data_only)
  f?: string; // Formel ohne führendes '='
}

type SheetCells = Map<string, Cell>; // "A1" -> Cell

const COL_RE = /^([A-Z]{1,2})(\d+)$/;

function colToNum(col: string): number {
  let n = 0;
  for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
  return n;
}
function numToCol(n: number): string {
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Die geparste Mappe + der live rechnende Evaluator. */
export class ProzessWorkbook {
  private sheets = new Map<string, SheetCells>();
  private cache = new Map<string, number | string>(); // "Sheet!A1" -> Wert
  private overrides = new Map<string, CellValue>(); // "Sheet!A1" -> Nutzer-Override
  private resolving = new Set<string>(); // Zyklusschutz

  constructor(wb: XLSX.WorkBook) {
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const cells: SheetCells = new Map();
      for (const addr in ws) {
        if (addr[0] === '!') continue;
        const c = ws[addr] as XLSX.CellObject;
        cells.set(addr, { v: (c.v ?? null) as CellValue, f: typeof c.f === 'string' ? c.f : undefined });
      }
      this.sheets.set(name, cells);
    }
  }

  static fromArrayBuffer(buf: ArrayBuffer): ProzessWorkbook {
    const wb = XLSX.read(buf, { type: 'array', cellFormula: true });
    return new ProzessWorkbook(wb);
  }

  sheetNames(): string[] {
    return [...this.sheets.keys()];
  }

  hasSheet(name: string): boolean {
    return this.sheets.has(name);
  }

  private cell(sheet: string, addr: string): Cell | undefined {
    return this.sheets.get(sheet)?.get(addr);
  }

  /** Rohe Zelle (Wert + Formel), für den Modell-Aufbau. */
  rawCell(sheet: string, addr: string): { v: CellValue; f?: string } {
    const c = this.cell(sheet, addr);
    return c ? { v: c.v, f: c.f } : { v: null };
  }

  /** Höchste belegte Zeilennummer eines Sheets. */
  maxRow(sheet: string): number {
    const cells = this.sheets.get(sheet);
    if (!cells) return 0;
    let max = 0;
    for (const addr of cells.keys()) {
      const m = COL_RE.exec(addr);
      if (m) { const r = +m[2]; if (r > max) max = r; }
    }
    return max;
  }

  /** Setzt einen Nutzer-Override auf eine Zelle (Menge editieren) und invalidiert den Cache. */
  setOverride(sheet: string, addr: string, value: CellValue): void {
    this.overrides.set(`${sheet}!${addr}`, value);
    this.cache.clear();
  }
  clearOverride(sheet: string, addr: string): void {
    this.overrides.delete(`${sheet}!${addr}`);
    this.cache.clear();
  }
  clearOverrides(): void {
    this.overrides.clear();
    this.cache.clear();
  }
  getOverride(sheet: string, addr: string): CellValue | undefined {
    return this.overrides.get(`${sheet}!${addr}`);
  }

  /** Alle aktiven Overrides (für Excel-Export: geänderte Werte zurückschreiben). */
  listOverrides(): { sheet: string; addr: string; value: CellValue }[] {
    return [...this.overrides.entries()].map(([key, value]) => {
      const i = key.indexOf('!');
      return { sheet: key.slice(0, i), addr: key.slice(i + 1), value };
    });
  }

  hasOverrides(): boolean {
    return this.overrides.size > 0;
  }

  /** Löst eine Zelle auf (Formel evaluieren / Wert / Override). Rückgabe Zahl oder String. */
  resolve(sheet: string, addr: string): number | string {
    const key = `${sheet}!${addr}`;
    const ov = this.overrides.get(key);
    if (ov !== undefined) return typeof ov === 'number' || typeof ov === 'string' ? ov : num(ov);
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    if (this.resolving.has(key)) return 0; // Zyklus
    this.resolving.add(key);
    let val: number | string;
    try {
      const c = this.cell(sheet, addr);
      if (c && typeof c.f === 'string') {
        try {
          val = this.evalFormula(sheet, c.f);
        } catch {
          // Referenzpfad bleibt tolerant: #DIV/0! u.ä. → 0, exakt das alte
          // safeDiv-Verhalten (Null-Blöcke der echten Datei hängen daran).
          val = 0;
        }
      } else if (c && (typeof c.v === 'number')) {
        val = c.v;
      } else if (c && typeof c.v === 'string') {
        val = c.v;
      } else if (c && typeof c.v === 'boolean') {
        val = c.v ? 1 : 0;
      } else {
        val = 0;
      }
    } finally {
      this.resolving.delete(key);
    }
    this.cache.set(key, val);
    return val;
  }

  resolveNum(sheet: string, addr: string): number {
    return num(this.resolve(sheet, addr));
  }

  // -------------------------------------------------------------------------
  // Evaluator (Recursive Descent über Excel-Formeln)
  // -------------------------------------------------------------------------

  evalFormula(sheet: string, expr: string): number | string {
    const p = new Parser(expr, sheet, this);
    const v = p.parseExpression();
    p.expectEnd();
    return v;
  }

  /** Range → Liste von Werten (für SUM/SUMIF). `sheet` = Kontext-Sheet. */
  rangeValues(sheet: string, a: string, b: string): (number | string)[] {
    const ma = COL_RE.exec(a.replace(/\$/g, ''));
    const mb = COL_RE.exec(b.replace(/\$/g, ''));
    if (!ma || !mb) return [];
    const c1 = colToNum(ma[1]), r1 = +ma[2];
    const c2 = colToNum(mb[1]), r2 = +mb[2];
    const out: (number | string)[] = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
        out.push(this.resolve(sheet, `${numToCol(c)}${r}`));
      }
    }
    return out;
  }
}

/** String → Zahl, deutsch-bewusst: bei Komma = Dezimaltrenner werden Punkte
 * als Tausendertrenner entfernt ('1.234,5' → 1234.5); ohne Komma bleibt der
 * Punkt Dezimaltrenner ('1234.5' → 1234.5). (Review-Fund #17) */
export function parseZahl(s: string): number {
  const t = s.trim();
  const norm = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = parseFloat(norm);
  return Number.isFinite(n) ? n : 0;
}

export function num(v: CellValue | number | string): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') return parseZahl(v);
  return 0;
}

/**
 * Wertet einen NATIVEN Ausdruck aus (Excel-Syntax, aber ausschließlich benannte
 * Referenzen wie `_g6`/`_s50`/`_AT` statt Zellbezügen). Trifft der Parser doch
 * auf einen Zellbezug, wirft er — das ist dann ein Konvertierungsfehler, der
 * laut werden soll, statt still falsch zu rechnen.
 */
export function evalAusdruck(expr: string, named: NamedResolver): number {
  const p = new Parser(expr, '', null, named);
  const v = p.parseExpression();
  p.expectEnd();
  return num(v);
}

// ---------------------------------------------------------------------------
// Parser / Tokenizer
// ---------------------------------------------------------------------------

type RangeRef = { __range: true; sheet: string; a: string; b: string };

/** Auflöser für benannte Referenzen (natives Modell: `_g6`, `_s50`, `_AT`).
 * Gibt `undefined` zurück, wenn der Name unbekannt ist (→ normale Zell-/Funktions-Auflösung). */
export type NamedResolver = (name: string) => number | undefined;

class Parser {
  private i = 0;
  constructor(
    private s: string,
    private sheet: string,
    private wb: ProzessWorkbook | null,
    private named?: NamedResolver,
  ) {}

  private ws() {
    while (this.i < this.s.length && /\s/.test(this.s[this.i])) this.i++;
  }
  private peek(): string {
    this.ws();
    return this.s[this.i] ?? '';
  }
  expectEnd() {
    this.ws();
    if (this.i < this.s.length) throw new Error(`Formel-Rest bei ${this.i}: "${this.s.slice(this.i)}" in "${this.s}"`);
  }

  parseExpression(): number | string {
    return this.parseComparison();
  }

  private parseComparison(): number | string {
    let left = this.parseAdd();
    for (;;) {
      this.ws();
      const two = this.s.substr(this.i, 2);
      let op = '';
      if (two === '>=' || two === '<=' || two === '<>') {
        op = two;
        this.i += 2;
      } else {
        const ch = this.s[this.i];
        if (ch === '>' || ch === '<' || ch === '=') {
          op = ch;
          this.i += 1;
        }
      }
      if (!op) return left;
      const right = this.parseAdd();
      const l = num(left), r = num(right);
      let res: boolean;
      switch (op) {
        case '>': res = l > r; break;
        case '<': res = l < r; break;
        case '>=': res = l >= r; break;
        case '<=': res = l <= r; break;
        case '=': res = typeof left === 'string' || typeof right === 'string' ? String(left) === String(right) : l === r; break;
        default: res = typeof left === 'string' || typeof right === 'string' ? String(left) !== String(right) : l !== r; break; // <>
      }
      left = res ? 1 : 0;
    }
  }

  private parseAdd(): number | string {
    let left = this.parseMul();
    for (;;) {
      const ch = this.peek();
      if (ch === '+' || ch === '-') {
        this.i++;
        const right = this.parseMul();
        left = num(left) + (ch === '+' ? num(right) : -num(right));
      } else return left;
    }
  }

  private parseMul(): number | string {
    let left = this.parsePower();
    for (;;) {
      const ch = this.peek();
      if (ch === '*' || ch === '/') {
        this.i++;
        const right = this.parsePower();
        left = ch === '*' ? num(left) * num(right) : safeDiv(num(left), num(right));
      } else return left;
    }
  }

  private parsePower(): number | string {
    let left = this.parseUnary();
    for (;;) {
      const ch = this.peek();
      if (ch === '^') {
        this.i++;
        const right = this.parseUnary();
        left = Math.pow(num(left), num(right));
      } else return left;
    }
  }

  private parseUnary(): number | string {
    const ch = this.peek();
    if (ch === '-') {
      this.i++;
      return -num(this.parseUnary());
    }
    if (ch === '+') {
      this.i++;
      return this.parseUnary();
    }
    return this.parsePostfix();
  }

  private parsePostfix(): number | string {
    let v = this.parsePrimary();
    // Prozent-Postfix
    while (this.peek() === '%') {
      this.i++;
      v = num(v) / 100;
    }
    return v;
  }

  private parsePrimary(): number | string {
    const ch = this.peek();
    // Klammer
    if (ch === '(') {
      this.i++;
      const v = this.parseExpression();
      if (this.peek() !== ')') throw new Error(`')' erwartet in "${this.s}"`);
      this.i++;
      return v;
    }
    // String-Literal "..."
    if (ch === '"') {
      this.i++;
      let str = '';
      while (this.i < this.s.length) {
        if (this.s[this.i] === '"') {
          if (this.s[this.i + 1] === '"') {
            str += '"';
            this.i += 2;
            continue;
          }
          this.i++;
          break;
        }
        str += this.s[this.i++];
      }
      return str;
    }
    // Zahl
    if (/[0-9.]/.test(ch)) {
      let j = this.i;
      while (j < this.s.length && /[0-9.]/.test(this.s[j])) j++;
      // Exponent (E-Notation)
      if (this.s[j] === 'E' || this.s[j] === 'e') {
        let k = j + 1;
        if (this.s[k] === '+' || this.s[k] === '-') k++;
        if (/[0-9]/.test(this.s[k])) {
          while (k < this.s.length && /[0-9]/.test(this.s[k])) k++;
          j = k;
        }
      }
      const numStr = this.s.slice(this.i, j);
      this.i = j;
      return parseFloat(numStr);
    }
    // Bezeichner: Funktion, Cross-Sheet-Ref, oder Zellref
    // Cross-Sheet: 'Sheet Name'!A1  oder  Sheet!A1
    if (ch === "'") {
      // gequoteter Sheet-Name
      this.i++;
      let name = '';
      while (this.i < this.s.length && this.s[this.i] !== "'") name += this.s[this.i++];
      this.i++; // schließendes '
      if (this.peek() !== '!') throw new Error(`'!' nach Sheet-Name erwartet in "${this.s}"`);
      this.i++;
      return this.parseRefOnSheet(name);
    }
    // Buchstaben-Kette
    const idMatch = /^[A-Za-zÄÖÜäöüß_][A-Za-zÄÖÜäöüß_0-9. ]*/.exec(this.s.slice(this.i));
    if (idMatch) {
      // Könnte benannte Referenz, Funktion, TRUE/FALSE, Cross-Sheet-Ref oder Zellref sein.
      const after = this.i + idMatch[0].length;
      const nextNonWs = this.s.slice(after).match(/^\s*(.)/);
      const nextCh = nextNonWs ? nextNonWs[1] : '';
      // Benannte Referenz (natives Modell: _g6, _s50, _AT)?
      if (this.named && nextCh !== '(' && nextCh !== '!') {
        const v = this.named(idMatch[0].trim());
        if (v !== undefined) {
          this.i = after;
          return v;
        }
      }
      // Funktion?
      const upperName = idMatch[0].trim().toUpperCase();
      if (nextCh === '(') {
        this.i = after;
        this.ws();
        this.i++; // (
        return this.parseFunction(upperName);
      }
      // Cross-Sheet-Ref (unquoted)?
      if (nextCh === '!') {
        this.i = after;
        this.ws();
        this.i++; // !
        return this.parseRefOnSheet(idMatch[0].trim());
      }
      // TRUE / FALSE
      if (upperName === 'TRUE') { this.i = after; return 1; }
      if (upperName === 'FALSE') { this.i = after; return 0; }
      // Zellref auf aktuellem Sheet
      return this.parseCellRef(this.sheet);
    }
    // $-präfigierte Zellref
    if (ch === '$') {
      return this.parseCellRef(this.sheet);
    }
    throw new Error(`Unerwartetes Zeichen '${ch}' bei ${this.i} in "${this.s}"`);
  }

  /** Liest COL/ROW (mit optionalen $) als Zellreferenz relativ zu `sheet`. */
  private parseRefOnSheet(sheet: string): number | string {
    const first = this.readAddr();
    if (this.peek() === ':') {
      // Range außerhalb einer Funktion kommt im Modell nicht vor → erste Zelle.
      this.i++;
      this.readAddr();
    }
    if (!this.wb) throw new Error(`Unaufgelöster Zellbezug ${sheet}!${first} im nativen Ausdruck "${this.s}"`);
    return this.wb.resolve(sheet, first);
  }

  private parseCellRef(sheet: string): number | string {
    const addr = this.readAddr();
    if (!this.wb) throw new Error(`Unaufgelöster Zellbezug ${addr} im nativen Ausdruck "${this.s}"`);
    return this.wb.resolve(sheet, addr);
  }

  /** Liest eine Adresse wie $A$1 / A1 und gibt normalisiert "A1" zurück. */
  private readAddr(): string {
    let s = '';
    if (this.s[this.i] === '$') this.i++;
    while (this.i < this.s.length && /[A-Z]/.test(this.s[this.i])) s += this.s[this.i++];
    if (this.s[this.i] === '$') this.i++;
    while (this.i < this.s.length && /[0-9]/.test(this.s[this.i])) s += this.s[this.i++];
    return s;
  }

  /** Liest eine Range- oder Zell-Adresse (für Funktionsargumente), gibt {a,b,sheet}. */
  private readRangeArg(sheet: string): RangeRef | number | string {
    const a = this.readAddr();
    if (this.peek() === ':') {
      this.i++;
      const b = this.readAddr();
      return { __range: true, sheet, a, b };
    }
    if (!this.wb) throw new Error(`Unaufgelöster Zellbezug ${a} im nativen Ausdruck "${this.s}"`);
    return this.wb.resolve(sheet, a);
  }

  private parseFunction(name: string): number | string {
    // IFERROR lazy: wirft die Auswertung von Arg 1 (oder liefert NaN/∞),
    // greift der Fallback — sonst würde der Fehler die ganze Formel killen.
    if (name === 'IFERROR') {
      const start = this.i;
      let wert: number | string | null = null;
      let fehler = false;
      try {
        wert = this.parseExpression();
        if (typeof wert === 'number' && !Number.isFinite(wert)) fehler = true;
      } catch {
        fehler = true;
        // Arg 1 syntaktisch überspringen (ab Startposition)
        this.i = start;
        this.skipExpression();
      }
      if (this.peek() === ',') {
        this.i++;
        if (fehler) {
          const fallback = this.parseExpression();
          this.expectClose();
          return fallback;
        }
        this.skipExpression();
      }
      this.expectClose();
      return fehler ? 0 : (wert as number | string);
    }
    // Argumente lesen (lazy für IF)
    if (name === 'IF') {
      const cond = this.parseExpression();
      this.expectComma();
      // then/else lazy auswerten
      if (num(cond) !== 0) {
        const t = this.parseExpression();
        // else überspringen
        if (this.peek() === ',') {
          this.i++;
          this.skipExpression();
        }
        this.expectClose();
        return t;
      } else {
        this.skipExpression();
        if (this.peek() === ',') {
          this.i++;
          const e = this.parseExpression();
          this.expectClose();
          return e;
        }
        this.expectClose();
        return 0;
      }
    }

    // Für SUM/SUMIF/etc: Argumente als (Range | Wert) sammeln
    const args = this.parseArgList();
    this.expectClose();
    return applyFunction(name, args, this.wb);
  }

  /** Argumentliste; erkennt Ranges (A1:B2) an den passenden Positionen. */
  private parseArgList(): (RangeRef | number | string)[] {
    const out: (RangeRef | number | string)[] = [];
    if (this.peek() === ')') return out;
    for (;;) {
      out.push(this.parseArg());
      if (this.peek() === ',') {
        this.i++;
        continue;
      }
      break;
    }
    return out;
  }

  /** Ein Argument: Range (A1:B2, opt. Cross-Sheet) oder voller Ausdruck. */
  private parseArg(): RangeRef | number | string {
    // Versuche Range/Cross-Sheet-Range zu erkennen
    const save = this.i;
    // gequoteter Sheet?
    if (this.peek() === "'") {
      this.i++;
      let nm = '';
      while (this.i < this.s.length && this.s[this.i] !== "'") nm += this.s[this.i++];
      this.i++;
      if (this.peek() === '!') {
        this.i++;
        const rr = this.readRangeArg(nm);
        // Falls danach ein Operator kommt, war es ein Ausdruck → zurückspulen (selten)
        if (!isArgBoundary(this.peek())) {
          this.i = save;
          return this.parseExpression();
        }
        return rr;
      }
      this.i = save;
      return this.parseExpression();
    }
    const idMatch = /^[A-Za-zÄÖÜäöüß_][A-Za-zÄÖÜäöüß_0-9. ]*/.exec(this.s.slice(this.i));
    if (idMatch) {
      const after = this.i + idMatch[0].length;
      const nextNonWs = this.s.slice(after).match(/^\s*(.)/);
      const nextCh = nextNonWs ? nextNonWs[1] : '';
      if (nextCh === '!') {
        // Cross-Sheet-Range/Ref
        this.i = after;
        this.ws();
        this.i++;
        const rr = this.readRangeArg(idMatch[0].trim());
        if (!isArgBoundary(this.peek())) {
          this.i = save;
          return this.parseExpression();
        }
        return rr;
      }
      // Zell-/Range auf aktuellem Sheet, wenn Muster COL+ROW
      if (nextCh !== '(') {
        const asAddr = idMatch[0].trim();
        if (/^[A-Z]{1,2}\d+$/.test(asAddr.replace(/\$/g, ''))) {
          this.i = save;
          const rr = this.readRangeArg(this.sheet);
          if (!isArgBoundary(this.peek())) {
            // war Teil eines größeren Ausdrucks
            this.i = save;
            return this.parseExpression();
          }
          return rr;
        }
      }
    }
    // $-Adresse
    if (this.peek() === '$') {
      const rr = this.readRangeArg(this.sheet);
      if (!isArgBoundary(this.peek())) {
        this.i = save;
        return this.parseExpression();
      }
      return rr;
    }
    return this.parseExpression();
  }

  private expectComma() {
    if (this.peek() !== ',') throw new Error(`',' erwartet in "${this.s}" bei ${this.i}`);
    this.i++;
  }
  private expectClose() {
    if (this.peek() !== ')') throw new Error(`')' erwartet in "${this.s}" bei ${this.i}`);
    this.i++;
  }

  /** Überspringt einen Ausdruck (für lazy IF-Zweige) unter Beachtung der Klammertiefe. */
  private skipExpression() {
    let depth = 0;
    for (;;) {
      this.ws();
      const ch = this.s[this.i];
      if (ch === undefined) return;
      if (ch === '(') depth++;
      else if (ch === ')') {
        if (depth === 0) return;
        depth--;
      } else if (ch === ',' && depth === 0) return;
      else if (ch === '"') {
        this.i++;
        while (this.i < this.s.length) {
          if (this.s[this.i] === '"') {
            if (this.s[this.i + 1] === '"') { this.i += 2; continue; }
            break;
          }
          this.i++;
        }
      }
      this.i++;
    }
  }
}

function isArgBoundary(ch: string): boolean {
  return ch === ',' || ch === ')' || ch === '';
}

function safeDiv(a: number, b: number): number {
  // Excel-Semantik: Division durch 0 ist ein FEHLER (#DIV/0!), kein stilles 0.
  // IFERROR fängt ihn; der native Rechner meldet ihn als sichtbare Warnung;
  // nur der adressbasierte Referenzpfad (ProzessWorkbook.resolve) bleibt
  // tolerant und liefert 0 (siehe dort).
  if (b === 0) throw new Error('Division durch 0 (#DIV/0!)');
  return a / b;
}

function flat(arg: RangeRef | number | string, wb: ProzessWorkbook | null): (number | string)[] {
  if (arg && typeof arg === 'object' && '__range' in arg) {
    if (!wb) throw new Error(`Unaufgelöster Range-Bezug ${arg.a}:${arg.b} im nativen Ausdruck`);
    return wb.rangeValues(arg.sheet, arg.a, arg.b);
  }
  return [arg];
}

function applyFunction(name: string, args: (RangeRef | number | string)[], wb: ProzessWorkbook | null): number | string {
  switch (name) {
    case 'SUM': {
      let t = 0;
      for (const a of args) for (const v of flat(a, wb)) t += num(v);
      return t;
    }
    case 'AVERAGE': {
      let t = 0, n = 0;
      for (const a of args) for (const v of flat(a, wb)) { t += num(v); n++; }
      return n ? t / n : 0;
    }
    case 'COUNT': {
      let n = 0;
      for (const a of args) for (const v of flat(a, wb)) if (typeof v === 'number') n++;
      return n;
    }
    case 'MAX': {
      const vals: number[] = [];
      for (const a of args) for (const v of flat(a, wb)) vals.push(num(v));
      return vals.length ? Math.max(...vals) : 0;
    }
    case 'MIN': {
      const vals: number[] = [];
      for (const a of args) for (const v of flat(a, wb)) vals.push(num(v));
      return vals.length ? Math.min(...vals) : 0;
    }
    case 'ABS':
      return Math.abs(num(scalar(args[0], wb)));
    case 'ROUND': {
      const x = num(scalar(args[0], wb));
      const d = num(scalar(args[1], wb));
      const f = Math.pow(10, d);
      return Math.round(x * f) / f;
    }
    case 'ROUNDUP': {
      const x = num(scalar(args[0], wb));
      const d = num(scalar(args[1], wb));
      const f = Math.pow(10, d);
      return Math.ceil(Math.abs(x) * f) / f * Math.sign(x || 1);
    }
    case 'ROUNDDOWN': {
      const x = num(scalar(args[0], wb));
      const d = num(scalar(args[1], wb));
      const f = Math.pow(10, d);
      return Math.floor(Math.abs(x) * f) / f * Math.sign(x || 1);
    }
    case 'SUMIF': {
      const range = flat(args[0], wb);
      const crit = scalar(args[1], wb);
      const sumRange = args[2] !== undefined ? flat(args[2], wb) : range;
      let t = 0;
      for (let k = 0; k < range.length; k++) {
        if (matchCriteria(range[k], crit)) t += num(sumRange[k] ?? 0);
      }
      return t;
    }
    // IFERROR wird lazy in parseFunction behandelt (siehe dort).
    default:
      throw new Error(`Funktion ${name} nicht implementiert`);
  }
}

function scalar(arg: RangeRef | number | string | undefined, wb: ProzessWorkbook | null): number | string {
  if (arg === undefined) return 0;
  if (arg && typeof arg === 'object' && '__range' in arg) {
    if (!wb) throw new Error(`Unaufgelöster Range-Bezug ${arg.a}:${arg.b} im nativen Ausdruck`);
    const vs = wb.rangeValues(arg.sheet, arg.a, arg.b);
    return vs[0] ?? 0;
  }
  return arg;
}

function matchCriteria(value: number | string, crit: number | string): boolean {
  if (typeof crit === 'string') {
    const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit);
    if (m && m[1]) {
      const op = m[1];
      const rhs = parseFloat(m[2]);
      const lhs = num(value);
      switch (op) {
        case '<': return lhs < rhs;
        case '>': return lhs > rhs;
        case '<=': return lhs <= rhs;
        case '>=': return lhs >= rhs;
        case '<>': return String(value) !== m[2];
        case '=': return String(value) === m[2];
      }
    }
    return String(value) === crit;
  }
  return num(value) === num(crit);
}
