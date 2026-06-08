import { getSupabase } from './supabase';

// Die 3 (bzw. 4) persistierten Zustand-Stores. Ein Cloud-„Layout" bündelt
// genau diese localStorage-Zustände in einem JSONB-Blob.
const STORE_KEYS = ['topis-layout', 'topis-betriebsdaten', 'topis-prozessmodell', 'topis-sim-settings'] as const;

export interface CloudLayout {
  id: string;
  owner: string;
  name: string;
  updated_at: string;
  created_at: string;
}

export interface LayoutShare {
  layout_id: string;
  shared_with: string;
  permission: 'view' | 'edit';
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
}

/** Aktuellen Editor-Zustand (alle Stores) als JSON-Blob einsammeln.
 * WICHTIG: pro Store das volle persist-Objekt { state, version } speichern —
 * sonst geht die Version verloren und Migrationen greifen beim Cloud-Laden
 * nicht (bzw. falsch), wenn der Code später die Datenform ändert. */
export function serializeCurrentLayout(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of STORE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        data[key] = { state: parsed.state ?? null, version: parsed.version ?? 0 };
      } catch { /* ignore */ }
    }
  }
  return data;
}

/** Cloud-Blob in die Stores zurückschreiben + Reload. Die persist-Middleware
 * sieht beim Rehydrieren die gespeicherte Version und ruft bei Bedarf migrate()
 * + onRehydrateStorage auf — so werden alte Cloud-Layouts automatisch aufs
 * aktuelle Format gehoben. */
export function applyLayoutData(data: Record<string, unknown>): void {
  for (const key of STORE_KEYS) {
    const entry = data[key] as { state?: unknown; version?: number } | unknown | null;
    if (entry == null) continue;
    // Neues Format { state, version } direkt übernehmen; altes Format
    // (nur state, ohne version) als version 0 behandeln (rückwärtskompatibel).
    const hasWrapper = typeof entry === 'object' && entry !== null && 'state' in (entry as object);
    const payload = hasWrapper
      ? { state: (entry as { state: unknown }).state, version: (entry as { version?: number }).version ?? 0 }
      : { state: entry, version: 0 };
    localStorage.setItem(key, JSON.stringify(payload));
  }
  window.location.reload();
}

/** Eigene + mit mir geteilte Layouts auflisten. */
export async function listLayouts(): Promise<CloudLayout[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('layouts')
    .select('id, owner, name, updated_at, created_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as CloudLayout[];
}

/** Ein Layout laden (data jsonb). */
export async function loadLayout(id: string): Promise<Record<string, unknown>> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { data, error } = await sb.from('layouts').select('data').eq('id', id).single();
  if (error) throw error;
  return (data.data ?? {}) as Record<string, unknown>;
}

/** Neues Layout aus aktuellem Editor-Zustand anlegen. */
export async function createLayout(name: string): Promise<CloudLayout> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { data: userData } = await sb.auth.getUser();
  const owner = userData.user?.id;
  if (!owner) throw new Error('Nicht eingeloggt');
  const { data, error } = await sb
    .from('layouts')
    .insert({ name, owner, data: serializeCurrentLayout() })
    .select('id, owner, name, updated_at, created_at')
    .single();
  if (error) throw error;
  return data as CloudLayout;
}

/** Bestehendes Layout mit aktuellem Editor-Zustand überschreiben. */
export async function saveLayout(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { error } = await sb.from('layouts').update({ data: serializeCurrentLayout() }).eq('id', id);
  if (error) throw error;
}

export async function renameLayout(id: string, name: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { error } = await sb.from('layouts').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteLayout(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { error } = await sb.from('layouts').delete().eq('id', id);
  if (error) throw error;
}

// ============ Teilen ============

/** Profil per E-Mail finden (für gezieltes Teilen). */
export async function findProfileByEmail(email: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('profiles')
    .select('id, email, display_name')
    .ilike('email', email.trim())
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/** Shares eines Layouts (mit Profil-Infos) auflisten. */
export async function listShares(layoutId: string): Promise<(LayoutShare & { profile: Profile | null })[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('layout_shares')
    .select('layout_id, shared_with, permission, profiles:shared_with(id, email, display_name)')
    .eq('layout_id', layoutId);
  if (error) throw error;
  return (data as unknown as Array<LayoutShare & { profiles: Profile | null }>).map((r) => ({
    layout_id: r.layout_id, shared_with: r.shared_with, permission: r.permission, profile: r.profiles,
  }));
}

export async function shareLayout(layoutId: string, userId: string, permission: 'view' | 'edit'): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { error } = await sb
    .from('layout_shares')
    .upsert({ layout_id: layoutId, shared_with: userId, permission }, { onConflict: 'layout_id,shared_with' });
  if (error) throw error;
}

export async function unshareLayout(layoutId: string, userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase nicht konfiguriert');
  const { error } = await sb.from('layout_shares').delete().eq('layout_id', layoutId).eq('shared_with', userId);
  if (error) throw error;
}
