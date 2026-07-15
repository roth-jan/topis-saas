'use client';

import { TrendingUp } from 'lucide-react';
import type { AsProzessModell } from '@/lib/prozessmodell-excel-modell';

/** MA-Stunden-Übersicht (SE/SA) — kompaktes Seitenpanel, rechnet live mit. */
export function UebersichtPanel({ modell }: { modell: AsProzessModell }) {
  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      {modell.uebersicht.map((sek, si) => (
        <div key={si} className={si > 0 ? 'border-t' : ''}>
          <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {sek.titel}
            </div>
            <div className="font-mono text-xs font-semibold tabular-nums">
              {sek.summeProzesse.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h
            </div>
          </div>
          <table className="w-full text-[11px]">
            <tbody>
              {sek.prozesse.map((p, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-1 truncate max-w-[180px]" title={p.name}>{p.name}</td>
                  <td className="px-2 py-1 text-right font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                    {p.minProColli.toFixed(3)}
                  </td>
                  <td className="px-3 py-1 text-right font-mono tabular-nums font-medium whitespace-nowrap">
                    {p.maStunden.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
