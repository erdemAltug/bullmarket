'use client';

import { AnalystConsensusPanel } from '@/components/dashboard/AnalystConsensusPanel';
import { RelativeValuationWidget } from '@/components/dashboard/RelativeValuationWidget';
import { RiskRewardCalculator } from '@/components/dashboard/RiskRewardCalculator';
import { ShareCardButton } from '@/components/dashboard/ShareCardButton';
import { TermHint } from '@/components/shared/TermHint';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useFundamentals } from '@/hooks/useIntelligence';
import { useChartHistory } from '@/hooks/useMarketData';
import { computeAssetHealth } from '@/lib/health-score';
import { formatCompact, formatPrice, cn } from '@/lib/utils';
import type { TermKey } from '@/lib/glossary';

interface StockScorecardProps {
  symbol: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Stat({
  label,
  value,
  hint,
  term,
}: {
  label: string;
  value: string;
  hint?: string;
  term?: TermKey;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
        {term ? <TermHint term={term} label={label} /> : label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function WeekRangeBar({
  price,
  low,
  high,
}: {
  price: number;
  low: number;
  high: number;
}) {
  const span = high - low || 1;
  const pct = Math.min(100, Math.max(0, ((price - low) / span) * 100));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="mb-3 text-[11px] uppercase tracking-wide text-zinc-500">
        52 Haftalık Aralık
      </p>
      <div className="relative h-2 rounded-full bg-zinc-800">
        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-red-500/40 via-zinc-500 to-emerald-500/40" />
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-emerald-400 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs tabular-nums text-zinc-400">
        <span>{formatPrice(low, 'TRY')}</span>
        <span className="text-zinc-200">{formatPrice(price, 'TRY')}</span>
        <span>{formatPrice(high, 'TRY')}</span>
      </div>
      <p className="mt-1 text-center text-[11px] text-zinc-500">
        Aralığın %{pct.toFixed(0)} seviyesinde
      </p>
    </div>
  );
}

export function StockScorecard({
  symbol,
  open,
  onOpenChange,
}: StockScorecardProps) {
  const { data, isLoading, error } = useFundamentals(
    open ? (symbol ?? undefined) : undefined
  );
  const hist = useChartHistory(
    open ? (symbol ?? undefined) : undefined,
    '1M',
    'yahoo'
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="border-b border-zinc-800 px-5 py-4 pr-12">
          <div className="flex items-start justify-between gap-2 pr-6">
            <div>
              <SheetTitle>
                Temel Analiz Karnesi
                {data ? (
                  <span className="ml-2 text-sm font-normal text-zinc-500">
                    {data.symbol.replace('.IS', '')}
                  </span>
                ) : null}
              </SheetTitle>
              {data ? (
                <p className="mt-1 text-sm text-zinc-500">{data.name}</p>
              ) : null}
            </div>
            {data ? (
              <ShareCardButton
                title={data.symbol.replace('.IS', '')}
                subtitle={data.name}
                price={data.price}
                currency={data.currency}
              />
            ) : null}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Yükleniyor…</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error.message}</p>
          ) : data ? (
            <>
              {(() => {
                const health = computeAssetHealth(data);
                return (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                          Genel Sağlık Skoru
                        </p>
                        <p className="text-3xl font-black tabular-nums text-emerald-300">
                          {health.overall}
                          <span className="text-sm font-normal text-zinc-500">
                            /100
                          </span>
                        </p>
                        <p className="text-xs text-zinc-400">{health.label}</p>
                      </div>
                      <div className="grid flex-1 grid-cols-2 gap-2">
                        {health.subs.map((s) => (
                          <div key={s.key} className="text-right">
                            <p className="text-[10px] text-zinc-500">{s.label}</p>
                            <p
                              className={cn(
                                'text-sm font-semibold tabular-nums',
                                s.score >= 70
                                  ? 'text-emerald-400'
                                  : s.score >= 45
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                              )}
                            >
                              {s.score}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="F/K"
                  term="fk"
                  value={
                    data.trailingPE != null ? data.trailingPE.toFixed(2) : '—'
                  }
                  hint="Fiyat / Kazanç"
                />
                <Stat
                  label="PD/DD"
                  term="pddd"
                  value={
                    data.priceToBook != null
                      ? data.priceToBook.toFixed(2)
                      : '—'
                  }
                  hint="Piyasa / Defter"
                />
                <Stat
                  label="Özsermaye Kârlılığı"
                  term="roe"
                  value={
                    data.returnOnEquity != null
                      ? `%${(data.returnOnEquity * 100).toFixed(1)}`
                      : '—'
                  }
                  hint="ROE"
                />
                <Stat
                  label="Piyasa Değeri"
                  term="mcap"
                  value={
                    data.marketCap != null
                      ? formatCompact(data.marketCap)
                      : '—'
                  }
                />
              </div>

              <RelativeValuationWidget symbol={data.symbol} />

              {data.fiftyTwoWeekLow != null &&
              data.fiftyTwoWeekHigh != null ? (
                <WeekRangeBar
                  price={data.price}
                  low={data.fiftyTwoWeekLow}
                  high={data.fiftyTwoWeekHigh}
                />
              ) : null}

              <div className="rounded-xl border border-zinc-800 p-3 text-sm">
                <p className="text-zinc-500">Son fiyat</p>
                <p className="text-2xl font-semibold">
                  {formatPrice(data.price, data.currency)}
                </p>
              </div>

              {data.analyst ? (
                <AnalystConsensusPanel
                  price={data.price}
                  currency={data.currency}
                  analyst={data.analyst}
                />
              ) : null}

              <RiskRewardCalculator
                entryPrice={data.price}
                currencySymbol={data.currency === 'USD' ? '$' : '₺'}
                chartData={hist.data?.points}
              />
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
