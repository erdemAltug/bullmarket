'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Coins, Search, Trophy } from 'lucide-react';
import { LockedValue } from '@/components/auth/ProtectedFeature';
import { TermHint } from '@/components/shared/TermHint';
import { authClient } from '@/lib/auth/client';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { LiveDividendItem } from '@/lib/live-dividends';
import { cn, formatPrice } from '@/lib/utils';

type Filter = 'ALL' | 'HIGH_YIELD' | 'THIS_MONTH' | 'BIST30';
type SortBy = 'YIELD' | 'DATE' | 'NET';

type DividendsPayload = {
  success: boolean;
  error?: string;
  data?: { items: LiveDividendItem[]; updatedAt?: string };
};

async function fetcher(url: string) {
  const res = await fetch(url);
  const json = (await res.json()) as DividendsPayload;
  if (!json.success) throw new Error(json.error || 'Temettü verisi alınamadı');
  return json.data!;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Tüm Hisseler' },
  { id: 'HIGH_YIELD', label: 'Yüksek Verim (%5+)' },
  { id: 'THIS_MONTH', label: 'Yaklaşanlar' },
  { id: 'BIST30', label: 'BİST 30' },
];

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function isThisOrNextMonth(iso: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  const monthDiff =
    (d.getFullYear() - now.getFullYear()) * 12 +
    (d.getMonth() - now.getMonth());
  return monthDiff >= 0 && monthDiff <= 1;
}

export default function DividendsPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const { positions } = usePortfolio();
  const { data, error, isLoading } = useSWR('/api/dividends', fetcher, {
    refreshInterval: 600_000,
    revalidateOnFocus: true,
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('YIELD');

  const items = data?.items ?? [];

  const champion = useMemo(() => {
    if (!items.length) return null;
    return [...items].sort((a, b) => b.dividendYield - a.dividendYield)[0];
  }, [items]);

  const estimated = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      if (p.assetClass !== 'bist') continue;
      const sym = p.symbol.replace('.IS', '').toUpperCase();
      const ev = items.find((e) => e.displaySymbol === sym);
      if (ev) total += ev.netPerShare * p.quantity;
    }
    return total;
  }, [positions, items]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items.filter((item) => {
      const matchesSearch =
        !q ||
        item.displaySymbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filter === 'HIGH_YIELD') return item.dividendYield >= 5;
      if (filter === 'THIS_MONTH') return isThisOrNextMonth(item.exDate);
      if (filter === 'BIST30') return item.category === 'BIST30';
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'YIELD') return b.dividendYield - a.dividendYield;
      if (sortBy === 'NET') return b.netPerShare - a.netPerShare;
      const da = a.exDate ? new Date(a.exDate).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.exDate ? new Date(b.exDate).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    });
    return list;
  }, [items, search, filter, sortBy]);

  const avgYield = useMemo(() => {
    if (!filteredData.length) return 0;
    return (
      filteredData.reduce((s, i) => s + i.dividendYield, 0) /
      filteredData.length
    );
  }, [filteredData]);

  const portfolioSymbols = useMemo(
    () =>
      new Set(
        positions
          .filter((p) => p.assetClass === 'bist')
          .map((p) => p.symbol.replace('.IS', '').toUpperCase())
      ),
    [positions]
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Coins className="size-6 text-rose-400" />
          Temettü & Bilanço Karnesi
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Yahoo Finance canlı temettü verimi & ex-date
          {data?.updatedAt
            ? ` · ${new Date(data.updatedAt).toLocaleTimeString('tr-TR')}`
            : ''}
          {items.length ? ` · ${items.length} hisse` : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">
          Canlı temettü verisi alınamadı: {error.message}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="text-xs text-[var(--muted)]">
                Tahmini Temettü Geliri (Portföy)
              </div>
              <div className="mt-1 font-mono text-2xl font-bold">
                {formatPrice(estimated, 'TRY')}
              </div>
              <div className="mt-2 text-[11px] text-emerald-400">
                {positions.length
                  ? `${portfolioSymbols.size} eşleşen pozisyon`
                  : 'Portföyünüze hisse ekleyin'}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:col-span-2">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Trophy className="size-3.5" />
                En Yüksek Temettü Verimi (Canlı)
              </div>
              {champion ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/bist/${champion.displaySymbol}`}
                      className="text-xl font-bold hover:text-emerald-400 hover:underline"
                    >
                      {champion.displaySymbol}
                    </Link>
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      ({champion.name})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      %{champion.dividendYield.toFixed(2)} Verim
                    </span>
                    <div className="text-[11px] text-[var(--muted)]">
                      Yıllık ~₺{champion.netPerShare.toFixed(2)} / hisse
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Temettü veren hisse bulunamadı.
                </p>
              )}
              <div className="mt-3 text-[10px] text-[var(--muted)]">
                Liste ort. verim %{avgYield.toFixed(2)} ·{' '}
                <TermHint term="yield" label="Temettü Verimi" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1.5 overflow-x-auto">
              {FILTERS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold',
                    filter === tab.id
                      ? 'bg-emerald-500 text-black'
                      : 'border border-[var(--border)] text-[var(--muted)]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none"
              >
                <option value="YIELD">Sıra: En Yüksek Verim</option>
                <option value="DATE">Sıra: Ex-Date</option>
                <option value="NET">Sıra: Hisse Başı TL</option>
              </select>
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Hisse ara…"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]/50 text-[var(--muted)]">
                  <th className="px-4 py-3.5 font-medium">Hisse</th>
                  <th className="px-4 py-3.5 font-medium">Ex-Date</th>
                  <th className="px-4 py-3.5 text-right font-medium">
                    Yıllık Temettü / Hisse
                  </th>
                  <th className="px-4 py-3.5 text-right font-medium">Verim</th>
                  <th className="px-4 py-3.5 text-right font-medium">Fiyat</th>
                  <th className="px-4 py-3.5 text-center font-medium">Kaynak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filteredData.map((item) => {
                  const inPortfolio = portfolioSymbols.has(item.displaySymbol);
                  return (
                    <tr
                      key={item.symbol}
                      className="hover:bg-[var(--surface)]/50"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/bist/${item.displaySymbol}`}
                          className="font-bold hover:text-emerald-400 hover:underline"
                        >
                          {item.displaySymbol}
                        </Link>
                        {inPortfolio ? (
                          <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400">
                            Portföyde
                          </span>
                        ) : null}
                        <div className="text-[10px] text-[var(--muted)]">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {formatDate(item.exDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold">
                        {unlocked ? (
                          `₺${item.netPerShare.toFixed(2)}`
                        ) : (
                          <LockedValue feature="Temettü / Hisse">
                            ₺{item.netPerShare.toFixed(2)}
                          </LockedValue>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                        %{item.dividendYield.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-[var(--muted)]">
                        ₺{item.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          YAHOO LIVE
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!filteredData.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                    >
                      Sonuç bulunamadı
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
