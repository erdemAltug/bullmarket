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

function toneClasses(value: number) {
  if (value >= 62) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  }
  if (value >= 45) {
    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
  }
  return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
}

export function MarketSentimentMeter({
  reading,
  loading,
}: MarketSentimentMeterProps) {
  if (loading && !reading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] sm:h-[280px]" />
    );
  }
  if (!reading) return null;

  const angle = -90 + (reading.value / 100) * 180;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur-xl">
      <header className="space-y-2">
        <HintTooltip content={BREADTH_TIP} title="Piyasa Genişlik Metresi" withIcon={false}>
          <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
            Piyasa Genişlik Metresi
          </h2>
        </HintTooltip>
        <span
          className={cn(
            'inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold leading-none',
            toneClasses(reading.value)
          )}
        >
          {reading.label}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <div className="relative h-[88px] w-[176px] shrink-0 overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 h-[88px] rounded-t-full"
            style={{
              background:
                'conic-gradient(from 180deg at 50% 100%, #f43f5e 0deg, #f59e0b 55deg, #eab308 90deg, #22c55e 135deg, #10b981 180deg)',
              maskImage:
                'radial-gradient(circle at 50% 100%, transparent 54%, black 56%)',
              WebkitMaskImage:
                'radial-gradient(circle at 50% 100%, transparent 54%, black 56%)',
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-[72px] w-0.5 origin-bottom bg-zinc-100"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          />
          <div className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-zinc-100 ring-2 ring-zinc-900" />
        </div>

        <p className="mt-3 text-center font-mono text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
          %{reading.value}
        </p>
        <p className="mt-1.5 max-w-[200px] text-center text-[11px] leading-relaxed text-[var(--muted)]">
          {reading.detail}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3">
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)]/40 px-2.5 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            BİST genişlik
          </p>
          <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-[var(--foreground)]">
            %{reading.bistBreadth.toFixed(0)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--surface)]/40 px-2.5 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Kripto mom.
          </p>
          <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-[var(--foreground)]">
            %{reading.cryptoMomentum.toFixed(0)}
          </p>
        </div>
      </div>
    </section>
  );
}
