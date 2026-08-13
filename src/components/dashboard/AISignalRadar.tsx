'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { generateRealTimeSignals } from '@/lib/signals';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | 'BIST' | 'CRYPTO' | 'US' | 'ETF' | 'BUY';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'BIST', label: 'BİST Sinyalleri' },
  { id: 'US', label: 'ABD / NASDAQ' },
  { id: 'ETF', label: "ETF'ler" },
  { id: 'CRYPTO', label: 'Kripto Sinyalleri' },
  { id: 'BUY', label: 'Sadece AL' },
];

interface AISignalRadarProps {
  marketItems: ScannerItem[];
  isLoading?: boolean;
  /** Parent section already shows the title */
  hideHeader?: boolean;
}

export function AISignalRadar({
  marketItems,
  isLoading,
  hideHeader = false,
}: AISignalRadarProps) {
  const [filter, setFilter] = useState<Filter>('ALL');

  const allSignals = useMemo(
    () => generateRealTimeSignals(marketItems),
    [marketItems]
  );

  const filteredSignals = useMemo(() => {
    return allSignals.filter((sig) => {
      if (filter === 'BIST') return sig.category === 'BIST';
      if (filter === 'US') return sig.category === 'US';
      if (filter === 'ETF') return sig.category === 'ETF';
      if (filter === 'CRYPTO') return sig.category === 'CRYPTO';
      if (filter === 'BUY')
        return sig.signalType === 'BUY' || sig.signalType === 'STRONG_BUY';
      return true;
    });
  }, [allSignals, filter]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {!hideHeader ? (
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
                Signal Radar
              </h2>
              <span className="animate-pulse rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                CANLI
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Gün içi high/low + momentum · {filteredSignals.length} aktif kart
            </p>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            <span className="mr-2 inline-flex animate-pulse rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              CANLI
            </span>
            {filteredSignals.length} aktif kart
          </p>
        )}

        <div className="flex items-center gap-1.5 overflow-x-auto">
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
      </div>

      {isLoading && !marketItems.length ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-emerald-400">
          Canlı sinyal motoru hesaplanıyor…
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSignals.map((sig) => {
          const isBuy =
            sig.signalType === 'BUY' || sig.signalType === 'STRONG_BUY';
          const currency =
            sig.category === 'CRYPTO' || sig.category === 'US' ? '$' : '₺';
          const fmt = (n: number) =>
            n.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: n >= 1000 ? 2 : 4,
            });

          return (
            <article
              key={sig.id}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur-xl transition-all hover:border-emerald-500/30"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const href = assetDetailHref(sig.symbol, sig.category);
                      return href ? (
                        <Link
                          href={href}
                          className="text-base font-bold text-[var(--foreground)] transition-colors hover:text-emerald-400 hover:underline"
                        >
                          {sig.displaySymbol}
                        </Link>
                      ) : (
                        <span className="text-base font-bold text-[var(--foreground)] transition-colors group-hover:text-emerald-400">
                          {sig.displaySymbol}
                        </span>
                      );
                    })()}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      {sig.category}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)]">
                    {sig.strategyName}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold',
                    isBuy
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                  )}
                >
                  {sig.signalType === 'STRONG_BUY'
                    ? 'GÜÇLÜ AL'
                    : isBuy
                      ? 'AL'
                      : 'SAT'}
                </span>
              </div>

              <div className="my-3 grid grid-cols-3 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-2.5 text-center font-mono">
                <div>
                  <div className="font-sans text-[9px] uppercase text-[var(--muted)]">
                    Giriş
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-[var(--foreground)]">
                    {currency}
                    {fmt(sig.entryPrice)}
                  </div>
                </div>
                <div>
                  <div className="font-sans text-[9px] uppercase text-rose-400/80">
                    Stop-Loss
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-rose-400">
                    {currency}
                    {fmt(sig.stopLoss)}
                  </div>
                </div>
                <div>
                  <div className="font-sans text-[9px] uppercase text-emerald-400/80">
                    Hedef
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-400">
                    {currency}
                    {fmt(sig.targetPrice)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--muted)]">
                <span>{sig.timeAgo}</span>
                <span>
                  R/R {sig.riskRewardRatio} · Güven{' '}
                  <strong className="text-emerald-400">
                    %{sig.confidenceScore}
                  </strong>
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {!isLoading && filteredSignals.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted)]">
          Bu filtrede sinyal yok — piyasayı yenileyin veya Tümü’yü seçin.
        </p>
      ) : null}
    </div>
  );
}
