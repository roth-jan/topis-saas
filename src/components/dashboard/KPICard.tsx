'use client';

import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  highlight?: boolean;
  details?: { label: string; value: string }[];
}

export function KPICard({ title, value, subtitle, icon, trend, highlight, details }: KPICardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? 'border-primary bg-primary/5 border-2' : 'bg-card'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{title}</div>
          <div className={`text-3xl font-bold mt-1 ${highlight ? 'text-primary' : ''}`}>{value}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      {trend && (
        <div className={`text-xs mt-2 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.value}
        </div>
      )}

      {details && details.length > 0 && (
        <div className="mt-3 pt-2 border-t space-y-1">
          {details.map((d) => (
            <div key={d.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
