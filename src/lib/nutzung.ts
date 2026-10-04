/**
 * Nutzungsprotokoll — was angemeldete Tester in TOPIS tatsächlich tun.
 *
 * Warum (Jan, 04.10.2026): Nach Michaels Test am 26.09. ließ sich aus den
 * Server-Logs nur ablesen, WELCHE Seiten er geladen hat. Ob er den Hallen-Check
 * benutzt hat, woher sein Verteilweg kam oder wo er beim Tore-Setzen hing,
 * passiert alles im Browser und war unsichtbar.
 *
 * Leitplanken (bewusst eng, siehe Datenschutzerklärung „Nutzungsprotokoll"):
 *  - NUR angemeldete Nutzer. Anonyme Besucher (z. B. Hallen-Check ohne Konto)
 *    werden nie protokolliert — für sie bleibt „kein Kontakt zu externen
 *    Diensten beim Aufruf" wahr.
 *  - Nichts auf dem Gerät: Die Sitzungs-ID lebt nur im Arbeitsspeicher und ist
 *    nach jedem Neuladen neu; kein Cookie, kein localStorage.
 *  - Keine Inhalte: nur Ereignisname aus einer festen Liste plus kurze
 *    Kennungen/Zahlen (`bereinigeDetail`). Hallen-, Datei- und Kundennamen
 *    kommen nie durch.
 *  - Die Nutzer-ID setzt die Datenbank selbst (`auth.uid()`), der Client
 *    schickt sie nicht mit.
 *  - Ohne `NEXT_PUBLIC_TOPIS_UMGEBUNG` (lokal, Dev) und in automatisierten
 *    Browsern (nächtliche Klicktests, Playwright) passiert NICHTS.
 *  - Ein Fehler hier darf die App nie stören: alles still verschluckt.
 *
 * Tabelle + Deckel + Löschjob (12 Monate): supabase/sql/2026-10-04_nutzungsereignisse.sql
 * Auswertung: scripts/nutzung-auswerten.sh
 */
import { getSupabase } from './supabase';

/** Feste Liste. Neue Ereignisse hier ergänzen — und nur mit Kennungen, nie mit Inhalten. */
const EREIGNISSE = {
  // Navigation
  seite_geoeffnet: 'normal',
  phase_gewechselt: 'normal',
  // Hallen-Check
  check_phase: 'normal',
  check_editor_geoeffnet: 'normal',
  check_zum_prozessmodell: 'normal',
  // Prozessmodell (Cockpit)
  pm_excel_import: 'normal',
  pm_modell_geladen: 'normal',
  pm_wert_geaendert: 'gedrosselt',
  pm_schritt_geaendert: 'gedrosselt',
  pm_verteilweg_uebernommen: 'normal',
  pm_verteilweg_verworfen: 'normal',
  pm_excel_export: 'normal',
  pm_cloud_gespeichert: 'normal',
  pm_zurueckgesetzt: 'normal',
  // Hallenplan
  werkzeug_gewaehlt: 'gedrosselt',
  objekte_eingefuegt: 'normal',
  rueckgaengig: 'gedrosselt',
  vorlage_geladen: 'normal',
  verteilweg_gesetzt: 'normal',
  assistent_fertig: 'normal',
  ki_textbuilder: 'normal',
  layout_cloud_gespeichert: 'normal',
  layout_cloud_geladen: 'normal',
} as const;

export type Ereignis = keyof typeof EREIGNISSE;
export type Detail = Record<string, string | number | boolean>;

const DROSSEL_MS = 30_000;
const DECKEL_JE_EREIGNIS = 60;
const DECKEL_GESAMT = 400;
const MAX_FELDER = 6;
const KENNUNG = /^[a-z0-9_-]{1,30}$/;
const FELDNAME = /^[a-z_]{1,20}$/;
const PFAD = /^\/[a-z/_-]{0,39}$/;

/** Nur kurze Kennungen (klein, ohne Leerzeichen), endliche Zahlen, Wahrheitswerte. */
export function bereinigeDetail(detail?: Detail | null): Detail | null {
  if (!detail || typeof detail !== 'object') return null;
  const aus: Detail = {};
  for (const [k, v] of Object.entries(detail)) {
    if (Object.keys(aus).length >= MAX_FELDER) break;
    if (!FELDNAME.test(k)) continue;
    if (typeof v === 'boolean') aus[k] = v;
    else if (typeof v === 'number' && Number.isFinite(v)) aus[k] = Math.round(v * 100) / 100;
    else if (typeof v === 'string' && KENNUNG.test(v)) aus[k] = v;
  }
  return Object.keys(aus).length > 0 ? aus : null;
}

/** Route ohne basePath, ohne Schrägstrich am Ende; unbekannte Formen → null. */
export function normalisierePfad(pathname: string, basePath: string): string | null {
  let p = pathname.split('?')[0].split('#')[0];
  if (basePath && p.startsWith(basePath)) p = p.slice(basePath.length);
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (p === '') p = '/';
  return PFAD.test(p) ? p : null;
}

export interface ProtokollUmgebung {
  umgebung: 'prod' | 'test' | null;
  automatisiert: () => boolean;
  angemeldet: () => Promise<boolean>;
  sende: (zeile: Record<string, unknown>) => Promise<void>;
  jetzt: () => number;
  pfad: () => string | null;
  version: string | null;
}

function neueSitzung(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Fallback (sehr alte Browser): RFC-4122-Form aus Math.random — reicht für eine Sitzungs-Kennung.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function erzeugeProtokoll(env: ProtokollUmgebung) {
  const sitzung = neueSitzung();
  const zaehler = new Map<string, number>();
  const zuletzt = new Map<string, number>();
  let gesamt = 0;

  async function protokolliere(ereignis: Ereignis, detail?: Detail): Promise<void> {
    try {
      const art = EREIGNISSE[ereignis];
      if (!art || !env.umgebung || env.automatisiert()) return;
      if (gesamt >= DECKEL_GESAMT || (zaehler.get(ereignis) ?? 0) >= DECKEL_JE_EREIGNIS) return;
      const t = env.jetzt();
      const bereinigt = bereinigeDetail(detail);
      // Gedrosselt wird je Ereignis UND Detail: „Werkzeug tor" und „Werkzeug bereich"
      // kurz hintereinander sind zwei Aussagen, zehnmal „tor" ist eine.
      const drosselSchluessel = ereignis + '|' + JSON.stringify(bereinigt);
      if (art === 'gedrosselt') {
        const vorher = zuletzt.get(drosselSchluessel);
        if (vorher !== undefined && t - vorher < DROSSEL_MS) return;
      }
      if (!(await env.angemeldet())) return;
      // Zählen erst NACH der Anmeldeprüfung: anonyme Phasen verbrauchen keinen Deckel.
      zuletzt.set(drosselSchluessel, t);
      zaehler.set(ereignis, (zaehler.get(ereignis) ?? 0) + 1);
      gesamt++;
      await env.sende({
        sitzung,
        ereignis,
        detail: bereinigt,
        pfad: env.pfad(),
        umgebung: env.umgebung,
        version: env.version,
      });
    } catch {
      // still — das Protokoll darf die App nie stören
    }
  }

  return { protokolliere };
}

// ---------------------------------------------------------------------------
// Echte Verdrahtung im Browser

function leseUmgebung(): 'prod' | 'test' | null {
  const u = process.env.NEXT_PUBLIC_TOPIS_UMGEBUNG;
  return u === 'prod' || u === 'test' ? u : null;
}

let _protokoll: ReturnType<typeof erzeugeProtokoll> | null = null;

function protokoll() {
  if (_protokoll) return _protokoll;
  _protokoll = erzeugeProtokoll({
    umgebung: typeof window === 'undefined' ? null : leseUmgebung(),
    automatisiert: () => typeof navigator !== 'undefined' && navigator.webdriver === true,
    angemeldet: async () => {
      const sb = getSupabase();
      if (!sb) return false;
      // getSession liest nur den lokalen Login-Zustand — kein Netzwerkaufruf.
      const { data } = await sb.auth.getSession();
      return Boolean(data.session);
    },
    sende: async (zeile) => {
      const sb = getSupabase();
      if (!sb) return;
      await sb.from('nutzungsereignisse').insert(zeile);
    },
    jetzt: () => Date.now(),
    pfad: () => (typeof window === 'undefined'
      ? null
      : normalisierePfad(window.location.pathname, process.env.NEXT_PUBLIC_BASE_PATH ?? '')),
    version: process.env.NEXT_PUBLIC_SENTRY_RELEASE || null,
  });
  return _protokoll;
}

// Ladevorgänge (Vorlage, Cloud-Halle, Demo) schreiben viele Objekte auf einmal in
// den Store. Das ist kein „Einfügen" durch den Nutzer — NutzungInit fragt das hier ab.
let ladenBis = 0;
export function markiereLadevorgang(ms = 2000): void {
  ladenBis = Date.now() + ms;
}
export function istLadevorgang(): boolean {
  return Date.now() < ladenBis;
}

/**
 * Für Aktionen, nach denen die Seite neu lädt (Cloud-Halle laden): kurz warten,
 * damit das Ereignis nicht mit dem Neuladen abgebrochen wird — höchstens 800 ms.
 */
export function protokolliereVorNeuladen(ereignis: Ereignis, detail?: Detail): Promise<void> {
  return Promise.race([
    protokoll().protokolliere(ereignis, detail),
    new Promise<void>((r) => setTimeout(r, 800)),
  ]);
}

/** Fire-and-forget: nie awaiten im UI-Pfad nötig, wirft nie. */
export function protokolliere(ereignis: Ereignis, detail?: Detail): void {
  void protokoll().protokolliere(ereignis, detail);
}
