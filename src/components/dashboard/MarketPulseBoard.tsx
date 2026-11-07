'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ScannerItem } from '@/types/scanner';
import { assetDetailHref } from '@/lib/seo/internal-links';
import { cn } from '@/lib/utils';
import { targetFromScanner, useChartClick } from '@/components/terminal/QuickChart';

const COLS: { id: 'BIST' | 'US' | 'CRYPTO'; label: string; href: string; usd: boolean }[] = [
  { id: 'BIST', label: 'Borsa İstanbul', href: '/bist', usd: false },
  { id: 'US', label: 'ABD borsaları', href: '/nasdaq', usd: true },
  { id: 'CRYPTO', label: 'Kripto', href: '/kripto', usd: true },
];

function fmt(v: number, usd: boolean) {
  return `${usd ? '$' : '₺'}${v.toLocaleString('tr-TR', { maximumFractionDigits: v >= 1 ? 2 : 4 })}`;
}

/** Three markets side by side: breadth, average move and the most traded names. */
export function MarketPulseBoard({ items, loading }: { items: ScannerItem[]; loading?: boolean }) {
  const chartClick = useChartClick();
  const cols = useMemo(
    () =>
      COLS.map((c) => {
        const list = items.filter(
          (i) =>
            i.category === c.id && i.price > 0 && !i.displaySymbol.startsWith('XU') && Math.abs(i.changePercent) < 40
        );
        const up = list.filter((i) => i.changePercent > 0).length;
        const down = list.filter((i) => i.changePercent < 0).length;
        const avg = list.length ? list.reduce((s, i) => s + i.changePercent, 0) / list.length : 0;
        const top = [...list].sort((a, b) => b.volumeRaw - a.volumeRaw).slice(0, 6);
        return { ...c, total: list.length, up, down, avg, top };
      }),
    [items]
  );

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Üç piyasa tek bakışta</h2>
        <span className="text-[11px] text-[var(--muted)]">En çok işlem görenler</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((c) => {
          const upPct = c.up + c.down ? (c.up / (c.up + c.down)) * 100 : 50;
          return (
            <div key={c.id} className="rounded-xl border border-[var(--border)] p-3">
              <div className="flex items-center justify-between">
                <Link href={c.href} className="text-sm font-semibold hover:text-[var(--accent)]">
                  {c.label} →
                </Link>
                <span
                  className={cn('font-mono text-sm font-bold tabular-nums', c.avg >= 0 ? 'text-emerald-400' : 'text-rose-400')}
                >
                  {c.avg >= 0 ? '+' : ''}
                  {c.avg.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-rose-500/60">
                <div className="h-full bg-emerald-500" style={{ width: `${upPct}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {c.up} yükselen · {c.down} düşen · {c.total} varlık
              </p>
              <ul className="mt-3 space-y-1">
                {loading && !c.top.length
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="h-7 animate-pulse rounded bg-[var(--border)]/40" />
                    ))
                  : c.top.map((i) => {
                      const href = assetDetailHref(i.displaySymbol, i.category);
                      const row = (
                        <>
                          <span className="min-w-0 truncate font-medium">{i.displaySymbol}</span>
                          <span className="ml-auto font-mono tabular-nums text-[var(--muted)]">{fmt(i.price, c.usd)}</span>
                          <span
                            className={cn(
                              'w-16 text-right font-mono tabular-nums',
                              i.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            )}
                          >
                            {i.changePercent >= 0 ? '+' : ''}
                            {i.changePercent.toFixed(2)}%
                          </span>
                        </>
                      );
                      return (
                        <li key={i.symbol}>
                          {href ? (
                            <Link
                              href={href}
                              onClick={chartClick(targetFromScanner(i, href))}
                              className="flex items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-[var(--surface)]"
                            >
                              {row}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 px-1.5 py-1 text-xs">{row}</div>
                          )}
                        </li>
                      );
                    })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
