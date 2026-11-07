'use client';

import { useBist } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';
import { useQuickChart } from './QuickChart';

const INDICES: { symbol: string; label: string; region: string }[] = [
  { symbol: '^GSPC', label: 'S&P 500', region: 'ABD' },
  { symbol: '^IXIC', label: 'Nasdaq', region: 'ABD' },
  { symbol: '^DJI', label: 'Dow Jones', region: 'ABD' },
  { symbol: '^GDAXI', label: 'DAX', region: 'Almanya' },
  { symbol: '^FTSE', label: 'FTSE 100', region: 'İngiltere' },
  { symbol: '^N225', label: 'Nikkei 225', region: 'Japonya' },
];

const QUERY = INDICES.map((i) => i.symbol).join(',');

/** Major world indices with day change and where they sit in their 52-week range. */
export function WorldIndices() {
  const { data, isLoading } = useBist(QUERY);
  const bySymbol = new Map((data?.quotes ?? []).map((q) => [q.symbol, q]));
  const openChart = useQuickChart();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-3 text-base font-semibold">Dünya endeksleri</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {INDICES.map((idx) => {
          const q = bySymbol.get(idx.symbol);
          if (!q) {
            return (
              <div key={idx.symbol} className="h-[104px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--border)]/20">
                {!isLoading ? <p className="p-3 text-xs text-[var(--muted)]">{idx.label} · veri yok</p> : null}
              </div>
            );
          }
          const lo = q.fiftyTwoWeekLow ?? null;
          const hi = q.fiftyTwoWeekHigh ?? null;
          const pos = lo != null && hi != null && hi > lo ? Math.min(100, Math.max(0, ((q.price - lo) / (hi - lo)) * 100)) : null;
          const up = q.changePercent >= 0;
          return (
            <button
              key={idx.symbol}
              type="button"
              onClick={() =>
                openChart?.({
                  title: idx.label,
                  subtitle: `${idx.region} borsa endeksi`,
                  market: 'Endeks',
                  chartSymbol: idx.symbol,
                  price: q.price,
                  changePercent: q.changePercent,
                })
              }
              className="rounded-xl border border-[var(--border)] p-3 text-left transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--surface)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold">{idx.label}</p>
                <p className="text-[10px] text-[var(--muted)]">{idx.region}</p>
              </div>
              <p className="mt-1 font-mono text-lg font-bold tabular-nums">
                {q.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
              <p className={cn('font-mono text-xs font-semibold', up ? 'text-emerald-400' : 'text-rose-400')}>
                {up ? '+' : ''}
                {q.changePercent.toFixed(2)}%
              </p>
              {pos != null ? (
                <>
                <div className="relative mt-2 h-1 rounded-full bg-[var(--border)]" title="52 haftalık aralık">
                  <span
                    className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]"
                    style={{ left: `${pos}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-[var(--muted)]">
                  <span>52 haftalık dip</span>
                  <span>zirve</span>
                </div>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
