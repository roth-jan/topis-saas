import { expect, Page } from '@playwright/test';

const WELCOME_INIT = Symbol('welcome-init-installed');

/**
 * Verhindert, dass das Erstkontakt-Overlay (WelcomeOverlay, Commit 3dc8f695)
 * überhaupt mountet: Wir setzen `topis-welcome-seen` per addInitScript BEVOR die
 * App-Scripts laufen — auf JEDER Navigation/Reload dieses Page-Contexts. Der
 * frühere Ansatz (Overlay nach dem Laden wegklicken) war unter paralleler Last
 * flaky, weil das Hydration-gated Overlay teils erst nach dem Klick-Timeout
 * erschien und dann Pointer-Events abfing ("subtree intercepts pointer events").
 * Idempotent: nur einmal pro Page installieren.
 */
export async function ensureWelcomeSuppressed(page: Page): Promise<void> {
  const pageAny = page as unknown as Record<PropertyKey, unknown>;
  if (pageAny[WELCOME_INIT]) return;
  pageAny[WELCOME_INIT] = true;
  await page.addInitScript(() => {
    try { window.localStorage.setItem('topis-welcome-seen', '1'); } catch { /* ignore */ }
  });
}

/** Base URL: env BASE_URL (z.B. für Live-Tests) → sonst playwright config baseURL
 * (lokaler Dev-Server, via goto('')). */
export async function gotoTopis(page: Page): Promise<void> {
  await ensureWelcomeSuppressed(page);
  const url = process.env.BASE_URL || '';
  await page.goto(url);
  // Wait until Zustand has hydrated localStorage. The store sets a known shape.
  await page.waitForFunction(() => {
    try {
      const raw = window.localStorage.getItem('topis-layout');
      if (!raw) return true; // first visit, fresh state
      const obj = JSON.parse(raw);
      return obj && obj.state && Array.isArray(obj.state.objects);
    } catch {
      return false;
    }
  }, { timeout: 10_000 });
  await page.waitForLoadState('networkidle');
  await dismissWelcomeOverlay(page);
}

/**
 * Erstkontakt-Overlay (WelcomeOverlay, seit Commit 3dc8f695) schließen.
 * Es liegt als `fixed inset-0 z-[90]` über dem Editor und fängt Pointer-Events
 * ab → sonst laufen alle Klicks in 30s-Timeouts ("subtree intercepts pointer
 * events"). Erscheint nur bei leerem Layout (objects.length === 0) und einmal
 * pro Browser (localStorage `topis-welcome-seen`). Idempotent: kein Overlay → no-op.
 */
export async function dismissWelcomeOverlay(page: Page): Promise<void> {
  // Das Overlay ist Hydration-gated (mountet erst per useEffect nach persist-
  // Rehydration) und erscheint nur, wenn `topis-welcome-seen` noch nicht gesetzt
  // ist. Wenn der Flag schon steht → gar kein Overlay, kein Warten nötig.
  const seen = await page.evaluate(() => {
    try { return window.localStorage.getItem('topis-welcome-seen') === '1'; }
    catch { return false; }
  });
  if (seen) return;
  const overlay = page.locator('div.fixed.inset-0.z-\\[90\\]');
  // Kurz auf das (verzögert mountende) Overlay warten. Erscheint es nicht
  // (z.B. weil bereits Objekte im Layout sind → kein Overlay), ist das ein no-op.
  const appeared = await overlay.waitFor({ state: 'visible', timeout: 2_000 })
    .then(() => true).catch(() => false);
  if (!appeared) return;
  await page.getByRole('button', { name: 'Schließen' }).click().catch(() => {});
  await overlay.waitFor({ state: 'detached', timeout: 3_000 }).catch(() => {});
}

export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await gotoTopis(page);
}

/** Direct Zustand-state mutation via localStorage. Use this to prepare state
 * for a test without doing 30 clicks. The app persists `topis-layout` with
 * shape `{ state: TopisState, version: number }`. */
export async function patchLayoutState(
  page: Page,
  patcher: (state: Record<string, unknown>, arg?: unknown) => void,
  arg?: unknown,
): Promise<void> {
  // Vollen State aus dem Live-Store nehmen (immer komplett, inkl. halls) statt aus
  // localStorage — bei frischer Seite ist dort noch nichts/unvollständig geschrieben.
  // setState schreibt den Patch in den Store, dessen Persist + ein Direkt-Write nach
  // localStorage verhindern, dass ein ausstehender App-Write den Patch überschreibt.
  await page.waitForFunction(() => !!(window as unknown as { __topisStore?: unknown }).__topisStore);
  await page.evaluate(({ patchFn, arg }) => {
    const store = (window as unknown as { __topisStore: { getState: () => Record<string, unknown>; setState: (s: Record<string, unknown>) => void } }).__topisStore;
    const s = store.getState();
    const state: Record<string, unknown> = JSON.parse(JSON.stringify({
      halls: s.halls, activeHallId: s.activeHallId, hall: s.hall,
      objects: s.objects, objectIdCounter: s.objectIdCounter,
      paths: s.paths, gaenge: s.gaenge, pathAreas: s.pathAreas, conveyors: s.conveyors,
    }));
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function('state', 'arg', patchFn)(state, arg);
    store.setState(state);
    const raw = window.localStorage.getItem('topis-layout');
    const version = raw ? (JSON.parse(raw).version ?? 0) : 0;
    const existing = raw ? JSON.parse(raw).state : {};
    window.localStorage.setItem('topis-layout', JSON.stringify({ state: { ...existing, ...state }, version }));
  }, { patchFn: `(${patcher.toString()})(state, arg)`, arg });
  await page.reload();
  await gotoTopis(page);
}

export async function readLayoutState(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('topis-layout');
    if (!raw) return {};
    return JSON.parse(raw).state ?? {};
  });
}

/** Findet das Eingabefeld zu einem Label-Text. Die App verknüpft <Label> NICHT
 * via htmlFor mit <Input> (shadcn-Pattern: beide liegen im selben space-y-Div),
 * daher funktioniert getByLabel nicht — hier über den gemeinsamen Container. */
/** Name des aktuell selektierten Objekts aus dem Live-Store (selectedObject wird
 * NICHT in localStorage persistiert, daher über window.__topisStore). */
export async function selectedObjectName(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const store = (window as unknown as { __topisStore?: { getState: () => { selectedObject: { name?: string } | null } } }).__topisStore;
    return store?.getState().selectedObject?.name ?? null;
  });
}

/** Objekt über die linke Objektliste selektieren. Nötig, weil selectedObject
 * NICHT persistiert wird — per localStorage injiziertes selectedObject geht beim
 * Reload verloren, das Objekt selbst (in objects[]) bleibt aber und ist klickbar. */
export async function selectObjectByName(page: Page, name: string): Promise<void> {
  await page.getByText(name, { exact: false }).first().click();
}

export function inputByLabel(page: Page, labelText: string | RegExp) {
  // Nur echte <label>-Elemente matchen (nicht Beschreibungstexte, die denselben
  // Wortlaut enthalten). Label + Input liegen als Geschwister im selben Div.
  return page.locator('label').filter({ hasText: labelText }).first()
    .locator('xpath=..').locator('input, select, textarea').first();
}

/** Insert four outer walls into the active hall — needed for UC-11 since the
 * default empty hall has walls: []. 100m × 50m default hall, four wall segments
 * along the perimeter. */
export async function loadHallWithWalls(page: Page): Promise<void> {
  await patchLayoutState(page, (state) => {
    const halls = (state as { halls?: Array<{ id: number; walls: unknown[] }> }).halls;
    const activeId = (state as { activeHallId?: number }).activeHallId ?? 1;
    if (!halls) return;
    const hall = halls.find((h) => h.id === activeId);
    if (!hall) return;
    hall.walls = [
      { x1: 0,   y1: 0,  x2: 100, y2: 0  },
      { x1: 100, y1: 0,  x2: 100, y2: 50 },
      { x1: 100, y1: 50, x2: 0,   y2: 50 },
      { x1: 0,   y1: 50, x2: 0,   y2: 0  },
    ];
  });
  const state = await readLayoutState(page);
  const halls = state.halls as Array<{ id: number; walls: unknown[] }>;
  const hall = halls.find((h) => h.id === (state.activeHallId as number));
  expect(hall?.walls).toHaveLength(4);
}

/**
 * Öffnet ein Modul aus dem "Module"-Dropdown der Layout-Phase.
 * IA-Pass Commit b30f5cb2: das frühere Sammel-Dropdown "Lastenheft" wurde
 * aufgeteilt. Verlader-Modul + Unterflurförderkette liegen jetzt hier.
 */
export async function openModulDialog(
  page: Page,
  menuItemLabelFragment: string,
): Promise<void> {
  await page.getByRole('button', { name: 'Module' }).click();
  await page.getByRole('menuitem', { name: new RegExp(menuItemLabelFragment) }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

/**
 * Wechselt in die Auswertungs-Phase. Dort liegen (IA-Pass b30f5cb2) die früher
 * im "Lastenheft"-Dropdown gebündelten Analyse-Dialoge als eigene Buttons:
 * Mengen-Modell, Relations-Plan, Bereichseinteilung. Diese Buttons sind erst
 * bedienbar, wenn Objekte im Layout sind (Container `pointer-events-none` bei
 * leerem Layout) — Tests müssen also vorher seeden.
 */
export async function gotoAuswertungPhase(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Auswertung' }).click();
  await expect(page.getByRole('button', { name: 'Relations-Plan' })).toBeVisible();
}

/**
 * Öffnet einen Analyse-Dialog per Button-Namen in der Auswertungs-Phase.
 * Setzt voraus, dass bereits Objekte geseedet sind (siehe gotoAuswertungPhase).
 */
export async function openAuswertungDialog(
  page: Page,
  buttonName: string | RegExp,
): Promise<void> {
  await gotoAuswertungPhase(page);
  await page.getByRole('button', { name: buttonName }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

export async function closeAnyDialog(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 3_000 });
}
