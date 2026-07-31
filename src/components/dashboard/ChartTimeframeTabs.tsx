'use client';

import { CHART_TIMEFRAMES, type ChartTimeframe } from '@/lib/chart-timeframes';
import { cn } from '@/lib/utils';

interface ChartTimeframeTabsProps {
  value: ChartTimeframe;
  onChange: (tf: ChartTimeframe) => void;
}

export function ChartTimeframeTabs({
  value,
  onChange,
}: ChartTimeframeTabsProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900 p-1"
      role="tablist"
      aria-label="Chart timeframe"
    >
      {CHART_TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          type="button"
          role="tab"
          aria-selected={value === tf}
          onClick={() => onChange(tf)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === tf
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
