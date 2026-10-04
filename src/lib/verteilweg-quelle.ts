import type { ProzessParameter } from '@/types/prozessmodell';

/**
 * Herkunft des Verteilwegs — reines ANZEIGE-Merkmal. Die Rechnung
 * (prozessrechner.ts, `wegAusLayout` je Schritt) liest `quelle` nicht.
 *
 * `quelle: 'layout'` heißt: der Wert stammt aus einer echten Wegeberechnung im
 * Editor (Wegeberechnung / Distanzmatrix / Flächenbedarf → `setVerteilweg`).
 * Vorlagen, Overrides und Handeingaben tragen `'eingabe'`, Schätzungen `'berechnet'`.
 */

/** Verteilweg, der wirklich aus dem Layout berechnet wurde — sonst null. */
export function layoutVerteilweg(parameter: readonly ProzessParameter[] | null | undefined): number | null {
  const p = parameter?.find((x) => x.id === 'verteilweg');
  return p && p.quelle === 'layout' ? p.aktuellerWert : null;
}

/**
 * Persist-Migration topis-prozessmodell v1 → v2: Bis v1 stand `quelle: 'layout'`
 * hartkodiert in den Vorlagen-Parametern; echte und unechte Layout-Werte sind in
 * Altdaten nicht unterscheidbar. Bewusst konservativ: alles auf 'eingabe' — die
 * Cockpit-Brücke schweigt bis zur nächsten echten Wegeberechnung. Der Wert bleibt.
 */
export function migriereVerteilwegQuelle(state: unknown): unknown {
  if (!state || typeof state !== 'object') return state;
  const s = state as Record<string, unknown>;
  if (!Array.isArray(s.parameter)) return state;
  return {
    ...s,
    parameter: s.parameter.map((p) => {
      const q = p as { id?: unknown; quelle?: unknown } | null;
      return q && typeof q === 'object' && q.id === 'verteilweg' && q.quelle === 'layout'
        ? { ...q, quelle: 'eingabe' }
        : p;
    }),
  };
}
