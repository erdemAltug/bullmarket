'use client';

import { Crosshair, Radar, Sparkles } from 'lucide-react';
import { useSmartRadar } from '@/hooks/useIntelligence';
import { ListSkeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import type { SmartRadarKind } from '@/types';

const KIND_STYLE: Record<SmartRadarKind, string> = {
  dip: 'border-sky-500/40 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]',
  breakout:
    'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  sma200_bounce:
    'border-violet-500/40 bg-violet-500/15 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]',
};

interface SmartRadarProps {
  symbols?: string[];
}

export function SmartRadar({ symbols }: SmartRadarProps) {
  const { data, isLoading, error } = useSmartRadar(symbols);
  const cards = data?.cards ?? [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-zinc-900/60 to-zinc-950 p-4 shadow-[0_0_30px_rgba(139,92,246,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-violet-500/20 p-2 text-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.25)]">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Günün Radarı / Alım Fırsatları
          </h2>
          <p className="text-[11px] text-zinc-500">
            RSI · SMA · hacim kuralları
          </p>
        </div>
      </div>

      {isLoading && !cards.length ? (
        <ListSkeleton rows={2} />
      ) : error ? (
        <p className="text-sm text-rose-400">{error.message}</p>
      ) : !cards.length ? (
        <div className="relative flex flex-col items-center py-10 text-center">
          <div className="relative mb-4 flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-violet-500/20" />
            <div className="absolute inset-2 rounded-full border border-dashed border-violet-500/30" />
            <div className="animate-radar-sweep absolute inset-0 origin-center">
              <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-violet-400/80 to-transparent" />
            </div>
            <Radar className="relative size-5 text-violet-400" />
          </div>
          <p className="text-sm font-medium text-zinc-300">
            Bugün radara takılan fırsat yok
          </p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Kurallar tarandı — yeni eşleşme için 15–30 sn bekleyin.
          </p>
        </div>
      ) : (
        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <article
              key={`${c.symbol}-${c.kind}`}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 backdrop-blur-sm transition-colors hover:border-violet-500/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-100">{c.displaySymbol}</p>
                  <p className="text-xs tabular-nums text-zinc-500">
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
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                <span className="font-medium text-zinc-300">Neden fırsat? </span>
                {c.reason}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <Crosshair className="size-3" />%{c.confidence} Analiz Eşleşmesi
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
