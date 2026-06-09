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
  patcher: (state: Record<string, unknown>) => void,
): Promise<void> {
  await page.evaluate((patchFn) => {
    const raw = window.localStorage.getItem('topis-layout');
    const stored = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function('state', patchFn)(stored.state);
    window.localStorage.setItem('topis-layout', JSON.stringify(stored));
  }, `(${patcher.toString()})(state)`);
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
