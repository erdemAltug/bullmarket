'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Crosshair, Search } from 'lucide-react';
import {
  LockedValue,
  ProtectedFeature,
} from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import type { LiveAnalystTarget } from '@/lib/live-targets';
import { cn } from '@/lib/utils';

type CategoryFilter = 'ALL' | 'BIST' | 'US';
type SortBy = 'POTENTIAL' | 'SCORE';

type TargetsPayload = {
  success: boolean;
  error?: string;
  data?: { items: LiveAnalystTarget[]; updatedAt?: string };
};

async function fetcher(url: string) {
  const res = await fetch(url);
  const json = (await res.json()) as TargetsPayload;
  if (!json.success) throw new Error(json.error || 'Hedefler yüklenemedi');
  return json.data!;
}

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'ALL', label: 'Tüm Varlıklar' },
  { id: 'BIST', label: 'BİST Hisseleri' },
  { id: 'US', label: 'ABD Hisseleri' },
];

const PAGE_SIZE = 8;

function money(n: number, currency: 'TRY' | 'USD') {
  const prefix = currency === 'USD' ? '$' : '₺';
  return `${prefix}${n.toLocaleString('tr-TR', {
    maximumFractionDigits: n >= 100 ? 2 : 4,
  })}`;
}

export default function TargetsPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const { data, error, isLoading } = useSWR('/api/targets', fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: true,
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('POTENTIAL');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredData = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchesSearch =
          !q ||
          item.displaySymbol.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q);
        const matchesCat = category === 'ALL' || item.category === category;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'POTENTIAL') {
          return (b.upsidePotential ?? -999) - (a.upsidePotential ?? -999);
        }
        return b.fundamentalScore - a.fundamentalScore;
      });
  }, [data?.items, search, category, sortBy]);

  const displayedItems = filteredData.slice(0, visibleCount);
  const remaining = filteredData.length - visibleCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Crosshair className="size-6 text-amber-400" />
          Analist Hedef Fiyatları
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Yahoo Finance canlı konsensüs · targetMean / High / Low
          {data?.updatedAt
            ? ` · güncelleme ${new Date(data.updatedAt).toLocaleTimeString('tr-TR')}`
            : ''}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCategory(tab.id);
                setVisibleCount(PAGE_SIZE);
              }}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                category === tab.id
                  ? 'bg-emerald-500 text-black'
                  : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs outline-none"
          >
            <option value="POTENTIAL">En Yüksek Potansiyel (%)</option>
            <option value="SCORE">En Yüksek Temel Skor</option>
          </select>
          <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Hisse ara (THYAO, NVDA…)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">
          Canlı hedefler alınamadı: {error.message}
        </p>
      ) : !filteredData.length ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]">
          Bu filtrede canlı analist hedefi yok.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayedItems.map((item) => {
            const href =
              item.category === 'BIST'
                ? `/bist/${item.displaySymbol}`
                : item.category === 'US'
                  ? `/us/${item.displaySymbol}`
                  : null;
            const upside = item.upsidePotential;
            return (
              <article
                key={item.symbol}
                className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {href ? (
                      <Link
                        href={href}
                        className="text-lg font-bold hover:text-emerald-400 hover:underline"
                      >
                        {item.displaySymbol}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-bold">{item.displaySymbol}</h3>
                    )}
                    <p className="text-xs text-[var(--muted)]">{item.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                      <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] uppercase">
                        {item.category}
                      </span>
                      <span>
                        Skor{' '}
                        <strong className="text-emerald-400">
                          {item.fundamentalScore}/10
                        </strong>
                      </span>
                      <span>{item.consensusRating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'font-mono text-lg font-extrabold',
                        (upside ?? 0) >= 15
                          ? 'text-emerald-400'
                          : (upside ?? 0) >= 0
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      )}
                    >
                      {upside == null
                        ? '—'
                        : `${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%`}
                    </div>
                    <div className="text-[10px] uppercase text-[var(--muted)]">
                      Potansiyel
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--muted)]">
                      Fiyat {money(item.price, item.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-[var(--surface)]/50 p-2">
                    <p className="text-[10px] text-[var(--muted)]">Düşük</p>
                    <p className="font-mono font-semibold">
                      {item.targetLow != null
                        ? money(item.targetLow, item.currency)
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <p className="text-[10px] text-emerald-400">Ortalama</p>
                    <p className="font-mono font-bold text-emerald-300">
                      {item.targetMean != null
                        ? money(item.targetMean, item.currency)
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--surface)]/50 p-2">
                    <p className="text-[10px] text-[var(--muted)]">Yüksek</p>
                    <p className="font-mono font-semibold">
                      {item.targetHigh != null
                        ? money(item.targetHigh, item.currency)
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Analist dağılımı ({item.analystCount} oy)
                  </p>
                  {unlocked ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span>Güçlü Al {item.ratings.strongBuy}</span>
                      <span>Al {item.ratings.buy}</span>
                      <span>Tut {item.ratings.hold}</span>
                      <span>Sat {item.ratings.sell + item.ratings.strongSell}</span>
                    </div>
                  ) : (
                    <ProtectedFeature featureTitle="Analist Oy Dağılımı">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span>Güçlü Al {item.ratings.strongBuy}</span>
                        <span>Al {item.ratings.buy}</span>
                        <span>Tut {item.ratings.hold}</span>
                        <span>
                          Sat {item.ratings.sell + item.ratings.strongSell}
                        </span>
                      </div>
                    </ProtectedFeature>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {remaining > 0 ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((p) => p + 6)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Daha Fazla Göster ({remaining} kaldı)
          </button>
        </div>
      ) : null}

      {!unlocked ? (
        <p className="text-center text-xs text-[var(--muted)]">
          <LockedValue feature="Analist oyları">Oy dağılımı kilitli</LockedValue>
        </p>
      ) : null}
    </div>
  );
}
