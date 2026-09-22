'use client';

import { zahl } from '@/lib/format';
import type { AbteilungDefinition } from '@/types/prozessmodell';

interface Props {
  aktuell: Record<string, number>;   // Min/Colli je Abteilung, Ihre Halle
  bester: Record<string, number>;    // Min/Colli je Abteilung, beste Vergleichshalle
  abteilungen: AbteilungDefinition[];
  anzahlVergleich: number;
}

/**
 * Minuten pro Colli je Abteilung: Ihre Halle gegen die jeweils beste Vergleichshalle.
 * Kürzer ist besser. Zwei Reihen → Legende + Werte direkt am Balken.
 */
export function AbteilungsVergleich({ aktuell, bester, abteilungen, anzahlVergleich }: Props) {
  const zeilen = abteilungen
    .map((a) => ({ id: a.id, label: a.label, ihre: aktuell[a.id] ?? 0, best: bester[a.id] ?? 0 }))
    .filter((z) => z.ihre > 0 || z.best > 0);
  const max = Math.max(0.01, ...zeilen.flatMap((z) => [z.ihre, z.best]));

  return (
    <figure>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--viz-halle)' }} />Ihre Halle</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--viz-vergleich)' }} />Beste von {anzahlVergleich} Vergleichshallen</span>
      </div>
      <div className="space-y-4">
        {zeilen.map((z) => (
          <div key={z.id}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium">{z.label}</span>
              {z.ihre > z.best && z.best > 0 && (
                <span className="text-xs text-muted-foreground">+{zahl(z.ihre - z.best, 2)} Min pro Colli</span>
              )}
            </div>
            {[{ v: z.ihre, farbe: 'var(--viz-halle)', name: 'Ihre Halle' }, { v: z.best, farbe: 'var(--viz-vergleich)', name: 'Beste Vergleichshalle' }].map((b) => (
              <div key={b.name} className="flex items-center gap-2 py-[1px]" title={`${b.name}: ${zahl(b.v, 2)} Min/Colli`}>
                <div className="h-3 flex-1">
                  <div className="h-3 rounded-r-[4px]" style={{ width: `${(b.v / max) * 100}%`, background: b.farbe }} />
                </div>
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{zahl(b.v, 2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">Minuten pro Colli, kürzer ist besser.</figcaption>
    </figure>
  );
}
