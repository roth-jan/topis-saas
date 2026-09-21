'use client';

import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import type { AmpelKPI } from '@/lib/ampel-system';
import { zahl } from '@/lib/format';

interface AmpelCardProps {
  kpi: AmpelKPI;
}

// Status nie nur über Farbe: jede Ampel trägt Symbol + Wort.
const STATUS = {
  gruen: { wort: 'Im Rahmen', Icon: CheckCircle2, rand: 'border-emerald-600/25', flaeche: 'bg-emerald-600/[0.06]', text: 'text-emerald-800 dark:text-emerald-300' },
  gelb: { wort: 'Beobachten', Icon: AlertCircle, rand: 'border-amber-600/30', flaeche: 'bg-amber-500/[0.08]', text: 'text-amber-800 dark:text-amber-300' },
  rot: { wort: 'Handlungsbedarf', Icon: AlertTriangle, rand: 'border-red-700/25', flaeche: 'bg-red-700/[0.06]', text: 'text-red-800 dark:text-red-300' },
};

export function AmpelCard({ kpi }: AmpelCardProps) {
  const s = STATUS[kpi.status];
  const delta = kpi.id === 'minProColli' || kpi.id === 'colliProMAh' ? kpi.delta : 0;
  return (
    <div className={`flex flex-col rounded-lg border ${s.rand} ${s.flaeche} p-4`}>
      <span className="text-sm font-medium text-foreground">{kpi.label}</span>
      <span className={`mt-1 flex items-center gap-1 text-xs font-medium ${s.text}`}>
        <s.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {s.wort}
      </span>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{kpi.wert}</span>
        <span className="text-sm text-muted-foreground">{kpi.einheit}</span>
      </div>
      <div className="mt-auto pt-3 text-xs text-muted-foreground">
        <div>{kpi.referenz}</div>
        {Math.abs(delta) >= 1 && (
          <div className={`font-medium ${s.text}`}>{delta > 0 ? '+' : ''}{zahl(delta)} % gegenüber der besten</div>
        )}
      </div>
    </div>
  );
}
