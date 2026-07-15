import { getSupabase } from './supabase';
import type { AsProzessModell } from './prozessmodell-excel-modell';
import type { NativesProzessmodell } from './prozessmodell-nativ';

/**
 * Cloud-Persistenz für Prozessmodell-Monate (Hallencockpit-Abo-Kern).
 *
 * Pro Nutzer + Monat wird gespeichert:
 *  - die Original-Excel im privaten Storage-Bucket `prozessmodelle`
 *    (Pfad `<uid>/<monat>.xlsx`) → beim Laden wird sie neu geparst, damit das
 *    Modell voll editierbar bleibt (gleiche Formel-Treue wie beim Upload),
 *  - ein kompakter Kennzahlen-Snapshot (JSONB) für die Trend-Ansicht,
 *    ohne dass dafür Dateien geladen werden müssen.
 *
 * RLS: Jeder Nutzer sieht ausschließlich seine eigenen Zeilen/Dateien
 * (Mandanten-Trennung auf Nutzer-Ebene; AS ist der erste Mandant).
 */

export interface ProzessKennzahlen {
  maStundenProzesse: number;
  arbeitsminutenJeStunde: number;
  sektionen: {
    titel: string;
    summeProzesse: number;
    prozesse: { name: string; menge: number; minProColli: number; maStunden: number }[];
  }[];
  bloecke: { name: string; minProColli: number; proAbteilung: Record<string, number> }[];
}

export interface CloudProzessmodellMonat {
  id: string;
  owner: string;
  monat: string; // 'MM/YYYY' wie in der Excel (Dateneingabe!C3)
  dateiname: string;
  datei_pfad: string;
  kennzahlen: ProzessKennzahlen;
  /** Das NATIVE Modell (Quelle der Wahrheit seit Etappe 1); ältere Zeilen: null → Datei re-konvertieren. */
  modell: NativesProzessmodell | null;
  created_at: string;
  updated_at: string;
  /** Anzeigename des Besitzers (Berater-Sicht) — clientseitig aus profiles ergänzt. */
  owner_email?: string;
}

/** Monate eines Besitzers, für die Berater-Sicht gruppiert. */
export interface KundenGruppe {
  ownerId: string;
  label: string;
  eigene: boolean;
  monate: CloudProzessmodellMonat[];
}

/** Gruppiert Monate nach Besitzer: eigene zuerst („Meine Monate"), dann je Kunde.
 * Für Nicht-Berater entsteht genau eine eigene Gruppe (pure, testbar). */
export function gruppiereNachKunde(
  monate: CloudProzessmodellMonat[],
  eigeneId: string | null,
): KundenGruppe[] {
  const map = new Map<string, CloudProzessmodellMonat[]>();
  for (const m of monate) {
    const arr = map.get(m.owner) ?? [];
    arr.push(m);
    map.set(m.owner, arr);
  }
  const gruppen: KundenGruppe[] = [...map.entries()].map(([ownerId, ms]) => ({
    ownerId,
    eigene: ownerId === eigeneId,
    label: ownerId === eigeneId ? 'Meine Monate' : ms[0].owner_email ?? `Kunde ${ownerId.slice(0, 8)}`,
    monate: sortiereMonate(ms),
  }));
  return gruppen.sort((a, b) =>
    a.eigene === b.eigene ? a.label.localeCompare(b.label) : a.eigene ? -1 : 1,
  );
}

/** Kompakter Kennzahlen-Snapshot aus dem gerechneten Modell (pure, testbar). */
export function extractKennzahlen(modell: AsProzessModell): ProzessKennzahlen {
  return {
    maStundenProzesse: modell.maStundenProzesse,
    arbeitsminutenJeStunde: modell.arbeitsminutenJeStunde,
    sektionen: modell.uebersicht.map((s) => ({
      titel: s.titel,
      summeProzesse: s.summeProzesse,
      prozesse: s.prozesse.map((p) => ({
        name: p.name,
        menge: p.menge,
        minProColli: p.minProColli,
        maStunden: p.maStunden,
      })),
    })),
    bloecke: modell.bloecke.map((b) => ({
      name: b.name,
      minProColli: b.minProColli,
      proAbteilung: { ...b.proAbteilung },
    })),
  };
}

/** 'MM/YYYY' → 'YYYY-MM' für chronologische Sortierung; unbekanntes Format ans Ende. */
export function monatSortKey(monat: string): string {
  const m = /^(\d{1,2})\s*\/\s*(\d{4})$/.exec(monat.trim());
  if (!m) return `9999-99:${monat}`;
  return `${m[2]}-${m[1].padStart(2, '0')}`;
}

/** Monate chronologisch sortieren (ältester zuerst). */
export function sortiereMonate<T extends { monat: string }>(monate: T[]): T[] {
  return [...monate].sort((a, b) => monatSortKey(a.monat).localeCompare(monatSortKey(b.monat)));
}

/** Trend: Delta der MA-Stunden je Monat gegenüber dem Vormonat (chronologisch). */
export function berechneTrend(
  monate: CloudProzessmodellMonat[],
): { monat: string; maStunden: number; deltaVormonat: number | null }[] {
  const sorted = sortiereMonate(monate);
  return sorted.map((m, i) => ({
    monat: m.monat,
    maStunden: m.kennzahlen.maStundenProzesse,
    deltaVormonat: i > 0 ? m.kennzahlen.maStundenProzesse - sorted[i - 1].kennzahlen.maStundenProzesse : null,
  }));
}

/** Dateipfad im Bucket: uid/monat.xlsx ('/' im Monat → '-'). */
function storagePfad(uid: string, monat: string): string {
  return `${uid}/${monat.replace(/\//g, '-')}.xlsx`;
}

/** Monat speichern: natives Modell (Quelle der Wahrheit) + Kennzahlen + Original-Datei (Beleg).
 * Überschreibt denselben Monat (Upsert). */
export async function saveProzessmodellMonat(
  datei: ArrayBuffer | null,
  dateiname: string,
  view: AsProzessModell,
  modell: NativesProzessmodell,
): Promise<CloudProzessmodellMonat> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { data: userData } = await sb.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error('Nicht eingeloggt');
  const monat = modell.monat || view.monat || 'unbekannt';
  const pfad = storagePfad(uid, monat);

  if (datei) {
    const { error: upErr } = await sb.storage.from('prozessmodelle').upload(pfad, datei, {
      upsert: true,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    if (upErr) throw upErr;
  }

  const { data, error } = await sb
    .from('prozessmodelle')
    .upsert(
      {
        owner: uid,
        monat,
        dateiname,
        datei_pfad: datei ? pfad : '',
        kennzahlen: extractKennzahlen(view),
        modell,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'owner,monat' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as CloudProzessmodellMonat;
}

/** Alle sichtbaren Monate (eigene; für Berater zusätzlich alle Kunden),
 * chronologisch sortiert und mit Besitzer-Anzeigenamen angereichert. */
export async function listProzessmodellMonate(): Promise<CloudProzessmodellMonat[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('prozessmodelle').select('*');
  if (error) throw error;
  const rows = sortiereMonate((data ?? []) as CloudProzessmodellMonat[]);
  // Besitzer-Namen für die Berater-Gruppierung nachladen (profiles sind lesbar).
  const owners = [...new Set(rows.map((r) => r.owner))];
  if (owners.length > 0) {
    const { data: profs } = await sb.from('profiles').select('id, email, display_name').in('id', owners);
    const byId = new Map((profs ?? []).map((p) => [p.id as string, p]));
    for (const r of rows) {
      const p = byId.get(r.owner);
      if (p) r.owner_email = (p.display_name as string | null) || (p.email as string);
    }
  }
  return rows;
}

/** Original-Excel eines Monats herunterladen (zum erneuten Parsen/Editieren). */
export async function loadProzessmodellDatei(pfad: string): Promise<ArrayBuffer> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { data, error } = await sb.storage.from('prozessmodelle').download(pfad);
  if (error) throw error;
  return data.arrayBuffer();
}

/** Monat löschen (Zeile + Datei). */
export async function deleteProzessmodellMonat(m: CloudProzessmodellMonat): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { error } = await sb.from('prozessmodelle').delete().eq('id', m.id);
  if (error) throw error;
  if (m.datei_pfad) await sb.storage.from('prozessmodelle').remove([m.datei_pfad]);
}
