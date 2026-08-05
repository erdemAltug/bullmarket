'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Clock3, Star, Zap } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { cn } from '@/lib/utils';

type RecentAsset = {
  symbol: string;
  name: string;
  href: string;
  viewedAt: number;
};

const STORAGE_KEY = 'bullsye:recent-assets';
const MAX_RECENT = 8;

function readRecent(): RecentAsset[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as RecentAsset[]) : [];
  } catch {
    return [];
  }
}

export function AssetReturnLoop({
  symbol,
  name,
  href,
}: {
  symbol: string;
  name: string;
  href: string;
}) {
  const [recent, setRecent] = useState<RecentAsset[]>([]);
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlist();
  const watchKey = symbol.toUpperCase();
  const starred = hasSymbol(watchKey) || hasSymbol(symbol);

  useEffect(() => {
    const next = [
      { symbol, name, href, viewedAt: Date.now() },
      ...readRecent().filter((item) => item.href !== href),
    ].slice(0, MAX_RECENT);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
    setRecent(next.filter((item) => item.href !== href).slice(0, 5));
  }, [href, name, symbol]);

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Clock3 className="size-4 text-emerald-400" />
            Takibe devam et
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Alarm, izleme listesi ve fırsat masası ile geri dönün.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              starred ? removeSymbol(watchKey) : addSymbol(watchKey)
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold',
              starred
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-emerald-500/40'
            )}
          >
            <Star className={cn('size-3.5', starred && 'fill-amber-300')} />
            {starred ? 'Listede' : 'İzle'}
          </button>
          <Link
            href={`/alerts?symbol=${encodeURIComponent(symbol)}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-black hover:bg-emerald-400"
          >
            <Bell className="size-3.5" />
            Alarm kur
          </Link>
          <Link
            href="/firsatlar"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:border-emerald-500/40 hover:text-emerald-400"
          >
            <Zap className="size-3.5" />
            Fırsatlar
          </Link>
        </div>
      </div>

      {recent.length ? (
        <nav
          aria-label="Son incelenen varlıklar"
          className="mt-4 flex flex-wrap gap-2"
        >
          {recent.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-1.5 text-xs text-[var(--muted)] hover:border-emerald-500/40 hover:text-emerald-400"
            >
              {item.symbol}
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  );
}
