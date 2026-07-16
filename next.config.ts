import type { NextConfig } from "next";

// BasePath ist deploy-abhängig:
//   GitHub Pages (Default): "/topis-saas" — Repo-Unterpfad.
//   Hetzner (topis.ntc.software): "" — eigene Domain, Root.
// Build für Hetzner: TOPIS_BASE_PATH="" npm run build
const basePath = process.env.TOPIS_BASE_PATH ?? "/topis-saas";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  env: {
    // Für harte Links (<a>, window.location) — siehe src/lib/base-path.ts
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // GitHub Pages liefert nur dann eine Seite wenn die Ausgabe-Form mit
  // der URL-Form übereinstimmt. Ohne trailingSlash erzeugt der Static-
  // Export nur /pfad.html — /pfad/ (mit Slash) liefert dann 404. Mail-
  // Clients und manche Mobile-Browser hängen aber gern automatisch
  // einen Slash an. Mit trailingSlash=true entsteht /pfad/index.html,
  // GitHub Pages bedient beide Formen sauber.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
