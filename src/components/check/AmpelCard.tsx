'use client';

import type { AmpelKPI } from '@/lib/ampel-system';

interface AmpelCardProps {
  kpi: AmpelKPI;
}

const STATUS_COLORS = {
  gruen: { bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-500', text: 'text-green-400' },
  gelb: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-500', text: 'text-yellow-400' },
  rot: { bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', text: 'text-red-400' },
};

/**
 * Ampel-Karte: Zeigt einen KPI mit farbigem Status-Punkt.
 */
export function AmpelCard({ kpi }: AmpelCardProps) {
  const colors = STATUS_COLORS[kpi.status];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 flex flex-col gap-2`}>
      {/* Status Dot + Label */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colors.dot} shadow-lg`} />
        <span className="text-sm text-muted-foreground">{kpi.label}</span>
      </div>

      {/* Wert */}
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${colors.text}`}>{kpi.wert}</span>
        <span className="text-sm text-muted-foreground">{kpi.einheit}</span>
      </div>

      {/* Referenz */}
      <div className="text-xs text-muted-foreground">
        {kpi.referenz}
      </div>

      {/* Delta */}
      {kpi.delta !== 0 && (
        <div className={`text-xs font-medium ${colors.text}`}>
          {kpi.delta > 0 ? '+' : ''}{Math.round(kpi.delta)}% vs. Benchmark
        </div>
      )}
    </div>
  );
}
