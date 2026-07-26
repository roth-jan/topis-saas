// KI-Textbuilder — LLM-Anbindung (freie Sprache) über die Supabase Edge Function.
// ⚠️ Bis die Edge Function deployt + NEXT_PUBLIC_NL_ENDPOINT gesetzt ist, ist dies inaktiv;
// der KI-Textbuilder nutzt bis dahin den deterministischen parseCanonical (Offline).
//
// Fluss: Text → Edge Function (LLM, nur Parameter) → LayoutParams → validate → paramsToLayout.

import type { LayoutParams } from './nl-layout';
import { parseCanonical } from './nl-layout';

const ENDPOINT = process.env.NEXT_PUBLIC_NL_ENDPOINT; // z.B. https://<ref>.supabase.co/functions/v1/nl-to-layout

export function llmVerfuegbar(): boolean {
  return typeof ENDPOINT === 'string' && ENDPOINT.length > 0;
}

/** Ruft die Edge Function; null bei Fehler/nicht konfiguriert. */
export async function requestLayoutParamsLLM(text: string, unit: 'm' | 'ft' = 'm'): Promise<LayoutParams | null> {
  if (!ENDPOINT) return null;
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, unit }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (data?.error || !data?.hall) return null;
    return data as LayoutParams;
  } catch {
    return null;
  }
}

/**
 * Einheitlicher Resolver für den KI-Textbuilder: nutzt das LLM, wenn verfügbar,
 * fällt sonst (oder bei Fehler) auf den deterministischen Offline-Parser zurück.
 */
export async function resolveLayoutParams(text: string, unit: 'm' | 'ft' = 'm'): Promise<LayoutParams | null> {
  if (llmVerfuegbar()) {
    const viaLlm = await requestLayoutParamsLLM(text, unit);
    if (viaLlm) return viaLlm;
  }
  return parseCanonical(text);
}
