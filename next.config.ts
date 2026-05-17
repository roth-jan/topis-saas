import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/topis-saas",
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
