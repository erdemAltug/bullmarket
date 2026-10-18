'use client';

import { useMemo } from 'react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { cn, formatPercent } from '@/lib/utils';

export function HeroAtmosphere() {
  const { data } = useMarketScanner();

  const snapshot = useMemo(() => {
    const list = data ?? [];
    const bist = list.filter((item) => item.category === 'BIST' && item.price > 0);
    const up = bist.filter((item) => item.changePercent > 0).length;
    const breadth = bist.length ? Math.round((up / bist.length) * 100) : null;
    const ranked = [...list]
      .filter((item) => item.price > 0)
      .sort((a, b) => scoreOpportunity(b) - scoreOpportunity(a));
    const lead = ranked[0] ?? null;
    return {
      breadth,
      up,
      total: bist.length,
      lead: lead
        ? {
            symbol: lead.displaySymbol,
            score: scoreOpportunity(lead),
            change: lead.changePercent,
          }
        : null,
    };
  }, [data]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="landing-grid absolute inset-0" />

      <aside className="landing-float absolute left-0 top-16 hidden w-36 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-3 backdrop-blur-sm lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Piyasa genişliği
        </p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--foreground)]">
          {snapshot.breadth != null ? `%${snapshot.breadth}` : '—'}
        </p>
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          {snapshot.total > 0
            ? `${snapshot.up}/${snapshot.total} BİST yükselişte`
            : 'BİST taraması'}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${snapshot.breadth ?? 12}%` }}
          />
        </div>
      </aside>

      <aside className="landing-float landing-float-late absolute right-0 top-24 hidden w-36 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-3 backdrop-blur-sm lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Günün skoru
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--accent)]">
            {snapshot.lead?.symbol ?? 'THYAO'}
          </p>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[var(--foreground)]">
            {snapshot.lead ? snapshot.lead.score : '—'}
          </p>
        </div>
        <p
          className={cn(
            'mt-1 font-mono text-[11px] tabular-nums',
            snapshot.lead
              ? snapshot.lead.change >= 0
                ? 'text-[var(--up)]'
                : 'text-[var(--down)]'
              : 'text-[var(--muted)]'
          )}
        >
          {snapshot.lead ? formatPercent(snapshot.lead.change) : '0–100 skor'}
        </p>
      </aside>
    </div>
  );
}
