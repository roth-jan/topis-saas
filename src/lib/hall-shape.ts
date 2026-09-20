import type { Hall } from '@/types/topis';

/**
 * Grundriss-Umriss einer Halle als Polygon in Welt-Metern (Ursprung 0,0 = linke
 * obere Ecke der Bounding-Box, x nach rechts, y nach unten — wie im Canvas).
 *
 * Lastenheft 3.1.1.1: neben dem Rechteck sind L-/T-/U-/C-Grundrisse Standard-
 * Hallenformen. Diese Funktion liefert NUR die Außenkontur zum Zeichnen; die
 * Tor-Verankerung (deriveWalls) bleibt vorerst rechteckbasiert (Bounding-Box),
 * d.h. Tore verankern an den äußeren Hauptwänden — Aussparungs-Innenwände sind
 * ein Folge-Schritt. Rechenlogik (Wege/Verteilweg) unberührt.
 *
 * Die Aussparungen sind fest proportioniert (Anteil der Breite/Höhe). Frei
 * einstellbare Notch-Maße sind additive Hall-Felder für später.
 */
export function hallOutline(hall: Pick<Hall, 'shape' | 'width' | 'height'>): { x: number; y: number }[] {
  const W = hall.width;
  const H = hall.height;
  if (!W || !H) return [];

  switch (hall.shape) {
    case 'L': {
      // Aussparung oben rechts.
      const nw = 0.45 * W;
      const nh = 0.45 * H;
      return [
        { x: 0, y: 0 },
        { x: W - nw, y: 0 },
        { x: W - nw, y: nh },
        { x: W, y: nh },
        { x: W, y: H },
        { x: 0, y: H },
      ];
    }
    case 'T': {
      // Vollbreiter Balken oben, mittiger Steg nach unten.
      const bh = 0.4 * H;          // Balkenhöhe
      const sw = 0.4 * W;          // Stegbreite
      const cx = W / 2;
      return [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: bh },
        { x: cx + sw / 2, y: bh },
        { x: cx + sw / 2, y: H },
        { x: cx - sw / 2, y: H },
        { x: cx - sw / 2, y: bh },
        { x: 0, y: bh },
      ];
    }
    case 'U': {
      // Zwei Schenkel nach oben, unten verbunden (Öffnung oben mittig).
      const lw = 0.3 * W;          // Schenkelbreite
      const uh = 0.6 * H;          // Tiefe der oberen Aussparung
      return [
        { x: 0, y: 0 },
        { x: lw, y: 0 },
        { x: lw, y: uh },
        { x: W - lw, y: uh },
        { x: W - lw, y: 0 },
        { x: W, y: 0 },
        { x: W, y: H },
        { x: 0, y: H },
      ];
    }
    case 'C': {
      // Wie U, aber Öffnung nach rechts.
      const ch = 0.3 * H;          // Höhe der oberen/unteren Balken
      const cw = 0.5 * W;          // innere Kante der Öffnung (Öffnungstiefe = W - cw)
      return [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: ch },
        { x: cw, y: ch },
        { x: cw, y: H - ch },
        { x: W, y: H - ch },
        { x: W, y: H },
        { x: 0, y: H },
      ];
    }
    case 'rect':
    default:
      return [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: H },
        { x: 0, y: H },
      ];
  }
}
