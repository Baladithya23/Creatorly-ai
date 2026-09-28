import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accent?: boolean;
}

export function MetricDisplay({ label, value, subtext, trend, accent }: MetricDisplayProps) {
  return (
    <div className={`card-base ${accent ? 'border-teal-500/30 bg-teal-950/10' : ''}`}>
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`metric-value ${accent ? 'text-teal-400' : 'text-white'}`}>{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${trend.isPositive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
    </div>
  );
}
