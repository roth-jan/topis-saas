import type { StateStorage } from 'zustand/middleware';

/**
 * Debounced localStorage adapter for Zustand's `persist` middleware.
 *
 * Zustand calls `setItem` on every state change. For large stores (layouts with
 * thousands of paths) this can mean several hundred synchronous localStorage
 * writes per user action — each write serializes the entire store and blocks
 * the UI thread.
 *
 * This adapter coalesces writes within `delayMs`. `getItem` always returns the
 * latest pending value so in-flight writes are never lost. A `pagehide` listener
 * and `flushPendingWrites()` helper guarantee persistence before unload.
 */

const DEFAULT_DELAY_MS = 300;

type PendingEntry = {
  value: string;
  timerId: ReturnType<typeof setTimeout>;
};

const pending = new Map<string, PendingEntry>();

function flushKey(key: string): void {
  const entry = pending.get(key);
  if (!entry) return;
  clearTimeout(entry.timerId);
  try {
    window.localStorage.setItem(key, entry.value);
  } catch (err) {
    // Quota exceeded → laut loggen, sonst Silent-Failure (Planungs-Seite blieb leer)
    const sizeKB = Math.round(entry.value.length / 1024);
    console.error(`[persist] localStorage.setItem("${key}") failed — value=${sizeKB} KB`, err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('persist-failed', { detail: { key, sizeKB } }));
    }
  }
  pending.delete(key);
}

export function flushPendingWrites(): void {
  for (const key of Array.from(pending.keys())) flushKey(key);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingWrites);
}

export function createDebouncedLocalStorage(delayMs: number = DEFAULT_DELAY_MS): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === 'undefined') return null;
      const queued = pending.get(name);
      if (queued) return queued.value;
      return window.localStorage.getItem(name);
    },
    setItem: (name, value) => {
      if (typeof window === 'undefined') return;
      const existing = pending.get(name);
      if (existing) clearTimeout(existing.timerId);
      const timerId = setTimeout(() => flushKey(name), delayMs);
      pending.set(name, { value, timerId });
    },
    removeItem: (name) => {
      if (typeof window === 'undefined') return;
      const existing = pending.get(name);
      if (existing) clearTimeout(existing.timerId);
      pending.delete(name);
      try {
        window.localStorage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}
