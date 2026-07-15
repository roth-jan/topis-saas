'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, FolderOpen, Trash2, History } from 'lucide-react';
import {
  sortiereMonate,
  gruppiereNachKunde,
  type CloudProzessmodellMonat,
} from '@/lib/cloud-prozessmodelle';

/** Gespeicherte Monate (Cloud) mit Trend — für Berater nach Kunde gruppiert. */
export function VerlaufPanel({
  monate,
  eigeneId,
  loading,
  onLoad,
  onDelete,
  onVersionen,
}: {
  monate: CloudProzessmodellMonat[];
  eigeneId: string | null;
  loading: boolean;
  onLoad: (m: CloudProzessmodellMonat) => void;
  onDelete: (m: CloudProzessmodellMonat) => void;
  onVersionen?: (m: CloudProzessmodellMonat) => void;
}) {
  const gruppen = useMemo(() => gruppiereNachKunde(monate, eigeneId), [monate, eigeneId]);

  if (loading) {
    return <div className="text-xs text-muted-foreground px-1 py-2">Lade gespeicherte Monate…</div>;
  }
  if (gruppen.length === 0) {
    return (
      <div className="text-xs text-muted-foreground rounded-lg border border-dashed px-3 py-3 text-center">
        Noch keine Monate gespeichert. Excel laden und oben &bdquo;Monat speichern&ldquo; klicken &mdash;
        ab dem zweiten Monat entsteht hier der Trend.
      </div>
    );
  }
  const mehrere = gruppen.length > 1;
  return (
    <div className="flex flex-col gap-3">
      {gruppen.map((g) => (
        <MonatsListe
          key={g.ownerId}
          monate={g.monate}
          titel={mehrere || !g.eigene ? g.label : undefined}
          loeschbar={g.eigene}
          onLoad={onLoad}
          onDelete={onDelete}
          onVersionen={onVersionen}
        />
      ))}
    </div>
  );
}

function MonatsListe({
  monate,
  titel,
  loeschbar,
  onLoad,
  onDelete,
  onVersionen,
}: {
  monate: CloudProzessmodellMonat[];
  titel?: string;
  loeschbar: boolean;
  onLoad: (m: CloudProzessmodellMonat) => void;
  onDelete: (m: CloudProzessmodellMonat) => void;
  onVersionen?: (m: CloudProzessmodellMonat) => void;
}) {
  const sorted = useMemo(() => sortiereMonate(monate), [monate]);
  const max = Math.max(...sorted.map((m) => m.kennzahlen.maStundenProzesse), 1);

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" />
        {titel ?? 'Gespeicherte Monate'} ({sorted.length})
      </div>
      <table className="w-full text-[11px]">
        <thead className="text-muted-foreground">
          <tr className="text-left">
            <th className="px-3 py-1 font-medium">Monat</th>
            <th className="px-2 py-1 font-medium text-right">MA-Std.</th>
            <th className="px-2 py-1 font-medium text-right">Δ Vormonat</th>
            <th className="px-2 py-1 font-medium hidden sm:table-cell" aria-label="Verhältnis" />
            <th className="px-2 py-1" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => {
            const delta = i > 0 ? m.kennzahlen.maStundenProzesse - sorted[i - 1].kennzahlen.maStundenProzesse : null;
            return (
              <tr key={m.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-1 font-medium whitespace-nowrap">{m.monat}</td>
                <td className="px-2 py-1 text-right font-mono tabular-nums">
                  {m.kennzahlen.maStundenProzesse.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
                </td>
                <td className="px-2 py-1 text-right font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                  {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta.toLocaleString('de-DE', { maximumFractionDigits: 1 })}`}
                </td>
                <td className="px-2 py-1 hidden sm:table-cell">
                  <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary/70"
                      style={{ width: `${Math.min(100, (m.kennzahlen.maStundenProzesse / max) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-[11px]" onClick={() => onLoad(m)}>
                    <FolderOpen className="h-3 w-3" />
                    Laden
                  </Button>
                  {onVersionen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-muted-foreground"
                      onClick={() => onVersionen(m)}
                      aria-label={`Versionen von ${m.monat}`}
                      title="Versionshistorie"
                    >
                      <History className="h-3 w-3" />
                    </Button>
                  )}
                  {loeschbar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(m)}
                      aria-label={`Monat ${m.monat} löschen`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
