'use client';

import {
  CHART_TIMEFRAMES,
  isIntraday,
  type ChartTimeframe,
} from '@/lib/chart-timeframes';
import { cn } from '@/lib/utils';

interface ChartTimeframeTabsProps {
  value: ChartTimeframe;
  onChange: (tf: ChartTimeframe) => void;
  /** Daily-only sources (TEFAS) have no intraday bars. */
  hideIntraday?: boolean;
}

export function ChartTimeframeTabs({
  value,
  onChange,
  hideIntraday = false,
}: ChartTimeframeTabsProps) {
  const options = hideIntraday
    ? CHART_TIMEFRAMES.filter((tf) => !isIntraday(tf))
    : CHART_TIMEFRAMES;
  return (
    <div
      className="inline-flex shrink-0 gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5"
      role="tablist"
      aria-label="Zaman aralığı"
    >
      {options.map((tf) => (
        <button
          key={tf}
          type="button"
          role="tab"
          aria-selected={value === tf}
          onClick={() => onChange(tf)}
          className={cn(
            'h-8 min-w-9 rounded-md px-2 font-mono text-xs font-semibold transition-colors',
            value === tf
              ? 'bg-[var(--accent)]/15 text-[var(--foreground)]'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
