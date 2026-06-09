import { expect, Page } from '@playwright/test';

/** Base URL: env BASE_URL (z.B. für Live-Tests) → sonst playwright config baseURL
 * (lokaler Dev-Server, via goto('')). */
export async function gotoTopis(page: Page): Promise<void> {
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

/** Click a menuitem inside the Lastenheft dropdown by its visible label fragment. */
export async function openLastenheftDialog(
  page: Page,
  menuItemLabelFragment: string,
): Promise<void> {
  await page.getByRole('button', { name: 'Lastenheft' }).click();
  await page.getByRole('menuitem', { name: new RegExp(menuItemLabelFragment) }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

export async function closeAnyDialog(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 3_000 });
}
