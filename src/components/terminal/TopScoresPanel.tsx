'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Target } from 'lucide-react';
import { buildPotentialCards } from '@/lib/ai-opportunity';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';
import { targetFromScanner, useChartClick } from './QuickChart';

const MARKET_LABEL: Record<string, string> = { BIST: 'BİST', US: 'ABD', CRYPTO: 'Kripto', FON: 'Fon', ETF: 'ETF' };

/** Today's highest analysis scores across all markets, compact. */
export function TopScoresPanel({ items, loading }: { items: ScannerItem[]; loading?: boolean }) {
  const cards = useMemo(() => buildPotentialCards(items, 8), [items]);
  const bySymbol = useMemo(() => new Map(items.map((i) => [i.symbol, i])), [items]);
  const chartClick = useChartClick();

  return (
    <section className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold">
          <Target className="size-4 text-[var(--accent)]" /> Günün en yüksek skorları
        </h2>
        <Link href="/firsatlar" className="text-xs text-[var(--accent)] hover:underline">
          Tümü →
        </Link>
      </div>
      <ol className="mt-3 space-y-2">
        {loading && !cards.length
          ? Array.from({ length: 8 }).map((_, i) => <li key={i} className="h-10 animate-pulse rounded-lg bg-[var(--border)]/40" />)
          : cards.map((c, i) => {
              const href = assetDetailHref(c.displaySymbol, c.category) ?? '/firsatlar';
              const src = bySymbol.get(c.symbol);
              return (
                <li key={c.symbol}>
                  <Link
                    href={href}
                    onClick={src ? chartClick(targetFromScanner(src, href)) : undefined}
                    className="group flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-[var(--surface)]">
                    <span className="w-4 text-center font-mono text-xs text-[var(--muted)]">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <b className="truncate text-sm group-hover:text-[var(--accent)]">{c.displaySymbol}</b>
                        <span className="rounded bg-[var(--border)]/60 px-1 text-[9px] font-semibold text-[var(--muted)]">
                          {MARKET_LABEL[c.category] ?? c.category}
                        </span>
                      </span>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[var(--border)]">
                        <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${c.score}%` }} />
                      </span>
                    </span>
                    <span className="w-8 text-right font-mono text-sm font-bold tabular-nums">{c.score}</span>
                    <span
                      className={cn(
                        'w-14 text-right font-mono text-[11px] tabular-nums',
                        c.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {c.changePercent >= 0 ? '+' : ''}
                      {c.changePercent.toFixed(2)}%
                    </span>
                  </Link>
                </li>
              );
            })}
      </ol>
      <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
        Skor; fiyat hareketi, değerleme ve hacimden otomatik hesaplanır. Yatırım tavsiyesi değildir.
      </p>
    </section>
  );
}
