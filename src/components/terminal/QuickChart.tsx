'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Link from 'next/link';
import { ArrowUpRight, Bell, Star, X } from 'lucide-react';
import { AlertModal } from '@/components/alerts/AlertModal';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { useBist } from '@/hooks/useMarketData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

export type QuickChartTarget = {
  /** Heading, e.g. "THYAO" or "S&P 500". */
  title: string;
  subtitle?: string;
  /** Small market tag, e.g. "BİST", "ABD", "Kripto", "Endeks". */
  market?: string;
  /** Symbol the chart API understands (Yahoo or Binance). */
  chartSymbol: string;
  source?: 'yahoo' | 'binance' | 'tefas';
  price?: number;
  changePercent?: number;
  currency?: 'TRY' | 'USD';
  dayHigh?: number | null;
  dayLow?: number | null;
  volume?: string | null;
  pe?: number | null;
  score?: number | null;
  /** Detail page, when there is one. */
  href?: string | null;
  /** Watchlist key (e.g. THYAO.IS, BTCUSDT); omit for things you can't follow. */
  watchSymbol?: string;
  /** Alarm target; omit when alerts aren't supported for this asset. */
  alertSymbol?: string;
};

const Ctx = createContext<((t: QuickChartTarget) => void) | null>(null);

/** Open the chart view for anything on the page. Null outside the provider. */
export function useQuickChart() {
  return useContext(Ctx);
}

/**
 * Click handler for a link that should open the chart view instead of
 * navigating. Ctrl/Cmd-click and pages without the provider still navigate.
 */
export function useChartClick() {
  const open = useContext(Ctx);
  return useCallback(
    (target: QuickChartTarget) => (e: React.MouseEvent) => {
      if (!open || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(target);
    },
    [open]
  );
}

const MARKET: Record<string, string> = { BIST: 'BİST', US: 'ABD', CRYPTO: 'Kripto', FON: 'Fon', ETF: 'ETF' };

/** Chart target from a watchlist key like THYAO.IS, BTCUSDT, AAPL. */
export function targetFromSymbol(symbol: string, extra: Partial<QuickChartTarget> = {}): QuickChartTarget {
  const s = symbol.toUpperCase();
  const crypto = s.endsWith('USDT');
  const bist = s.endsWith('.IS');
  return {
    title: s.replace(/\.IS$/, '').replace(/USDT$/, ''),
    market: crypto ? 'Kripto' : bist ? 'BİST' : undefined,
    chartSymbol: s,
    source: crypto ? 'binance' : 'yahoo',
    currency: crypto ? 'USD' : bist ? 'TRY' : 'USD',
    watchSymbol: s,
    alertSymbol: s,
    ...extra,
  };
}

/** Chart target for a scanner row (BIST / US / crypto / fund). */
export function targetFromScanner(i: ScannerItem, href?: string | null): QuickChartTarget {
  const index = i.displaySymbol.startsWith('XU');
  return {
    title: i.displaySymbol,
    subtitle: i.name,
    market: index ? 'Endeks' : MARKET[i.category],
    chartSymbol: i.chartSymbol,
    source: i.chartSource,
    price: i.price,
    changePercent: i.changePercent,
    currency: i.currency,
    dayHigh: i.dayHigh,
    dayLow: i.dayLow,
    volume: i.volume || null,
    pe: i.trailingPE,
    score: index ? null : scoreOpportunity(i),
    href,
    watchSymbol: i.symbol,
    alertSymbol: i.symbol,
  };
}

function money(v: number, cur?: 'TRY' | 'USD') {
  const p = cur === 'USD' ? '$' : cur === 'TRY' ? '₺' : '';
  return `${p}${v.toLocaleString('tr-TR', { maximumFractionDigits: v >= 1000 ? 2 : v >= 1 ? 2 : 4 })}`;
}

function compact(n: number) {
  return n.toLocaleString('tr-TR', { notation: 'compact', maximumFractionDigits: 1 });
}

function RangeRow({ label, low, high, value, cur }: { label: string; low: number; high: number; value: number; cur?: 'TRY' | 'USD' }) {
  const pos = high > low ? Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100)) : 50;
  return (
    <div className="py-3">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <div className="relative mt-2 h-1.5 rounded-full bg-gradient-to-r from-rose-500/40 via-[var(--border)] to-emerald-500/40">
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--popover-bg)] bg-white"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums">
        <span>{money(low, cur)}</span>
        <span>{money(high, cur)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="text-[12px] text-[var(--muted)]">{label}</span>
      <span className={cn('font-mono text-sm font-semibold tabular-nums', tone)}>{value}</span>
    </div>
  );
}

function ChartView({ t, onClose }: { t: QuickChartTarget; onClose: () => void }) {
  const [alertOpen, setAlertOpen] = useState(false);
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlist();
  const yahoo = (t.source ?? 'yahoo') === 'yahoo';
  const quote = useBist(yahoo ? t.chartSymbol : undefined, { enabled: yahoo });
  const q = yahoo ? quote.data?.quotes?.[0] : undefined;

  const price = t.price ?? q?.price;
  const change = t.changePercent ?? q?.changePercent;
  const dayHigh = t.dayHigh ?? q?.dayHigh ?? null;
  const dayLow = t.dayLow ?? q?.dayLow ?? null;
  const wkHigh = q?.fiftyTwoWeekHigh ?? null;
  const wkLow = q?.fiftyTwoWeekLow ?? null;
  const prev = q?.previousClose ?? (price != null && change != null ? price / (1 + change / 100) : null);
  const up = (change ?? 0) >= 0;
  const watched = t.watchSymbol ? hasSymbol(t.watchSymbol) : false;
  const state = q?.marketState;

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] px-5 pb-4 pt-5 sm:px-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {t.market ? (
              <span className="rounded-md bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                {t.market}
              </span>
            ) : null}
            {state ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <span className={cn('size-1.5 rounded-full', state === 'REGULAR' ? 'bg-emerald-400' : 'bg-[var(--muted)]')} />
                {state === 'REGULAR' ? 'İşlemde' : 'Kapalı'}
              </span>
            ) : null}
          </div>
          <DialogPrimitive.Title className="mt-1 truncate text-2xl font-semibold tracking-tight">{t.title}</DialogPrimitive.Title>
          {t.subtitle ? <p className="truncate text-sm text-[var(--muted)]">{t.subtitle}</p> : null}
        </div>
        <div className="flex items-end gap-4">
          {price != null ? (
            <div className="text-right">
              <p className="font-mono text-3xl font-bold tabular-nums">{money(price, t.currency)}</p>
              {change != null ? (
                <p className={cn('font-mono text-sm font-semibold', up ? 'text-emerald-400' : 'text-rose-400')}>
                  {up ? '▲' : '▼'} {up ? '+' : ''}
                  {change.toFixed(2)}% bugün
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 px-3 pb-3 pt-2 sm:px-5">
          <ChartPanel
            key={t.chartSymbol}
            title={t.title}
            symbol={t.chartSymbol}
            source={t.source ?? 'yahoo'}
            isPositive={up}
            height={typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 440}
            defaultTimeframe="1M"
            currencySymbol={t.currency === 'USD' ? '$' : t.currency === 'TRY' ? '₺' : ''}
            bare
          />
        </div>

        <aside className="flex flex-col border-t border-[var(--border)] px-5 py-4 lg:border-l lg:border-t-0">
          <div className="grid gap-2">
            {t.href ? (
              <Link
                href={t.href}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[#042f2e] hover:brightness-110"
              >
                Detaylı analiz <ArrowUpRight className="size-4" />
              </Link>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              {t.watchSymbol ? (
                <button
                  type="button"
                  onClick={() => (watched ? removeSymbol(t.watchSymbol!) : addSymbol(t.watchSymbol!))}
                  className={cn(
                    'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium',
                    watched ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-[var(--border)] hover:border-amber-400/50'
                  )}
                >
                  <Star className={cn('size-4', watched && 'fill-amber-300 text-amber-300')} />
                  {watched ? 'Listende' : 'Takip et'}
                </button>
              ) : null}
              {t.alertSymbol && price != null ? (
                <button
                  type="button"
                  onClick={() => setAlertOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-500/40 px-3 py-2 text-sm font-medium text-orange-300 hover:bg-orange-500/10"
                >
                  <Bell className="size-4" /> Alarm
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 divide-y divide-[var(--border)]">
            {price != null && dayLow != null && dayHigh != null && dayHigh > dayLow ? (
              <RangeRow label="Gün içi aralık" low={dayLow} high={dayHigh} value={price} cur={t.currency} />
            ) : null}
            {price != null && wkLow != null && wkHigh != null && wkHigh > wkLow ? (
              <RangeRow label="52 haftalık aralık" low={wkLow} high={wkHigh} value={price} cur={t.currency} />
            ) : null}
            {prev != null ? <Stat label="Önceki kapanış" value={money(prev, t.currency)} /> : null}
            {t.volume || q?.volume ? <Stat label="Hacim" value={t.volume || compact(q!.volume!)} /> : null}
            {t.pe != null && t.pe > 0 ? <Stat label="F/K" value={t.pe.toFixed(1)} /> : null}
            {t.score != null ? (
              <Stat
                label="Bullsye skoru"
                value={`${t.score}/100`}
                tone={t.score >= 70 ? 'text-emerald-300' : t.score <= 40 ? 'text-rose-300' : undefined}
              />
            ) : null}
            {wkHigh != null && price != null ? (
              <Stat
                label="Zirveye uzaklık"
                value={`${(((price - wkHigh) / wkHigh) * 100).toFixed(1)}%`}
                tone="text-[var(--muted)]"
              />
            ) : null}
          </div>

          <p className="mt-auto pt-4 text-[10px] leading-relaxed text-[var(--muted)]">
            Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
          </p>
        </aside>
      </div>

      {t.alertSymbol && price != null ? (
        <AlertModal
          open={alertOpen}
          onOpenChange={setAlertOpen}
          symbol={t.alertSymbol}
          displaySymbol={t.title}
          currentPrice={price}
          changePercent={change}
        />
      ) : null}
    </>
  );
}

export function QuickChartProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<QuickChartTarget | null>(null);
  const close = useCallback(() => setTarget(null), []);

  return (
    <Ctx.Provider value={setTarget}>
      {children}
      <DialogPrimitive.Root open={Boolean(target)} onOpenChange={(o) => !o && close()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--popover-bg)] shadow-2xl outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(1180px,94vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
          >
            {target ? <ChartView key={target.chartSymbol} t={target} onClose={close} /> : null}
            <DialogPrimitive.Close className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]">
              <X className="size-5" />
              <span className="sr-only">Kapat</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </Ctx.Provider>
  );
}
