'use client';

import { useEffect } from 'react';

// Nach jedem Deploy (Static Export, gehashte Chunk-Namen) laufen offene Tabs mit
// dem ALTEN Chunk-Manifest weiter → die nächste Client-Navigation lädt einen Chunk,
// den es nicht mehr gibt → „ChunkLoadError" + Next-Fehlerseite. Genau das traf den
// Astra-Abnahmetest am 20.09.2026 (E1, Kunden-Check). Abhilfe: einmal hart neu laden;
// sessionStorage verhindert eine Reload-Schleife, falls es wirklich kaputt ist.
const KEY = 'topis-chunk-reload';

function isChunkError(x: unknown): boolean {
  const msg = x instanceof Error ? `${x.name} ${x.message}` : String(x ?? '');
  return /ChunkLoadError|Loading chunk .* failed|Failed to load chunk|Failed to fetch dynamically imported module/i.test(msg);
}

function reloadOnce() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* privater Modus o. ä. → trotzdem einmal versuchen */ }
  window.location.reload();
}

export function ChunkReloadGuard() {
  useEffect(() => {
    // Nach erfolgreichem Laden das Flag nach kurzer Zeit wieder freigeben, damit der
    // NÄCHSTE Deploy erneut abgefangen wird (aber kein Endlos-Reload innerhalb weniger Sekunden).
    const t = window.setTimeout(() => { try { sessionStorage.removeItem(KEY); } catch { /* egal */ } }, 15_000);
    const onError = (e: ErrorEvent) => { if (isChunkError(e.error ?? e.message)) reloadOnce(); };
    const onRejection = (e: PromiseRejectionEvent) => { if (isChunkError(e.reason)) reloadOnce(); };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
