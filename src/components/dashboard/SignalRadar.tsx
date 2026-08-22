'use client';

import { Radar } from 'lucide-react';
import { TermHint } from '@/components/shared/TermHint';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/skeleton';
import { useSignals } from '@/hooks/useIntelligence';
import { cn } from '@/lib/utils';
import type { SignalKind } from '@/types';

const STYLE: Record<SignalKind, string> = {
  rsi_oversold: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  rsi_overbought: 'border-red-500/40 bg-red-500/10 text-red-300',
  sma_cross_up: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200',
  sma_cross_down: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

interface SignalRadarProps {
  symbols: string[];
}

export function SignalRadar({ symbols }: SignalRadarProps) {
  const bistLike = symbols.filter(
    (s) => s.endsWith('.IS') || s.endsWith('USDT')
  );
  const { data, isLoading, error } = useSignals(bistLike);
  const signals = data?.signals ?? [];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Radar className="size-4 text-zinc-400" />
        <h2 className="text-sm font-medium text-zinc-300">Sinyal Radarı</h2>
        <TermHint term="rsi" className="text-xs text-zinc-500" />
        <TermHint term="sma50" className="text-xs text-zinc-500" />
      </div>

      {isLoading && !signals.length ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <p className="text-sm text-red-400">{error.message}</p>
      ) : !signals.length ? (
        <EmptyState
          icon={Radar}
          title="Henüz aktif sinyal bulunamadı"
          description="İzleme listesi tarandı; RSI/SMA kuralı eşleşmedi."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2">
          {signals.map((s) => (
            <li
              key={`${s.symbol}-${s.kind}`}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm',
                STYLE[s.kind]
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{s.displaySymbol}</span>
                <span className="text-[11px] tabular-nums opacity-80">
                  {s.rsi != null ? `RSI ${s.rsi.toFixed(1)}` : null}
                  {s.sma50 != null
                    ? ` · SMA50 ${s.sma50.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`
                    : null}
                </span>
              </div>
              <p className="mt-0.5 text-xs opacity-90">{s.label}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
