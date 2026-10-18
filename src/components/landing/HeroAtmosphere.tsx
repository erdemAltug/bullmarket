'use client';

import { useMemo } from 'react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { cn, formatPercent } from '@/lib/utils';
import type { ScannerItem } from '@/types/scanner';

function leadOf(items: ScannerItem[]) {
  const ranked = items
    .filter((item) => item.price > 0)
    .sort((a, b) => scoreOpportunity(b) - scoreOpportunity(a));
  const hit = ranked[0];
  if (!hit) return null;
  return {
    symbol: hit.displaySymbol,
    score: scoreOpportunity(hit),
    change: hit.changePercent,
  };
}

export function HeroAtmosphere() {
  const { data } = useMarketScanner();

  const cards = useMemo(() => {
    const list = data ?? [];
    const bist = list.filter((item) => item.category === 'BIST');
    const us = list.filter((item) => item.category === 'US');
    const crypto = list.filter((item) => item.category === 'CRYPTO');
    const priced = bist.filter((item) => item.price > 0);
    const up = priced.filter((item) => item.changePercent > 0).length;
    const breadth = priced.length ? Math.round((up / priced.length) * 100) : null;
    return {
      breadth,
      up,
      total: priced.length,
      nasdaq: leadOf(us),
      crypto: leadOf(crypto),
      score: leadOf(list),
    };
  }, [data]);

  return (
    <ul className="relative z-10 mt-8 grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
      <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          BİST genişliği
        </p>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">
          {cards.breadth != null ? `%${cards.breadth}` : '—'}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {cards.total > 0
            ? `${cards.up}/${cards.total} yükselişte`
            : 'Tarama yükleniyor'}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${cards.breadth ?? 8}%` }}
          />
        </div>
      </li>

      <MarketCard label="NASDAQ" hit={cards.nasdaq} empty="ABD taraması" />
      <MarketCard label="Kripto" hit={cards.crypto} empty="Kripto taraması" />
      <MarketCard label="Günün skoru" hit={cards.score} empty="Skor taraması" emphasize />
    </ul>
  );
}

function MarketCard({
  label,
  hit,
  empty,
  emphasize = false,
}: {
  label: string;
  hit: { symbol: string; score: number; change: number } | null;
  empty: string;
  emphasize?: boolean;
}) {
  const up = (hit?.change ?? 0) >= 0;
  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className={cn('text-sm font-semibold', emphasize ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>
          {hit?.symbol ?? '—'}
        </p>
        <p className="font-mono text-3xl font-semibold tabular-nums leading-none">
          {hit ? hit.score : '—'}
        </p>
      </div>
      <p
        className={cn(
          'mt-2 font-mono text-xs tabular-nums',
          hit ? (up ? 'text-[var(--up)]' : 'text-[var(--down)]') : 'text-[var(--muted)]'
        )}
      >
        {hit ? formatPercent(hit.change) : empty}
      </p>
    </li>
  );
}
