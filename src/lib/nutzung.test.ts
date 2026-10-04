import { describe, it, expect, vi } from 'vitest';
import { erzeugeProtokoll, bereinigeDetail, normalisierePfad, type ProtokollUmgebung } from './nutzung';

function aufbau(over: Partial<ProtokollUmgebung> = {}) {
  const gesendet: Array<Record<string, unknown>> = [];
  let zeit = 1_000_000;
  const env: ProtokollUmgebung = {
    umgebung: 'test',
    automatisiert: () => false,
    angemeldet: async () => true,
    sende: async (zeile) => { gesendet.push(zeile); },
    jetzt: () => zeit,
    pfad: () => '/cockpit',
    version: 'abc123',
    ...over,
  };
  const p = erzeugeProtokoll(env);
  return { p, gesendet, vorspulen: (ms: number) => { zeit += ms; } };
}

describe('Nutzungsprotokoll — wann gesendet wird', () => {
  it('sendet bei angemeldetem Nutzer Ereignis, Sitzung, Pfad, Umgebung, Version', async () => {
    const { p, gesendet } = aufbau();
    await p.protokolliere('pm_excel_import', { ok: true });
    expect(gesendet).toHaveLength(1);
    expect(gesendet[0]).toMatchObject({
      ereignis: 'pm_excel_import', detail: { ok: true }, pfad: '/cockpit', umgebung: 'test', version: 'abc123',
    });
    expect(gesendet[0].sitzung).toMatch(/^[0-9a-f-]{36}$/);
    // user_id setzt die Datenbank selbst (auth.uid()) — der Client schickt sie nie mit.
    expect(gesendet[0]).not.toHaveProperty('user_id');
  });

  it('sendet NICHTS ohne Anmeldung (anonyme Besucher werden nie protokolliert)', async () => {
    const { p, gesendet } = aufbau({ angemeldet: async () => false });
    await p.protokolliere('seite_geoeffnet');
    expect(gesendet).toHaveLength(0);
  });

  it('sendet NICHTS ohne gesetzte Umgebung (z. B. lokaler Dev-Build)', async () => {
    const { p, gesendet } = aufbau({ umgebung: null });
    await p.protokolliere('seite_geoeffnet');
    expect(gesendet).toHaveLength(0);
  });

  it('sendet NICHTS aus automatisierten Browsern (Klicktests/Playwright)', async () => {
    const { p, gesendet } = aufbau({ automatisiert: () => true });
    await p.protokolliere('seite_geoeffnet');
    expect(gesendet).toHaveLength(0);
  });

  it('wirft nie — ein Sendefehler darf die App nicht stören', async () => {
    const { p } = aufbau({ sende: async () => { throw new Error('netz weg'); } });
    await expect(p.protokolliere('seite_geoeffnet')).resolves.toBeUndefined();
    const { p: p2 } = aufbau({ angemeldet: async () => { throw new Error('kaputt'); } });
    await expect(p2.protokolliere('seite_geoeffnet')).resolves.toBeUndefined();
  });

  it('Sitzung bleibt innerhalb eines Protokolls gleich', async () => {
    const { p, gesendet } = aufbau();
    await p.protokolliere('seite_geoeffnet');
    await p.protokolliere('pm_excel_export');
    expect(gesendet[0].sitzung).toBe(gesendet[1].sitzung);
  });
});

describe('Nutzungsprotokoll — Deckel und Drosselung', () => {
  it('gedrosselte Ereignisse höchstens einmal je 30 s', async () => {
    const { p, gesendet, vorspulen } = aufbau();
    await p.protokolliere('pm_wert_geaendert');
    await p.protokolliere('pm_wert_geaendert');
    vorspulen(10_000);
    await p.protokolliere('pm_wert_geaendert');
    expect(gesendet).toHaveLength(1);
    vorspulen(25_000);
    await p.protokolliere('pm_wert_geaendert');
    expect(gesendet).toHaveLength(2);
  });

  it('häufige Ereignisse fressen nicht den Platz der Schlüsselereignisse', async () => {
    const { p, gesendet, vorspulen } = aufbau();
    for (let i = 0; i < 500; i++) { await p.protokolliere('werkzeug_gewaehlt', { werkzeug: 'tor' }); vorspulen(31_000); }
    const werkzeug = gesendet.filter((z) => z.ereignis === 'werkzeug_gewaehlt').length;
    expect(werkzeug).toBeLessThanOrEqual(60);
    await p.protokolliere('pm_excel_import', { ok: true });
    expect(gesendet.at(-1)?.ereignis).toBe('pm_excel_import');
  });

  it('Gesamtdeckel je Sitzung', async () => {
    const { p, gesendet } = aufbau();
    for (let i = 0; i < 1000; i++) await p.protokolliere('seite_geoeffnet');
    expect(gesendet.length).toBeLessThanOrEqual(400);
  });
});

describe('Nutzungsprotokoll — keine Inhalte', () => {
  it('bereinigeDetail lässt nur kurze Kennungen, Zahlen und Wahrheitswerte durch', () => {
    expect(bereinigeDetail({ ok: true, anzahl: 20, modus: 'demo' })).toEqual({ ok: true, anzahl: 20, modus: 'demo' });
    // Freitext/Namen (Hallen-, Datei-, Kundennamen) fliegen raus
    expect(bereinigeDetail({ name: 'Halle 6 AS Gersthofen', datei: 'kunde.xlsx' })).toBeNull();
    expect(bereinigeDetail({ modus: 'demo', notiz: 'Hallo Welt' })).toEqual({ modus: 'demo' });
    // verschachtelte Objekte/Listen nie
    expect(bereinigeDetail({ x: { y: 1 } as unknown as number, l: [1] as unknown as number })).toBeNull();
    // nicht-endliche Zahlen nie
    expect(bereinigeDetail({ a: Number.NaN, b: Infinity })).toBeNull();
    // höchstens 6 Felder
    const viele = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`f${'abcdefghij'[i]}`, i]));
    expect(Object.keys(bereinigeDetail(viele) ?? {})).toHaveLength(6);
  });

  it('normalisierePfad entfernt basePath, Query und unbekannte Formen', () => {
    expect(normalisierePfad('/topis-saas/cockpit/', '/topis-saas')).toBe('/cockpit');
    expect(normalisierePfad('/projekt/', '')).toBe('/projekt');
    expect(normalisierePfad('/', '')).toBe('/');
    expect(normalisierePfad('/Kunde Müller/', '')).toBeNull();
  });
});

describe('Nutzungsprotokoll — Ereignisname', () => {
  it('nur bekannte Ereignisse (Tippfehler fallen im Typ auf, zur Laufzeit still verworfen)', async () => {
    const { p, gesendet } = aufbau();
    // @ts-expect-error unbekanntes Ereignis
    await p.protokolliere('irgendwas_neues');
    expect(gesendet).toHaveLength(0);
  });
});

vi.restoreAllMocks();
