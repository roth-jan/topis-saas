'use client';

import { useMemo } from 'react';
import { Route, X } from 'lucide-react';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import type { AsProzessModell } from '@/lib/prozessmodell-excel-modell';

/**
 * UX-Paket 2 (Council 16.07.): die bisher UNSICHTBARE Brücke zwischen dem
 * Hallen-Layout (Editor rechnet dort den gewichteten Verteilweg per A*) und
 * dem Cockpit-Parameter „ø Verteilweg" sichtbar machen.
 *
 * Zeigt ein dezentes Banner, wenn (a) das Modell einen Verteilweg-Parameter
 * hat und (b) der Editor einen aus dem Layout berechneten Verteilweg kennt,
 * der abweicht — mit einem Klick übernehmbar.
 */
export function VerteilwegBruecke({
  modell,
  onUebernehmen,
  onSchliessen,
}: {
  modell: AsProzessModell;
  /** Setzt alle „ø Verteilweg"-Größen auf den Layout-Wert. */
  onUebernehmen: (wegM: number) => void;
  onSchliessen: () => void;
}) {
  // Layout-Verteilweg aus dem Editor-Store (nur wenn wirklich aus Layout berechnet).
  const layoutWeg = useProzessmodellStore((s) => {
    const p = s.parameter.find((x) => x.id === 'verteilweg');
    return p && p.quelle === 'layout' ? p.aktuellerWert : null;
  });

  // Aktueller Verteilweg-Wert im Cockpit-Modell (erste passende Größe).
  const cockpitWeg = useMemo(() => {
    for (const b of modell.bloecke) {
      const g = [...b.mengen, ...b.parameter].find((x) => /verteilweg/i.test(x.name));
      if (g) return g.wert;
    }
    return null;
  }, [modell]);

  if (layoutWeg == null || layoutWeg <= 0 || cockpitWeg == null) return null;
  // Nur zeigen, wenn es sich merklich unterscheidet (sonst nichts zu tun).
  if (Math.abs(layoutWeg - cockpitWeg) < 0.5) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
      <Route className="h-4 w-4 text-primary shrink-0" />
      <span className="flex-1">
        Aus Ihrem Hallen-Layout berechnet: <b>ø Verteilweg {layoutWeg.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m</b>
        {' '}(im Modell aktuell {cockpitWeg.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m).
      </span>
      <button
        onClick={() => onUebernehmen(layoutWeg)}
        className="rounded bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
      >
        Übernehmen
      </button>
      <button onClick={onSchliessen} aria-label="Hinweis schließen" className="text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
