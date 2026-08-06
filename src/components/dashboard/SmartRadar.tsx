'use client';

import { Crosshair, Radar, Sparkles } from 'lucide-react';
import { useSmartRadar } from '@/hooks/useIntelligence';
import { ListSkeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import type { SmartRadarKind } from '@/types';

const KIND_STYLE: Record<SmartRadarKind, string> = {
  dip: 'border-sky-500/35 bg-sky-500/10 text-sky-300',
  breakout:
    'border-[var(--up)]/35 bg-[var(--glow-up)] text-[var(--up)]',
  sma200_bounce:
    'border-indigo-400/35 bg-indigo-500/10 text-indigo-300',
};

interface SmartRadarProps {
  symbols?: string[];
}

export function SmartRadar({ symbols }: SmartRadarProps) {
  const { data, isLoading, error } = useSmartRadar(symbols);
  const cards = data?.cards ?? [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-400/25 bg-gradient-to-r from-indigo-500/8 via-[var(--card)] to-[var(--surface)] p-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[var(--glow-violet)] blur-3xl" />

      <div className="relative mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-500/15 p-2 text-indigo-300">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Günün Radarı / Alım Fırsatları
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            RSI · SMA · hacim kuralları
          </p>
        </div>
      </div>

      {isLoading && !cards.length ? (
        <ListSkeleton rows={2} />
      ) : error ? (
        <p className="text-sm text-[var(--down)]">{error.message}</p>
      ) : !cards.length ? (
        <div className="relative flex flex-col items-center py-10 text-center">
          <div className="relative mb-4 flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-indigo-400/20" />
            <div className="absolute inset-2 rounded-full border border-dashed border-indigo-400/30" />
            <div className="animate-radar-sweep absolute inset-0 origin-center">
              <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-indigo-300/70 to-transparent" />
            </div>
            <Radar className="relative size-5 text-indigo-300" />
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Bugün radara takılan fırsat yok
          </p>
          <p className="mt-1 max-w-xs text-xs text-[var(--muted)]">
            Kurallar tarandı — yeni eşleşme için 15–30 sn bekleyin.
          </p>
        </div>
      ) : (
        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <article
              key={`${c.symbol}-${c.kind}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-3 backdrop-blur-sm transition-colors hover:border-indigo-400/35"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {c.displaySymbol}
                  </p>
                  <p className="text-xs tabular-nums text-[var(--muted)]">
                    {formatPrice(
                      c.price,
                      c.symbol.endsWith('USDT') ? 'USD' : 'TRY'
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase',
                    KIND_STYLE[c.kind]
                  )}
                >
                  {c.tag}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                <span className="font-medium text-[var(--foreground)]/80">
                  Neden fırsat?{' '}
                </span>
                {c.reason}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]">
                <Crosshair className="size-3" />%{c.confidence} Analiz Eşleşmesi
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
