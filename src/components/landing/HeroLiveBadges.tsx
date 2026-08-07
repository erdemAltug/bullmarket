'use client';

import { useMemo } from 'react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { cn, formatPercent } from '@/lib/utils';

const WATCH = [
  { match: 'AKBNK', fallback: 'AKBNK', currency: 'TRY' as const },
  { match: 'NVDA', fallback: 'NVDA', currency: 'USD' as const },
  { match: 'BTC', fallback: 'BTC', currency: 'USD' as const },
] as const;

export function HeroLiveBadges() {
  const { data } = useMarketScanner();

  const badges = useMemo(() => {
    return WATCH.map((w) => {
      const hit = data?.find(
        (i) =>
          i.displaySymbol.toUpperCase().includes(w.match) ||
          i.symbol.toUpperCase().includes(w.match)
      );
      if (!hit) {
        return {
          key: w.fallback,
          label: w.fallback,
          price: null as number | null,
          change: null as number | null,
          score: null as number | null,
          currency: w.currency,
        };
      }
      return {
        key: hit.displaySymbol,
        label: hit.displaySymbol,
        price: hit.price,
        change: hit.changePercent,
        score: scoreOpportunity(hit),
        currency: hit.currency,
      };
    });
  }, [data]);

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => {
        const prefix = b.currency === 'USD' ? '$' : '₺';
        const up = (b.change ?? 0) >= 0;
        return (
          <span
            key={b.key}
            className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]/90 px-2.5 py-1.5 text-[11px] font-semibold"
          >
            <span className="text-[var(--accent)]">{b.label}</span>
            {b.price != null ? (
              <span className="tabular-nums text-[var(--foreground)]">
                {prefix}
                {b.price.toLocaleString('tr-TR', {
                  maximumFractionDigits: b.price >= 100 ? 2 : 4,
                })}
              </span>
            ) : (
              <span className="text-[var(--muted)]">…</span>
            )}
            {b.change != null ? (
              <span
                className={cn(
                  'tabular-nums',
                  up ? 'text-[var(--up)]' : 'text-[var(--down)]'
                )}
              >
                {formatPercent(b.change)}
              </span>
            ) : null}
            {b.score != null ? (
              <span className="rounded-md bg-[var(--glow-up)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--up)]">
                Skor {b.score}/100
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
