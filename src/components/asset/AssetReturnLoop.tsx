'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock3, Zap } from 'lucide-react';

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

  // Watch / alert live in the header action bar; this is just "where was I".
  if (!recent.length) return null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock3 className="size-4 text-[var(--muted)]" />
          Son baktıkların
        </h2>
        <Link
          href="/firsatlar"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <Zap className="size-3.5" />
          Skor taraması
        </Link>
      </div>
      <nav aria-label="Son incelenen varlıklar" className="mt-3 flex flex-wrap gap-2">
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
    </section>
  );
}
