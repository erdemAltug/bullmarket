'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Search,
  Star,
} from 'lucide-react';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { Sparkline } from '@/components/dashboard/Sparkline';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWatchlist } from '@/hooks/useWatchlist';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

export type ScannerFilter =
  | 'ALL'
  | 'BIST'
  | 'CRYPTO'
  | 'US'
  | 'GAINERS'
  | 'LOSERS';

const FILTERS: { id: ScannerFilter; label: string }[] = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'BIST', label: 'BİST 100' },
  { id: 'CRYPTO', label: 'Kripto' },
  { id: 'US', label: 'ABD' },
  { id: 'GAINERS', label: 'Yükselenler' },
  { id: 'LOSERS', label: 'Düşenler' },
];

const PAGE_SIZES = [10, 25, 50] as const;

function SymbolBadge({
  display,
  category,
}: {
  display: string;
  category: string;
}) {
  const letter = display.slice(0, 2);
  const tone =
    category === 'CRYPTO'
      ? 'from-violet-600/40 to-zinc-900 text-violet-300'
      : category === 'US'
        ? 'from-blue-600/40 to-zinc-900 text-blue-300'
        : 'from-emerald-600/40 to-zinc-900 text-emerald-300';
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-black',
        tone
      )}
    >
      {letter}
    </span>
  );
}

interface MarketScannerTableProps {
  items: ScannerItem[];
  isLoading?: boolean;
  error?: string | null;
  defaultFilter?: ScannerFilter;
  title?: string;
}

export function MarketScannerTable({
  items,
  isLoading,
  error,
  defaultFilter = 'ALL',
  title = 'Market Screener',
}: MarketScannerTableProps) {
  const { formatPrice } = usePreferences();
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ScannerFilter>(defaultFilter);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [page, setPage] = useState(1);
  const [chartItem, setChartItem] = useState<ScannerItem | null>(null);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = items.filter((item) => {
      const matchesSearch =
        !q ||
        item.symbol.toLowerCase().includes(q) ||
        item.displaySymbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filter === 'ALL') return true;
      if (filter === 'GAINERS') return item.changePercent > 0;
      if (filter === 'LOSERS') return item.changePercent < 0;
      return item.category === filter;
    });

    if (filter === 'GAINERS') {
      list = [...list].sort((a, b) => b.changePercent - a.changePercent);
    } else if (filter === 'LOSERS') {
      list = [...list].sort((a, b) => a.changePercent - b.changePercent);
    }

    return list;
  }, [items, searchQuery, filter]);

  const visibleCount = page * itemsPerPage;
  const paginatedData = filteredData.slice(0, visibleCount);
  const remaining = Math.max(0, filteredData.length - paginatedData.length);

  function toggleWatch(symbol: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (hasSymbol(symbol)) removeSymbol(symbol);
    else addSymbol(symbol);
  }

  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur-xl sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            {isLoading
              ? 'Piyasa taranıyor…'
              : `${filteredData.length} varlık · anlık ara & filtrele`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <span>Satır</span>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-2.5 pr-7 text-xs text-[var(--foreground)] outline-none"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                filter === f.id
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Hisse / Kripto Ara (THYAO, BTC…)"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      {error ? (
        <p className="mb-3 text-sm text-rose-400">{error}</p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted)]">
              <th className="px-2 py-3 font-medium">Sembol / İsim</th>
              <th className="px-2 py-3 text-right font-medium">Fiyat</th>
              <th className="px-2 py-3 text-right font-medium">24s</th>
              <th className="hidden px-2 py-3 text-right font-medium sm:table-cell">
                Hacim
              </th>
              <th className="px-2 py-3 text-center font-medium">7 Gün</th>
              <th className="px-2 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {paginatedData.map((item) => {
              const positive = item.changePercent >= 0;
              const starred = hasSymbol(item.symbol);
              const detailHref = assetDetailHref(item.symbol, item.category);
              return (
                <tr
                  key={item.symbol}
                  className="group cursor-pointer transition-colors hover:bg-[var(--surface)]/60"
                  onClick={() => setChartItem(item)}
                >
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        title={starred ? 'Watchlistten çıkar' : 'Watchliste ekle'}
                        onClick={(e) => toggleWatch(item.symbol, e)}
                        className={cn(
                          'transition-colors',
                          starred
                            ? 'text-amber-400'
                            : 'text-[var(--muted)] hover:text-amber-400'
                        )}
                      >
                        <Star
                          className={cn('size-3.5', starred && 'fill-amber-400')}
                        />
                      </button>
                      <SymbolBadge
                        display={item.displaySymbol}
                        category={item.category}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {detailHref ? (
                            <Link
                              href={detailHref}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-[var(--foreground)] hover:text-emerald-400 hover:underline"
                            >
                              {item.displaySymbol}
                            </Link>
                          ) : (
                            <span className="font-bold text-[var(--foreground)] group-hover:text-emerald-400">
                              {item.displaySymbol}
                            </span>
                          )}
                          <span className="rounded border border-[var(--border)] px-1 py-px text-[9px] font-semibold uppercase text-[var(--muted)]">
                            {item.market}
                          </span>
                        </div>
                        <p className="truncate text-[10px] text-[var(--muted)]">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    {formatPrice(item.price, item.currency)}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-bold',
                        positive
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                      )}
                    >
                      {positive ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {positive ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="hidden px-2 py-2.5 text-right font-mono text-[var(--muted)] sm:table-cell">
                    {item.volume}
                  </td>
                  <td className="px-2 py-2.5">
                    <Sparkline
                      data={item.sparkline}
                      positive={positive}
                      width={96}
                      height={28}
                    />
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChartItem(item);
                      }}
                      className="rounded-md bg-[var(--surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted)] transition-all hover:bg-emerald-500 hover:text-black"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                >
                  Sonuç bulunamadı
                </td>
              </tr>
            ) : null}
            {isLoading && paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                >
                  Yükleniyor…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {remaining > 0 ? (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-xs font-bold text-[var(--muted)] transition-all hover:border-emerald-500/40 hover:text-[var(--foreground)]"
          >
            Tüm Piyasayı Gör · {remaining} varlık kaldı
          </button>
        </div>
      ) : null}

      <Dialog
        open={Boolean(chartItem)}
        onOpenChange={(o) => !o && setChartItem(null)}
      >
        <DialogContent className="max-w-3xl border-[var(--border)] bg-[var(--popover-bg)] p-4">
          {chartItem ? (
            <>
              <DialogTitle className="mb-3 text-base font-semibold">
                {chartItem.displaySymbol}{' '}
                <span className="text-sm font-normal text-[var(--muted)]">
                  {chartItem.name}
                </span>
              </DialogTitle>
              <ChartPanel
                title={chartItem.displaySymbol}
                symbol={chartItem.chartSymbol}
                source={chartItem.chartSource}
                isPositive={chartItem.changePercent >= 0}
                currencySymbol={chartItem.currency === 'USD' ? '$' : '₺'}
                defaultTimeframe="5D"
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
