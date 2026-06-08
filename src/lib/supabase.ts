import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Werte werden beim Static-Export zur Build-Zeit eingebettet (NEXT_PUBLIC_*).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True, wenn Supabase konfiguriert ist. Ohne Config läuft die App weiter
 * im reinen localStorage-Modus (kein Login, keine Cloud). */
export const isSupabaseConfigured = Boolean(url && anonKey);

let _client: SupabaseClient | null = null;

/** Lazy Singleton. Gibt null zurück, wenn Supabase nicht konfiguriert ist —
 * Aufrufer müssen das behandeln (Cloud-Funktionen sind dann inaktiv). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    _client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Magic-Link-Tokens stehen nach Redirect im URL-Hash → client-seitig einlesen.
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}
