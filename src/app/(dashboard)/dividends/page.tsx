'use client';

import { useMemo, useState } from 'react';
import { Coins, Search, Trophy } from 'lucide-react';
import { LockedValue } from '@/components/auth/ProtectedFeature';
import { TermHint } from '@/components/shared/TermHint';
import { authClient } from '@/lib/auth/client';
import { usePortfolio } from '@/hooks/usePortfolio';
import {
  DIVIDEND_DATASET,
  topYieldDividend,
  type DividendItem,
} from '@/data/dividends';
import { cn, formatPrice } from '@/lib/utils';

type Filter = 'ALL' | 'HIGH_YIELD' | 'THIS_MONTH' | 'BIST30';
type SortBy = 'YIELD' | 'DATE' | 'NET';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Tüm Hisseler' },
  { id: 'HIGH_YIELD', label: 'Yüksek Verim (%5+)' },
  { id: 'THIS_MONTH', label: 'Yaklaşanlar' },
  { id: 'BIST30', label: 'BİST 30' },
];

function formatDate(iso: string) {
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

function isThisOrNextMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const monthDiff =
    (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
  return monthDiff >= 0 && monthDiff <= 1;
}

export default function DividendsPage() {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const { positions } = usePortfolio();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('YIELD');

  const champion = useMemo(() => topYieldDividend(), []);

  const estimated = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      if (p.assetClass !== 'bist') continue;
      const sym = p.symbol.replace('.IS', '').toUpperCase();
      const ev = DIVIDEND_DATASET.find((e) => e.symbol === sym);
      if (ev) total += ev.netPerShare * p.quantity;
    }
    return total;
  }, [positions]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = DIVIDEND_DATASET.filter((item) => {
      const matchesSearch =
        !q ||
        item.symbol.toLowerCase().includes(q) ||
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
      return new Date(a.exDate).getTime() - new Date(b.exDate).getTime();
    });
    return list;
  }, [search, filter, sortBy]);

  const avgYield = useMemo(() => {
    if (!filteredData.length) return 0;
    return (
      filteredData.reduce((s, i) => s + i.dividendYield, 0) / filteredData.length
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
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
          <Coins className="size-6 text-rose-400" />
          Temettü & Bilanço Karnesi
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Yaklaşan nakit ödemeler, tahmini hisse başı temettüler ve BİST temettü
          verimi sıralaması · {DIVIDEND_DATASET.length} hisse
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl">
          <div className="text-xs text-[var(--muted)]">
            Tahmini Temettü Geliri (Portföy)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-[var(--foreground)]">
            {formatPrice(estimated, 'TRY')}
          </div>
          <div className="mt-2 inline-block rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            {positions.length
              ? `${portfolioSymbols.size} eşleşen pozisyon`
              : 'Portföyünüze hisse ekleyerek nakit akışını hesaplayın'}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Trophy className="size-3.5" />
              En Yüksek Temettü Verimi
            </span>
            <span className="font-mono text-[10px] text-[var(--muted)]">
              2026 Sezonu
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {champion.symbol}
              </span>
              <span className="ml-2 text-xs text-[var(--muted)]">
                ({champion.name})
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-bold text-emerald-400">
                %{champion.dividendYield.toFixed(1)} Verim
              </span>
              <div className="text-[11px] text-[var(--muted)]">
                Hisse Başı ₺{champion.netPerShare.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[var(--muted)]">
            <span className="rounded border border-[var(--border)] px-2 py-0.5">
              Liste ort. verim %{avgYield.toFixed(1)}
            </span>
            <span className="rounded border border-[var(--border)] px-2 py-0.5">
              <TermHint term="yield" label="Temettü Verimi" /> = yıllık temettü /
              fiyat
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-3 sm:flex-row sm:items-center">
        <div className="flex w-full items-center gap-1.5 overflow-x-auto sm:w-auto">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                filter === tab.id
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] outline-none"
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
              placeholder="Hisse Ara (TUPRS, EREGL)..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]/50 text-[var(--muted)]">
              <th className="px-4 py-3.5 font-medium">Hisse</th>
              <th className="px-4 py-3.5 font-medium">Ex-Date</th>
              <th className="px-4 py-3.5 font-medium">Ödeme</th>
              <th className="px-4 py-3.5 text-right font-medium">
                Tahmini Net TL / Hisse
              </th>
              <th className="px-4 py-3.5 text-right font-medium">
                Temettü Verimi
              </th>
              <th className="px-4 py-3.5 text-center font-medium">Surprise</th>
              <th className="px-4 py-3.5 text-center font-medium">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {filteredData.map((item: DividendItem) => {
              const inPortfolio = portfolioSymbols.has(item.symbol);
              return (
                <tr
                  key={item.symbol}
                  className="transition-colors hover:bg-[var(--surface)]/50"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-[var(--foreground)]">
                      {item.symbol}
                      {inPortfolio ? (
                        <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Portföyde
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {item.name} · {item.category}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--foreground)]/90">
                    {formatDate(item.exDate)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--muted)]">
                    {formatDate(item.paymentDate)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold">
                    {unlocked ? (
                      `₺${item.netPerShare.toFixed(2)}`
                    ) : (
                      <LockedValue feature="Tahmini Hisse Başı Temettü">
                        ₺{item.netPerShare.toFixed(2)}
                      </LockedValue>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                    %{item.dividendYield.toFixed(1)}
                  </td>
                  <td className="px-4 py-3.5 text-center tabular-nums text-[var(--muted)]">
                    {item.earningsSurpriseScore != null
                      ? item.earningsSurpriseScore
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={cn(
                        'inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold',
                        item.status === 'APPROVED'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                      )}
                    >
                      {item.status === 'APPROVED' ? 'ONAYLANDI' : 'TAHMİNİ'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!filteredData.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                >
                  Sonuç bulunamadı
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
