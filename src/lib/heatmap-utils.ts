import { ObjektMetrik, HeatmapModus, Farbskala } from './betriebsdaten-store';

/**
 * Get the metric value for a given object and display mode
 */
export function getMetrikWert(metrik: ObjektMetrik, modus: HeatmapModus): number {
  switch (modus) {
    case 'sendungen':
      return metrik.sendungen;
    case 'colli':
      return metrik.colli;
    case 'gewicht':
      return metrik.gewicht;
    case 'auslastung':
      return metrik.auslastung;
    case 'ladezeit':
      return metrik.durchschnittLadezeit;
    default:
      return metrik.sendungen;
  }
}

/**
 * Format a metric value for display on the heatmap
 */
export function formatMetrikWert(wert: number, modus: HeatmapModus): string {
  switch (modus) {
    case 'sendungen':
      return `${Math.round(wert)} Sdg`;
    case 'colli':
      return `${Math.round(wert)} Cll`;
    case 'gewicht':
      return wert >= 1000 ? `${(wert / 1000).toFixed(1)}t` : `${Math.round(wert)}kg`;
    case 'auslastung':
      return `${Math.round(wert * 100)}%`;
    case 'ladezeit':
      return wert >= 60 ? `${(wert / 60).toFixed(1)}min` : `${Math.round(wert)}s`;
    default:
      return `${Math.round(wert)}`;
  }
}

/**
 * Calculate heatmap color based on intensity (0-1), color scale, and opacity
 */
export function getHeatmapColor(
  intensity: number,
  farbskala: Farbskala,
  opacityFactor: number
): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  const alpha = clamped * opacityFactor;

  switch (farbskala) {
    case 'gruen-rot': {
      // Green (low) → Yellow (mid) → Red (high)
      const r = clamped < 0.5 ? Math.round(255 * (clamped * 2)) : 255;
      const g = clamped < 0.5 ? 255 : Math.round(255 * (1 - (clamped - 0.5) * 2));
      return `rgba(${r}, ${g}, 0, ${alpha.toFixed(2)})`;
    }
    case 'blau-rot': {
      // Blue (low) → Purple (mid) → Red (high)
      const r = Math.round(255 * clamped);
      const b = Math.round(255 * (1 - clamped));
      return `rgba(${r}, 0, ${b}, ${alpha.toFixed(2)})`;
    }
    case 'mono': {
      // Transparent (low) → Dark red (high)
      return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
    }
    default:
      return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
  }
}

/**
 * Get a label for the heatmap mode
 */
export function getModusLabel(modus: HeatmapModus): string {
  switch (modus) {
    case 'sendungen': return 'Sendungen';
    case 'colli': return 'Colli';
    case 'gewicht': return 'Gewicht';
    case 'auslastung': return 'Auslastung';
    case 'ladezeit': return 'Ø Ladezeit';
  }
}
