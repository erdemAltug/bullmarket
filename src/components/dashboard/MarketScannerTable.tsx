'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  ChevronDown,
  Search,
  Star,
  X,
} from 'lucide-react';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWatchlist } from '@/hooks/useWatchlist';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { assetDetailHref } from '@/lib/seo/internal-links';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { BIST_SECTORS, US_SECTORS } from '@/lib/seo/sectors';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

export type ScannerFilter =
  | 'ALL'
  | 'BIST'
  | 'CRYPTO'
  | 'US'
  | 'FON'
  | 'ETF'
  | 'FUNDS'
  | 'GAINERS'
  | 'LOSERS';

const FILTERS: { id: ScannerFilter; label: string }[] = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'BIST', label: 'BİST' },
  { id: 'CRYPTO', label: 'Kripto' },
  { id: 'US', label: 'NASDAQ' },
  { id: 'FUNDS', label: "Fonlar & ETF'ler" },
  { id: 'GAINERS', label: 'Yükselenler' },
  { id: 'LOSERS', label: 'Düşenler' },
];

const PAGE_SIZES = [10, 25, 50, 100] as const;

type SortKey = 'default' | 'name' | 'price' | 'change' | 'volume' | 'pe' | 'score';
type SortDir = 'asc' | 'desc';

type QuickId = 'score70' | 'cheap' | 'up5' | 'down5' | 'watch';
const QUICK: { id: QuickId; label: string; hint: string }[] = [
  { id: 'score70', label: 'Skor 70+', hint: 'Analiz skoru 70 ve üstü' },
  { id: 'cheap', label: 'F/K < 10', hint: 'Fiyat/kazanç oranı 10’un altında' },
  { id: 'up5', label: '+%5 üstü', hint: 'Bugün yüzde 5’ten fazla yükselenler' },
  { id: 'down5', label: '−%5 altı', hint: 'Bugün yüzde 5’ten fazla düşenler' },
  { id: 'watch', label: 'İzlediklerim', hint: 'Sadece izleme listendekiler' },
];

/** Sector baskets keyed "BIST:banka-hisseleri" / "US:yari-iletken-hisseleri". */
const SECTOR_OPTIONS = [
  ...BIST_SECTORS.map((x) => ({ key: `BIST:${x.slug}`, market: 'BIST' as const, name: x.name, symbols: new Set(x.symbols) })),
  ...US_SECTORS.map((x) => ({ key: `US:${x.slug}`, market: 'US' as const, name: x.name, symbols: new Set(x.symbols) })),
];

/** Turkish-insensitive fold: "İŞ Bankası" ~ "is bankasi". */
function fold(v: string) {
  return v
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function sectorOf(item: ScannerItem) {
  const market = item.category === 'BIST' ? 'BIST' : item.category === 'US' ? 'US' : null;
  if (!market) return null;
  return SECTOR_OPTIONS.find((o) => o.market === market && o.symbols.has(item.displaySymbol)) ?? null;
}

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
        : category === 'ETF'
          ? 'from-amber-600/40 to-zinc-900 text-amber-300'
          : category === 'FON'
            ? 'from-rose-600/40 to-zinc-900 text-rose-300'
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
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [quick, setQuick] = useState<Set<QuickId>>(() => new Set());
  const [sector, setSector] = useState<string>('');

  const scores = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) m.set(it.symbol, scoreOpportunity(it));
    return m;
  }, [items]);

  const sectorChoices = useMemo(() => {
    if (filter === 'BIST') return SECTOR_OPTIONS.filter((o) => o.market === 'BIST');
    if (filter === 'US') return SECTOR_OPTIONS.filter((o) => o.market === 'US');
    if (filter === 'ALL' || filter === 'GAINERS' || filter === 'LOSERS') return SECTOR_OPTIONS;
    return [];
  }, [filter]);

  function resetPage() {
    setPage(1);
  }

  function toggleQuick(id: QuickId) {
    setQuick((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    resetPage();
  }

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
    resetPage();
  }

  const activeCount = quick.size + (sector ? 1 : 0) + (searchQuery ? 1 : 0);
  function clearAll() {
    setQuick(new Set());
    setSector('');
    setSearchQuery('');
    setSortKey('default');
    resetPage();
  }

  const filteredData = useMemo(() => {
    const q = fold(searchQuery.trim());
    const sectorOpt = sector ? SECTOR_OPTIONS.find((o) => o.key === sector) : null;
    // A search like "banka" or "yarı iletken" also matches that sector's members.
    const sectorHits = q.length >= 3
      ? SECTOR_OPTIONS.filter((o) => fold(o.name).includes(q))
      : [];

    let list = items.filter((item) => {
      if (q) {
        const hit =
          fold(item.displaySymbol).includes(q) ||
          fold(item.symbol).includes(q) ||
          fold(item.name).includes(q) ||
          sectorHits.some((o) => o.symbols.has(item.displaySymbol) && (o.market === item.category));
        if (!hit) return false;
      }
      if (filter === 'GAINERS' && !(item.changePercent > 0)) return false;
      if (filter === 'LOSERS' && !(item.changePercent < 0)) return false;
      if (filter === 'FUNDS' && item.category !== 'FON' && item.category !== 'ETF') return false;
      if (filter === 'FON' && item.category !== 'FON') return false;
      if (filter === 'ETF' && item.category !== 'ETF') return false;
      if ((filter === 'BIST' || filter === 'CRYPTO' || filter === 'US') && item.category !== filter) return false;
      if (sectorOpt && !(sectorOpt.market === item.category && sectorOpt.symbols.has(item.displaySymbol))) return false;
      if (quick.has('score70') && (scores.get(item.symbol) ?? 0) < 70) return false;
      if (quick.has('cheap') && !(item.trailingPE != null && item.trailingPE > 0 && item.trailingPE < 10)) return false;
      if (quick.has('up5') && !(item.changePercent >= 5)) return false;
      if (quick.has('down5') && !(item.changePercent <= -5)) return false;
      if (quick.has('watch') && !hasSymbol(item.symbol)) return false;
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    const val = (it: ScannerItem): number | string | null => {
      switch (sortKey) {
        case 'name': return it.displaySymbol;
        case 'price': return it.price;
        case 'change': return it.changePercent;
        case 'volume': return it.volumeRaw;
        case 'pe': return it.trailingPE != null && it.trailingPE > 0 ? it.trailingPE : null;
        case 'score': return scores.get(it.symbol) ?? null;
        default: return null;
      }
    };

    if (sortKey !== 'default') {
      list = [...list].sort((x, y) => {
        const a1 = val(x);
        const b1 = val(y);
        if (a1 == null && b1 == null) return 0;
        if (a1 == null) return 1; // missing values always last
        if (b1 == null) return -1;
        if (typeof a1 === 'string' && typeof b1 === 'string') return a1.localeCompare(b1, 'tr') * dir;
        return ((a1 as number) - (b1 as number)) * dir;
      });
    } else if (filter === 'GAINERS') {
      list = [...list].sort((x, y) => y.changePercent - x.changePercent);
    } else if (filter === 'LOSERS') {
      list = [...list].sort((x, y) => x.changePercent - y.changePercent);
    } else if (q) {
      // Exact ticker first, then ticker prefix, then the rest.
      const rank = (it: ScannerItem) => {
        const d = fold(it.displaySymbol);
        return d === q ? 0 : d.startsWith(q) ? 1 : 2;
      };
      list = [...list].sort((x, y) => rank(x) - rank(y));
    }

    return list;
  }, [items, searchQuery, filter, sector, quick, scores, sortKey, sortDir, hasSymbol]);

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
                if (f.id !== 'ALL' && f.id !== 'GAINERS' && f.id !== 'LOSERS' && !sector.startsWith(f.id === 'US' ? 'US:' : 'BIST:')) {
                  setSector('');
                }
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
            placeholder="Ara: THYAO, Garanti, banka, yarı iletken, BTC…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {sectorChoices.length ? (
          <div className="relative">
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                resetPage();
              }}
              aria-label="Sektör"
              className={cn(
                'appearance-none rounded-lg border py-1.5 pl-2.5 pr-7 text-xs outline-none',
                sector
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]'
              )}
            >
              <option value="">Tüm sektörler</option>
              {sectorChoices.some((o) => o.market === 'BIST') ? (
                <optgroup label="BİST">
                  {sectorChoices.filter((o) => o.market === 'BIST').map((o) => (
                    <option key={o.key} value={o.key}>{o.name}</option>
                  ))}
                </optgroup>
              ) : null}
              {sectorChoices.some((o) => o.market === 'US') ? (
                <optgroup label="ABD">
                  {sectorChoices.filter((o) => o.market === 'US').map((o) => (
                    <option key={o.key} value={o.key}>{o.name}</option>
                  ))}
                </optgroup>
              ) : null}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
          </div>
        ) : null}
        {QUICK.map((qf) => (
          <button
            key={qf.id}
            type="button"
            title={qf.hint}
            aria-pressed={quick.has(qf.id)}
            onClick={() => toggleQuick(qf.id)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
              quick.has(qf.id)
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            {qf.label}
          </button>
        ))}
        {activeCount || sortKey !== 'default' ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="size-3" /> Temizle
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mb-3 text-sm text-rose-400">{error}</p>
      ) : null}

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-0 text-left text-xs sm:min-w-[560px] md:min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted)]">
              <SortTh label="Sembol" k="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortTh label="Fiyat" k="price" sortKey={sortKey} sortDir={sortDir} onSort={onSort} right />
              <SortTh label="Günlük" k="change" sortKey={sortKey} sortDir={sortDir} onSort={onSort} right />
              <SortTh label="Hacim" k="volume" sortKey={sortKey} sortDir={sortDir} onSort={onSort} right className="hidden sm:table-cell" />
              <SortTh label="F/K" k="pe" sortKey={sortKey} sortDir={sortDir} onSort={onSort} right className="hidden lg:table-cell" />
              <SortTh label="Skor" k="score" sortKey={sortKey} sortDir={sortDir} onSort={onSort} right className="hidden md:table-cell" />
              <th className="px-1.5 py-3 text-right font-medium sm:px-2">İşlem</th>
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
                  <td className="px-1.5 py-2.5 sm:px-2">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <button
                        type="button"
                        title={starred ? 'İzleme listesinden çıkar' : 'İzleme listesine ekle'}
                        onClick={(e) => toggleWatch(item.symbol, e)}
                        className={cn(
                          'shrink-0 transition-colors',
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
                              className="truncate font-bold text-[var(--foreground)] hover:text-emerald-400 hover:underline"
                            >
                              {item.displaySymbol}
                            </Link>
                          ) : (
                            <span className="truncate font-bold text-[var(--foreground)] group-hover:text-emerald-400">
                              {item.displaySymbol}
                            </span>
                          )}
                          <span className="hidden shrink-0 rounded border border-[var(--border)] px-1 py-px text-[9px] font-semibold uppercase text-[var(--muted)] sm:inline">
                            {item.market}
                          </span>
                        </div>
                        <p className="hidden truncate text-[10px] text-[var(--muted)] sm:block">
                          {item.name}
                          {sectorOf(item) ? <span className="text-[var(--muted)]/70"> · {sectorOf(item)!.name}</span> : null}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-1.5 py-2.5 text-right text-sm font-semibold tabular-nums text-[var(--foreground)] sm:px-2">
                    {formatPrice(item.price, item.currency)}
                  </td>
                  <td className="px-1.5 py-2.5 text-right sm:px-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-md border px-1 py-0.5 text-[10px] font-bold sm:px-1.5 sm:text-[11px]',
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
                  <td className="hidden px-2 py-2.5 text-right font-mono tabular-nums text-[var(--muted)] lg:table-cell">
                    {item.trailingPE != null && item.trailingPE > 0 ? item.trailingPE.toFixed(1) : '—'}
                  </td>
                  <td className="hidden px-2 py-2.5 text-right md:table-cell">
                    {(() => {
                      const sc = scores.get(item.symbol) ?? 0;
                      return (
                        <span
                          className={cn(
                            'inline-flex min-w-[2.25rem] justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold',
                            sc >= 80
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : sc >= 60
                                ? 'bg-[var(--surface)] text-[var(--foreground)]'
                                : 'bg-[var(--surface)] text-[var(--muted)]'
                          )}
                        >
                          {sc}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-1.5 py-2.5 text-right sm:px-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChartItem(item);
                      }}
                      className="rounded-md bg-[var(--surface)] px-2 py-1 text-[10px] font-bold text-[var(--muted)] transition-all hover:bg-emerald-500 hover:text-black sm:px-2.5"
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
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                >
                  Sonuç bulunamadı
                </td>
              </tr>
            ) : null}
            {isLoading && paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
              {chartItem.chartSource === 'tefas' ? (
                <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
                  <p className="text-[var(--muted)]">
                    TEFAS günlük pay değeri — grafik seansı borsadaki hisse
                    çizgisi gibi değildir.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase text-[var(--muted)]">
                        Fon tipi
                      </p>
                      <p className="font-medium">
                        {chartItem.fundStyle || 'Yatırım Fonu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[var(--muted)]">
                        Portföy
                      </p>
                      <p className="font-medium">{chartItem.volume}</p>
                    </div>
                    {chartItem.investorCount != null ? (
                      <div>
                        <p className="text-[10px] uppercase text-[var(--muted)]">
                          Yatırımcı
                        </p>
                        <p className="font-medium">
                          {chartItem.investorCount.toLocaleString('tr-TR')}
                        </p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-[10px] uppercase text-[var(--muted)]">
                        Günlük
                      </p>
                      <p className="font-medium">
                        {chartItem.changePercent >= 0 ? '+' : ''}
                        {chartItem.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/fon/${chartItem.displaySymbol}`}
                    className="inline-block text-xs font-bold text-emerald-400 hover:underline"
                  >
                    Fon detay sayfası →
                  </Link>
                </div>
              ) : (
                <ChartPanel
                  title={chartItem.displaySymbol}
                  symbol={chartItem.chartSymbol}
                  source={
                    chartItem.chartSource === 'binance' ? 'binance' : 'yahoo'
                  }
                  isPositive={chartItem.changePercent >= 0}
                  currencySymbol={chartItem.currency === 'USD' ? '$' : '₺'}
                  defaultTimeframe="5D"
                />
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortTh({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  right,
  className,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  right?: boolean;
  className?: string;
}) {
  const active = sortKey === k;
  const Icon = !active ? ArrowUpDown : sortDir === 'desc' ? ArrowDown : ArrowUp;
  return (
    <th
      className={cn('px-1.5 py-3 font-medium sm:px-2', right && 'text-right', className)}
      aria-sort={active ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-[var(--foreground)]',
          active && 'text-emerald-400'
        )}
      >
        {label}
        <Icon className={cn('size-3', !active && 'opacity-40')} />
      </button>
    </th>
  );
}
