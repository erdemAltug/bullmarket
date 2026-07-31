'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  LockedValue,
  ProtectedFeature,
} from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import { generateRealTimeSignals } from '@/lib/signals';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

type Filter = 'ALL' | 'BIST' | 'CRYPTO' | 'BUY';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Tümü' },
  { id: 'BIST', label: 'BİST Sinyalleri' },
  { id: 'CRYPTO', label: 'Kripto Sinyalleri' },
  { id: 'BUY', label: 'Sadece AL' },
];

interface AISignalRadarProps {
  marketItems: ScannerItem[];
  isLoading?: boolean;
  /** Free preview cards before soft paywall */
  freeCount?: number;
}

export function AISignalRadar({
  marketItems,
  isLoading,
  freeCount = 3,
}: AISignalRadarProps) {
  const { data: session } = authClient.useSession();
  const unlocked = Boolean(session?.user);
  const [filter, setFilter] = useState<Filter>('ALL');

  const allSignals = useMemo(
    () => generateRealTimeSignals(marketItems),
    [marketItems]
  );

  const filteredSignals = useMemo(() => {
    return allSignals.filter((sig) => {
      if (filter === 'BIST') return sig.category === 'BIST';
      if (filter === 'CRYPTO') return sig.category === 'CRYPTO';
      if (filter === 'BUY')
        return sig.signalType === 'BUY' || sig.signalType === 'STRONG_BUY';
      return true;
    });
  }, [allSignals, filter]);

  const free = unlocked ? filteredSignals : filteredSignals.slice(0, freeCount);
  const gated = unlocked ? [] : filteredSignals.slice(freeCount);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-400" />
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              AI Signal Radar
            </h2>
            <span className="animate-pulse rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              LIVE ALGO
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Canlı fiyat aksiyonuna bağlı RSI, SMA, MACD ve destek/direnç
            sinyalleri — {filteredSignals.length} aktif kart
          </p>
        </div>

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
        {free.map((sig) => {
          const isBuy =
            sig.signalType === 'BUY' || sig.signalType === 'STRONG_BUY';
          const currency = sig.category === 'CRYPTO' ? '$' : '₺';
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
                    <span className="text-base font-bold text-[var(--foreground)] transition-colors group-hover:text-emerald-400">
                      {sig.displaySymbol}
                    </span>
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
                    {unlocked ? (
                      <>
                        {currency}
                        {fmt(sig.stopLoss)}
                      </>
                    ) : (
                      <LockedValue feature="AI Stop-Loss">
                        {currency}
                        {fmt(sig.stopLoss)}
                      </LockedValue>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-sans text-[9px] uppercase text-emerald-400/80">
                    Hedef
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-400">
                    {unlocked ? (
                      <>
                        {currency}
                        {fmt(sig.targetPrice)}
                      </>
                    ) : (
                      <LockedValue feature="AI Hedef Fiyat">
                        {currency}
                        {fmt(sig.targetPrice)}
                      </LockedValue>
                    )}
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

      {gated.length > 0 ? (
        <ProtectedFeature featureTitle="AI Signal Radar">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gated.slice(0, 9).map((sig) => (
              <div
                key={sig.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="font-bold">{sig.displaySymbol}</p>
                <p className="text-xs text-[var(--muted)]">{sig.strategyName}</p>
                <p className="mt-2 text-sm tabular-nums">
                  Giriş {sig.entryPrice.toFixed(2)} · SL{' '}
                  {sig.stopLoss.toFixed(2)} · TP {sig.targetPrice.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </ProtectedFeature>
      ) : null}

      {!isLoading && filteredSignals.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted)]">
          Bu filtrede sinyal yok — piyasayı yenileyin veya Tümü’yü seçin.
        </p>
      ) : null}
    </div>
  );
}
