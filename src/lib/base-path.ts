/**
 * BasePath-Helfer für harte Links (<a href>, window.location).
 *
 * Next.js prefixt nur <Link>-Navigationen automatisch mit dem basePath —
 * rohe Anker und window.location brauchen den Präfix selbst. Der Wert kommt
 * zur Build-Zeit aus next.config.ts (TOPIS_BASE_PATH):
 *   GitHub Pages: "/topis-saas" (Default) · Hetzner (topis.ntc.software): "".
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** App-interne URL mit korrektem basePath, z.B. appUrl('/projekt/'). */
export function appUrl(pfad: string): string {
  return `${BASE_PATH}${pfad}`;
}
