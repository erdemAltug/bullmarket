'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';
import { targetFromScanner, useQuickChart } from '@/components/terminal/QuickChart';

type Market = 'BIST' | 'US' | 'CRYPTO';
type Tab = 'up' | 'down' | 'volume' | 'score';

const MARKETS: { id: Market; label: string }[] = [
  { id: 'BIST', label: 'BİST' },
  { id: 'US', label: 'ABD' },
  { id: 'CRYPTO', label: 'Kripto' },
];
const TABS: { id: Tab; label: string }[] = [
  { id: 'up', label: 'Yükselenler' },
  { id: 'down', label: 'Düşenler' },
  { id: 'volume', label: 'Hacim liderleri' },
  { id: 'score', label: 'En yüksek skor' },
];
const ROWS = 8;

function price(v: number, usd: boolean) {
  return `${usd ? '$' : '₺'}${v.toLocaleString('tr-TR', { maximumFractionDigits: v >= 1 ? 2 : 4 })}`;
}

/** Tabbed movers board: the fastest way to see what is moving right now. */
export function MarketMovers({ items, loading }: { items: ScannerItem[]; loading?: boolean }) {
  const [market, setMarket] = useState<Market>('BIST');
  const [tab, setTab] = useState<Tab>('up');
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlist();
  const openChart = useQuickChart();

  const rows = useMemo(() => {
    const list = items.filter(
      (i) => i.category === market && i.price > 0 && !i.displaySymbol.startsWith('XU') && Math.abs(i.changePercent) < 40
    );
    const withScore = list.map((i) => ({ item: i, score: scoreOpportunity(i) }));
    const by: Record<Tab, (a: (typeof withScore)[number], b: (typeof withScore)[number]) => number> = {
      up: (a, b) => b.item.changePercent - a.item.changePercent,
      down: (a, b) => a.item.changePercent - b.item.changePercent,
      volume: (a, b) => b.item.volumeRaw - a.item.volumeRaw,
      score: (a, b) => b.score - a.score,
    };
    return [...withScore].sort(by[tab]).slice(0, ROWS);
  }, [items, market, tab]);

  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.item.changePercent)));
  const listHref =
    market === 'BIST'
      ? tab === 'down'
        ? '/bist/en-cok-dusen-hisseler'
        : tab === 'score'
          ? '/bist/en-yuksek-skorlu-hisseler'
          : '/bist/en-cok-yukselen-hisseler'
      : market === 'US'
        ? '/nasdaq/en-yuksek-skorlu-hisseler'
        : '/kripto/en-yuksek-skorlu-coinler';

  return (
    <section className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Piyasa hareketleri</h2>
        <div className="flex rounded-lg border border-[var(--border)] p-0.5">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMarket(m.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                market === m.id ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-2.5 py-2 text-xs font-medium transition-colors',
              tab === t.id ? 'border-[var(--accent)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-1 divide-y divide-[var(--border)]/60">
        {loading && !rows.length
          ? Array.from({ length: ROWS }).map((_, i) => (
              <li key={i} className="py-2.5">
                <div className="h-5 animate-pulse rounded bg-[var(--border)]/50" />
              </li>
            ))
          : rows.map(({ item, score }) => {
              const up = item.changePercent >= 0;
              const usd = item.currency === 'USD';
              const href = assetDetailHref(item.symbol, item.category);
              const starred = hasSymbol(item.symbol);
              return (
                <li
                  key={item.symbol}
                  onClick={openChart ? () => openChart(targetFromScanner(item, href)) : undefined}
                  className={cn('group flex items-center gap-3 py-2', openChart && '-mx-2 cursor-pointer rounded-lg px-2 hover:bg-[var(--surface)]')}
                >
                  <button
                    type="button"
                    aria-label={starred ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (starred) removeSymbol(item.symbol);
                      else addSymbol(item.symbol);
                    }}
                    className={cn('shrink-0', starred ? 'text-amber-400' : 'text-[var(--muted)] hover:text-amber-400')}
                  >
                    <Star className={cn('size-3.5', starred && 'fill-amber-400')} />
                  </button>
                  <div className="min-w-0 flex-1">
                    {href ? (
                      <Link
                        href={href}
                        onClick={(e) => {
                          if (openChart && !e.metaKey && !e.ctrlKey) e.preventDefault();
                        }}
                        className="text-sm font-semibold hover:text-[var(--accent)]"
                      >
                        {item.displaySymbol}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold">{item.displaySymbol}</span>
                    )}
                    <p className="truncate text-[10px] text-[var(--muted)]">{item.name}</p>
                  </div>
                  <div className="hidden w-24 sm:block">
                    {tab === 'volume' ? (
                      <span className="block text-right font-mono text-[11px] text-[var(--muted)]">{item.volume}</span>
                    ) : tab === 'score' ? (
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${score}%` }} />
                      </div>
                    ) : (
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className={cn('h-full rounded-full', up ? 'bg-emerald-400' : 'bg-rose-400')}
                          style={{ width: `${(Math.abs(item.changePercent) / maxAbs) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="w-24 text-right font-mono text-xs tabular-nums">{price(item.price, usd)}</span>
                  <span
                    className={cn(
                      'w-16 text-right font-mono text-xs font-semibold tabular-nums',
                      up ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {up ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                  <span className="hidden w-9 text-right font-mono text-[11px] text-[var(--muted)] md:inline">{score}</span>
                </li>
              );
            })}
      </ul>
      <Link href={listHref} className="mt-2 block text-right text-xs font-medium text-[var(--accent)] hover:underline">
        Tüm liste →
      </Link>
    </section>
  );
}
