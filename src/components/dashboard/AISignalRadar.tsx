'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, Search, Sparkles, X } from 'lucide-react';
import { generateRealTimeSignals, type SignalCardData, type SignalKind } from '@/lib/signals';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

type Market = 'ALL' | 'BIST' | 'US' | 'ETF' | 'CRYPTO';
type SortKey = 'strength' | 'up' | 'down' | 'nearLow' | 'nearHigh' | 'az';

const MARKETS: { id: Market; label: string }[] = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'BIST', label: 'BİST' },
  { id: 'US', label: 'ABD' },
  { id: 'ETF', label: 'ETF' },
  { id: 'CRYPTO', label: 'Kripto' },
];

const KINDS: Record<SignalKind, { label: string; tone: string; dot: string }> = {
  DIP: { label: 'Dip bandında', tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', dot: 'bg-emerald-400' },
  SURGE: { label: 'Güçlü yükseliş', tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', dot: 'bg-emerald-400' },
  BREAKOUT: { label: 'Zirveyi zorluyor', tone: 'border-sky-500/30 bg-sky-500/10 text-sky-300', dot: 'bg-sky-400' },
  PEAK: { label: 'Zirve bandında', tone: 'border-amber-500/30 bg-amber-500/10 text-amber-300', dot: 'bg-amber-400' },
  SLUMP: { label: 'Sert düşüş', tone: 'border-rose-500/30 bg-rose-500/10 text-rose-300', dot: 'bg-rose-400' },
};
const KIND_ORDER: SignalKind[] = ['DIP', 'SURGE', 'BREAKOUT', 'PEAK', 'SLUMP'];

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'strength', label: 'En belirgin hareket' },
  { id: 'up', label: 'En çok yükselen' },
  { id: 'down', label: 'En çok düşen' },
  { id: 'nearLow', label: 'Dibe en yakın' },
  { id: 'nearHigh', label: 'Zirveye en yakın' },
  { id: 'az', label: 'A → Z' },
];

const PAGE = 12;

function fold(v: string) {
  return v
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function fmt(n: number) {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: n >= 1000 ? 2 : n >= 1 ? 2 : 4 });
}

interface AISignalRadarProps {
  marketItems: ScannerItem[];
  isLoading?: boolean;
  /** Parent section already shows the title */
  hideHeader?: boolean;
}

/**
 * Live intraday radar: where each instrument sits inside today's range and
 * how hard it moved. Describes what is happening; it does not say buy/sell.
 */
export function AISignalRadar({ marketItems, isLoading, hideHeader = false }: AISignalRadarProps) {
  const [market, setMarket] = useState<Market>('ALL');
  const [kinds, setKinds] = useState<Set<SignalKind>>(() => new Set());
  const [sort, setSort] = useState<SortKey>('strength');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const all = useMemo(() => generateRealTimeSignals(marketItems), [marketItems]);

  const kindCounts = useMemo(() => {
    const c = new Map<SignalKind, number>();
    for (const s of all) {
      if (market !== 'ALL' && s.category !== market) continue;
      c.set(s.kind, (c.get(s.kind) ?? 0) + 1);
    }
    return c;
  }, [all, market]);

  const list = useMemo(() => {
    const q = fold(query.trim());
    const out = all.filter((s) => {
      if (market !== 'ALL' && s.category !== market) return false;
      if (kinds.size && !kinds.has(s.kind)) return false;
      if (q && !fold(s.displaySymbol).includes(q) && !fold(s.name ?? '').includes(q)) return false;
      return true;
    });
    const by: Record<SortKey, (a: SignalCardData, b: SignalCardData) => number> = {
      strength: (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent) || a.rangePos - b.rangePos,
      up: (a, b) => b.changePercent - a.changePercent,
      down: (a, b) => a.changePercent - b.changePercent,
      nearLow: (a, b) => a.rangePos - b.rangePos,
      nearHigh: (a, b) => b.rangePos - a.rangePos,
      az: (a, b) => a.displaySymbol.localeCompare(b.displaySymbol, 'tr'),
    };
    return [...out].sort(by[sort]);
  }, [all, market, kinds, query, sort]);

  const shown = list.slice(0, limit);
  const filtersOn = kinds.size > 0 || query !== '' || sort !== 'strength';

  function toggleKind(k: SignalKind) {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    setLimit(PAGE);
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        {!hideHeader ? (
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Sinyal Radarı</h2>
              <span className="animate-pulse rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                CANLI
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Bugünün aralığında nerede duruyor, ne kadar hareket etti · {list.length} kart
            </p>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            <span className="mr-2 inline-flex animate-pulse rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              CANLI
            </span>
            {list.length} kart · bugünün aralığına göre
          </p>
        )}

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMarket(m.id);
                setLimit(PAGE);
              }}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                market === m.id
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Sembol veya şirket ara…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs outline-none placeholder:text-[var(--muted)] focus:border-emerald-500/50"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {KIND_ORDER.map((k) => {
            const n = kindCounts.get(k) ?? 0;
            const on = kinds.has(k);
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                disabled={!n && !on}
                onClick={() => toggleKind(k)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40',
                  on ? KINDS[k].tone : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                <span className={cn('size-1.5 rounded-full', KINDS[k].dot)} />
                {KINDS[k].label}
                <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
          {filtersOn ? (
            <button
              type="button"
              onClick={() => {
                setKinds(new Set());
                setQuery('');
                setSort('strength');
                setLimit(PAGE);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X className="size-3" /> Temizle
            </button>
          ) : null}
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sıralama"
            className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-2.5 pr-7 text-xs outline-none md:w-auto"
          >
            {SORTS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
        </div>
      </div>

      {isLoading && !marketItems.length ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-emerald-400">
          Piyasa taranıyor…
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((sig) => {
          const currency = sig.category === 'CRYPTO' || sig.category === 'US' || sig.category === 'ETF' ? '$' : '₺';
          const href = assetDetailHref(sig.symbol, sig.category);
          const up = sig.changePercent >= 0;
          const k = KINDS[sig.kind];
          return (
            <article
              key={sig.id}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-emerald-500/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {href ? (
                      <Link href={href} className="text-base font-bold hover:text-emerald-400">
                        {sig.displaySymbol}
                      </Link>
                    ) : (
                      <span className="text-base font-bold">{sig.displaySymbol}</span>
                    )}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">{sig.category}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)]">{sig.strategyName}</p>
                </div>
                <span className={cn('shrink-0 rounded-lg border px-2 py-1 text-[11px] font-semibold', k.tone)}>{k.label}</span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono text-lg font-bold tabular-nums">
                  {currency}
                  {fmt(sig.entryPrice)}
                </span>
                <span className={cn('font-mono text-sm font-semibold', up ? 'text-emerald-400' : 'text-rose-400')}>
                  {up ? '+' : ''}
                  {sig.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Today's range: where the price sits between low and high */}
              <div className="mt-3">
                <div className="relative h-1.5 rounded-full bg-gradient-to-r from-rose-500/40 via-[var(--border)] to-emerald-500/40">
                  <span
                    className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--card)] bg-[var(--foreground)] shadow"
                    style={{ left: `${Math.round(sig.rangePos * 100)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--muted)]">
                  <span>
                    Gün düşük {currency}
                    {fmt(sig.dayLow)}
                  </span>
                  <span>
                    Gün yüksek {currency}
                    {fmt(sig.dayHigh)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-[11px]">
                {href ? (
                  <Link href={href} className="font-medium text-emerald-400 hover:underline">
                    Analizi aç →
                  </Link>
                ) : (
                  <span />
                )}
                <Link
                  href={`/alerts?symbol=${encodeURIComponent(sig.symbol)}`}
                  className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <Bell className="size-3" /> Alarm kur
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {list.length > shown.length ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE * 2)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-xs font-bold text-[var(--muted)] transition-all hover:border-emerald-500/40 hover:text-[var(--foreground)]"
          >
            Daha fazla göster · {list.length - shown.length} kart kaldı
          </button>
        </div>
      ) : null}

      {!isLoading && list.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted)]">Bu filtrelerle kart yok. Filtreleri temizlemeyi dene.</p>
      ) : null}

      <p className="text-[11px] text-[var(--muted)]">
        Kartlar bugünkü fiyat aralığını ve hareketi özetler; al-sat önerisi değildir.
      </p>
    </div>
  );
}
