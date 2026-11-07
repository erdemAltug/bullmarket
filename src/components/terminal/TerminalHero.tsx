'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Sparkline } from '@/components/dashboard/Sparkline';
import { useCommodities } from '@/hooks/useMarketScanner';
import { useFx } from '@/hooks/useMarketData';
import { computeMarketSentiment } from '@/lib/ai-opportunity';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';
import { targetFromScanner, useChartClick, type QuickChartTarget } from './QuickChart';

type Tile = {
  key: string;
  label: string;
  value: string;
  change: number | null;
  spark?: number[];
  low?: number | null;
  high?: number | null;
  href: string;
  chart: QuickChartTarget;
};

function money(v: number, cur: 'TRY' | 'USD', digits = 2) {
  return `${cur === 'USD' ? '$' : '₺'}${v.toLocaleString('tr-TR', { maximumFractionDigits: digits })}`;
}

function signed(n: number) {
  return `${n >= 0 ? '+' : '−'}%${Math.abs(n).toLocaleString('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

function moodTone(v: number) {
  if (v >= 60) return { text: 'text-emerald-300', bar: 'bg-emerald-400' };
  if (v <= 40) return { text: 'text-rose-300', bar: 'bg-rose-400' };
  return { text: 'text-amber-200', bar: 'bg-amber-300' };
}

/**
 * Top of the terminal: one sentence that says what the market is doing,
 * a mood gauge, and the five numbers people check first.
 */
export function TerminalHero({ items, loading }: { items: ScannerItem[]; loading?: boolean }) {
  const commodities = useCommodities();
  const fx = useFx();
  const chartClick = useChartClick();

  const stats = useMemo(() => {
    const bist = items.filter((i) => i.category === 'BIST' && !i.displaySymbol.startsWith('XU') && i.price > 0);
    const up = bist.filter((i) => i.changePercent > 0).length;
    const down = bist.filter((i) => i.changePercent < 0).length;
    const flat = bist.length - up - down;
    const plausible = bist.filter((i) => Math.abs(i.changePercent) < 25);
    const leader = [...plausible].sort((a, b) => b.changePercent - a.changePercent)[0];
    const laggard = [...plausible].sort((a, b) => a.changePercent - b.changePercent)[0];
    const xu100 = items.find((i) => i.displaySymbol === 'XU100');
    const btc = items.find((i) => i.category === 'CRYPTO' && i.displaySymbol === 'BTC');
    const sentiment = items.length ? computeMarketSentiment(items) : null;
    return { up, down, flat, total: bist.length, leader, laggard, xu100, btc, sentiment };
  }, [items]);

  const tiles = useMemo<Tile[]>(() => {
    const find = (re: RegExp) => commodities.data.find((c) => re.test(`${c.symbol} ${c.name}`));
    const fxUsd = fx.data?.rates?.find((r) => r.code === 'USD');
    // Fall back to the FX feed when the commodities feed misses USD/TRY.
    const usd =
      find(/USD\s*\/?\s*TRY|USDTRY/i) ??
      (fxUsd ? { symbol: 'USDTRY', name: 'USD/TRY', price: fxUsd.forexSelling, changePercent: Number.NaN, currency: 'TRY' as const } : undefined);
    const gold = find(/gram\s*alt/i);
    const brent = find(/brent/i);
    const out: Tile[] = [];
    if (stats.xu100)
      out.push({
        key: 'xu100',
        label: 'BİST 100',
        value: stats.xu100.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 }),
        change: stats.xu100.changePercent,
        spark: stats.xu100.sparkline,
        low: stats.xu100.dayLow,
        high: stats.xu100.dayHigh,
        href: '/bist',
        chart: targetFromScanner(stats.xu100, '/bist'),
      });
    if (usd) out.push({ key: 'usd', label: 'Dolar / TL', value: money(usd.price, 'TRY', 4), change: Number.isFinite(usd.changePercent) ? usd.changePercent : null, href: '/fx', chart: { title: 'Dolar / TL', market: 'Döviz', chartSymbol: 'USDTRY=X', price: usd.price, changePercent: Number.isFinite(usd.changePercent) ? usd.changePercent : undefined, currency: 'TRY', href: '/fx', alertSymbol: 'USDTRY' } });
    if (gold) out.push({ key: 'gold', label: 'Gram altın', value: money(gold.price, 'TRY', 0), change: gold.changePercent, href: '/fx', chart: { title: 'Gram altın', market: 'Emtia', subtitle: 'Grafik: ons altın (USD) üzerinden', chartSymbol: 'GC=F', price: gold.price, changePercent: gold.changePercent, currency: 'TRY', href: '/fx', alertSymbol: gold.symbol } });
    if (stats.btc)
      out.push({
        key: 'btc',
        label: 'Bitcoin',
        value: money(stats.btc.price, 'USD', 0),
        change: stats.btc.changePercent,
        spark: stats.btc.sparkline,
        href: '/kripto/BTC',
        chart: targetFromScanner(stats.btc, '/kripto/BTC'),
      });
    if (brent) out.push({ key: 'brent', label: 'Brent petrol', value: money(brent.price, 'USD'), change: brent.changePercent, href: '/fx', chart: { title: 'Brent petrol', market: 'Emtia', chartSymbol: 'BZ=F', price: brent.price, changePercent: brent.changePercent, currency: 'USD', alertSymbol: brent.symbol } });
    return out;
  }, [commodities.data, fx.data, stats.xu100, stats.btc]);

  const mood = stats.sentiment?.value ?? 50;
  const tone = moodTone(mood);
  const breadthPct = stats.up + stats.down ? (stats.up / (stats.up + stats.down)) * 100 : 50;
  const xuChange = stats.xu100?.changePercent ?? null;

  const headline =
    xuChange == null
      ? 'Piyasa verisi yükleniyor…'
      : stats.up + stats.down === 0
        ? 'Borsa İstanbul henüz işlem görmüyor; son kapanış fiyatları gösteriliyor.'
        : `BİST 100 ${signed(xuChange)}. ${stats.total} hisseden ${stats.up} yükselişte, ${stats.down} düşüşte.`;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
      {/* Story + mood */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/[0.08] via-[var(--card)] to-[var(--card)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Bugün piyasada</p>
        {loading && !items.length ? (
          <div className="mt-3 space-y-2">
            <div className="h-5 w-4/5 animate-pulse rounded bg-[var(--border)]/50" />
            <div className="h-5 w-3/5 animate-pulse rounded bg-[var(--border)]/50" />
          </div>
        ) : (
          <p className="mt-2 text-lg font-semibold leading-snug tracking-tight sm:text-xl">{headline}</p>
        )}

        <div className="mt-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-rose-500/50">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${breadthPct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-[var(--muted)]">
            <span className="text-emerald-300">{stats.up} yükselen</span>
            {stats.flat ? <span>{stats.flat} yatay</span> : null}
            <span className="text-rose-300">{stats.down} düşen</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {stats.leader ? (
            <Link
              href={`/bist/${stats.leader.displaySymbol}`}
              onClick={chartClick(targetFromScanner(stats.leader, `/bist/${stats.leader.displaySymbol}`))}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 hover:border-emerald-500/50"
            >
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Günün lideri</span>
              <span className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-2">
                <b className="truncate text-sm">{stats.leader.displaySymbol}</b>
                <span className="whitespace-nowrap font-mono text-emerald-300">{signed(stats.leader.changePercent)}</span>
              </span>
            </Link>
          ) : null}
          {stats.laggard ? (
            <Link
              href={`/bist/${stats.laggard.displaySymbol}`}
              onClick={chartClick(targetFromScanner(stats.laggard, `/bist/${stats.laggard.displaySymbol}`))}
              className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-3 py-2 hover:border-rose-500/50"
            >
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Günün en zayıfı</span>
              <span className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-2">
                <b className="truncate text-sm">{stats.laggard.displaySymbol}</b>
                <span className="whitespace-nowrap font-mono text-rose-300">{signed(stats.laggard.changePercent)}</span>
              </span>
            </Link>
          ) : null}
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Piyasa havası</span>
            <span className={cn('text-xs font-semibold', tone.text)}>
              {stats.sentiment?.label ?? '—'} · {Math.round(mood)}/100
            </span>
          </div>
          <div className="relative mt-2 h-1.5 rounded-full bg-gradient-to-r from-rose-500/70 via-amber-300/70 to-emerald-400/70">
            <span
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--card)] bg-white shadow"
              style={{ left: `${mood}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {(tiles.length ? tiles : Array.from({ length: 5 }, () => null)).map((t, i) =>
          t ? (
            <Link
              key={t.key}
              href={t.href}
              onClick={chartClick(t.chart)}
              className={cn(
                'group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--accent)]/40',
                i === 0 && 'col-span-2 sm:col-span-1 sm:row-span-2'
              )}
            >
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{t.label}</p>
                <p className={cn('mt-1 font-mono font-bold tabular-nums', i === 0 ? 'text-2xl sm:text-3xl' : 'text-lg')}>
                  {t.value}
                </p>
                {t.change != null ? (
                  <p className={cn('font-mono text-xs font-semibold', t.change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {signed(t.change)}
                  </p>
                ) : null}
              </div>
              {i === 0 && t.low != null && t.high != null && t.high > t.low ? (
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-[var(--muted)]">
                    <span>Gün içi düşük</span>
                    <span>Yüksek</span>
                  </div>
                  <div className="relative mt-1 h-1.5 rounded-full bg-[var(--border)]">
                    <span
                      className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]"
                      style={{ left: `${Math.min(100, Math.max(0, ((parseFloat(t.value.replace(/\./g, '').replace(',', '.')) - t.low) / (t.high - t.low)) * 100))}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-[var(--muted)]">
                    <span>{t.low.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                    <span>{t.high.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              ) : null}
              {t.spark && t.spark.length > 2 ? (
                <Sparkline data={t.spark} width={240} height={i === 0 ? 80 : 32} positive={(t.change ?? 0) >= 0} className={cn('mt-3 w-full', i === 0 ? 'h-16 sm:h-24' : 'h-8')} />
              ) : null}
            </Link>
          ) : (
            <div
              key={i}
              className={cn('h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]', i === 0 && 'col-span-2 sm:col-span-1 sm:row-span-2 sm:h-auto')}
            />
          )
        )}
        <Link
          href="/firsatlar"
          className="col-span-full flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl border border-dashed border-[var(--accent)]/40 px-4 py-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/5"
        >
          535 hissenin skor taraması →
          <span className="text-[11px] font-normal text-[var(--muted)]">Filtrele, sırala, karşılaştır</span>
        </Link>
      </div>
    </section>
  );
}
