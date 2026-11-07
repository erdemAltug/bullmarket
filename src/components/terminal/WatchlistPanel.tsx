'use client';

import Link from 'next/link';
import { Bell, Star } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useWatchlistRows } from '@/hooks/useWatchlistRows';
import { cn } from '@/lib/utils';
import { targetFromSymbol, useChartClick } from './QuickChart';

const SUGGEST = [
  { symbol: 'THYAO.IS', label: 'THYAO' },
  { symbol: 'ASELS.IS', label: 'ASELS' },
  { symbol: 'GARAN.IS', label: 'GARAN' },
  { symbol: 'BTCUSDT', label: 'BTC' },
];

function price(v: number, cur: 'TRY' | 'USD') {
  return `${cur === 'USD' ? '$' : '₺'}${v.toLocaleString('tr-TR', { maximumFractionDigits: v >= 1 ? 2 : 4 })}`;
}

/** The user's own list, live, with alert state — the reason to come back daily. */
export function WatchlistPanel() {
  const { rows, ready, loading, addSymbol } = useWatchlistRows();
  const { alerts, activeCount } = useAlerts();
  const triggered = alerts.filter((a) => a.triggered);
  const chartClick = useChartClick();
  const sorted = [...rows].sort((a, b) => Math.abs(b.changePercent ?? 0) - Math.abs(a.changePercent ?? 0));

  return (
    <section className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold">
          <Star className="size-4 text-amber-300" /> Senin listen
        </h2>
        <Link href="/izleme" className="text-xs text-[var(--accent)] hover:underline">
          Yönet →
        </Link>
      </div>

      {triggered.length ? (
        <div className="mt-3 space-y-1.5">
          {triggered.slice(0, 3).map((a) => (
            <Link
              key={a.id}
              href="/alerts"
              className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100 hover:border-amber-500/60"
            >
              <Bell className="size-3.5 text-amber-300" />
              <b>{a.displaySymbol}</b> eşiği aştı
            </Link>
          ))}
        </div>
      ) : null}

      {!ready || (loading && !rows.length) ? (
        <ul className="mt-3 space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-9 animate-pulse rounded-lg bg-[var(--border)]/40" />
          ))}
        </ul>
      ) : rows.length ? (
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {sorted.slice(0, 8).map((r) => {
            const ch = r.changePercent ?? 0;
            return (
              <li key={r.symbol}>
                <Link
                  href={r.href}
                  onClick={chartClick(
                    targetFromSymbol(
                      /\.|USDT$|=|\^/.test(r.symbol.toUpperCase()) || !r.href.startsWith('/bist')
                        ? r.symbol
                        : `${r.symbol}.IS`,
                      {
                        title: r.displaySymbol,
                        subtitle: r.name || undefined,
                        price: r.price ?? undefined,
                        changePercent: r.changePercent ?? undefined,
                        currency: r.currency,
                        href: r.href,
                      }
                    )
                  )}
                  className="flex items-center gap-3 rounded-lg py-2 text-sm hover:text-[var(--accent)]"
                >
                  <span className="min-w-0 flex-1">
                    <b className="block truncate">{r.displaySymbol}</b>
                    {r.name ? <span className="block truncate text-[11px] text-[var(--muted)]">{r.name}</span> : null}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[var(--muted)]">
                    {r.price != null ? price(r.price, r.currency) : '—'}
                  </span>
                  <span
                    className={cn(
                      'w-16 rounded-md px-1.5 py-0.5 text-right font-mono text-xs font-semibold tabular-nums',
                      ch > 0 ? 'bg-emerald-500/10 text-emerald-300' : ch < 0 ? 'bg-rose-500/10 text-rose-300' : 'text-[var(--muted)]'
                    )}
                  >
                    {r.changePercent == null ? '—' : `${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] p-4 text-center">
          <p className="text-sm font-medium">Takip ettiğin varlıkları buraya ekle</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Fiyatları her dakika güncellenir, hareket edenler üstte durur.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {SUGGEST.map((s) => (
              <button
                key={s.symbol}
                type="button"
                onClick={() => addSymbol(s.symbol)}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
              >
                + {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px] text-[var(--muted)]">
        <span>{rows.length} varlık · {activeCount} aktif alarm</span>
        <Link href="/alerts" className="text-orange-300 hover:underline">
          Alarm kur →
        </Link>
      </div>
    </section>
  );
}
