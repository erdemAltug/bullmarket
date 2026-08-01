'use client';

import { HintTooltip } from '@/components/shared/HintTooltip';
import type { SentimentReading } from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

interface MarketSentimentMeterProps {
  reading: SentimentReading | null;
  loading?: boolean;
}

const BREADTH_TIP =
  'Piyasada yükselen hisselerin düşenlere oranı üzerinden hesaplanan anlık yön endeksi.';

export function MarketSentimentMeter({
  reading,
  loading,
}: MarketSentimentMeterProps) {
  if (loading && !reading) {
    return (
      <div className="h-44 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
    );
  }
  if (!reading) return null;

  const angle = -90 + (reading.value / 100) * 180;
  const bullish = reading.value >= 55;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <HintTooltip content={BREADTH_TIP} title="Piyasa Genişlik Metresi">
          <h2 className="text-sm font-semibold tracking-tight">
            Piyasa Genişlik Metresi
          </h2>
        </HintTooltip>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
            bullish
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          )}
        >
          {reading.label}
        </span>
      </div>

      <div className="relative mx-auto h-24 w-48 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-24 rounded-t-full"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 100%, #f43f5e 0deg, #f59e0b 55deg, #eab308 90deg, #22c55e 135deg, #10b981 180deg)',
            maskImage:
              'radial-gradient(circle at 50% 100%, transparent 55%, black 57%)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 100%, transparent 55%, black 57%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-20 w-0.5 origin-bottom bg-white shadow"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white" />
      </div>

      <p className="mt-1 text-center text-3xl font-black tabular-nums">
        %{reading.value}
      </p>
      <p className="mt-1 text-center text-xs text-[var(--muted)]">
        {reading.detail}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] text-[var(--muted)]">
        <div className="rounded-lg bg-[var(--surface)]/60 px-2 py-1.5">
          BİST genişlik{' '}
          <strong className="text-[var(--foreground)]">
            %{reading.bistBreadth.toFixed(0)}
          </strong>
        </div>
        <div className="rounded-lg bg-[var(--surface)]/60 px-2 py-1.5">
          Kripto momentum{' '}
          <strong className="text-[var(--foreground)]">
            %{reading.cryptoMomentum.toFixed(0)}
          </strong>
        </div>
      </div>
    </section>
  );
}
