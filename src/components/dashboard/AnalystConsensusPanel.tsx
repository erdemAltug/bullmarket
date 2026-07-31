'use client';

import type { AnalystConsensus } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

interface AnalystConsensusPanelProps {
  price: number;
  currency: string;
  analyst: AnalystConsensus;
}

export function AnalystConsensusPanel({
  price,
  currency,
  analyst,
}: AnalystConsensusPanelProps) {
  const mean = analyst.targetMean;
  const upside =
    mean != null && price > 0 ? ((mean - price) / price) * 100 : null;
  const total =
    analyst.strongBuy +
    analyst.buy +
    analyst.hold +
    analyst.sell +
    analyst.strongSell;

  const segments = [
    { key: 'SB', n: analyst.strongBuy, color: 'bg-emerald-500' },
    { key: 'B', n: analyst.buy, color: 'bg-emerald-400/80' },
    { key: 'H', n: analyst.hold, color: 'bg-zinc-500' },
    { key: 'S', n: analyst.sell, color: 'bg-red-400/80' },
    { key: 'SS', n: analyst.strongSell, color: 'bg-red-600' },
  ];

  const hasTargets = mean != null || analyst.targetHigh != null;

  if (!hasTargets && total === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Bu sembol için analist konsensüsü bulunamadı.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
        Analist Konsensüsü & Fiyat Hedefleri
      </p>

      {upside != null ? (
        <div
          className={cn(
            'inline-flex rounded-lg px-3 py-2 text-sm font-semibold',
            upside >= 0
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-red-500/15 text-red-300'
          )}
        >
          {upside >= 0 ? '+' : ''}
          {upside.toFixed(1)}% Yükseliş Potansiyeli
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-zinc-500">Düşük</p>
          <p className="font-semibold tabular-nums">
            {analyst.targetLow != null
              ? formatPrice(analyst.targetLow, currency)
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Ortalama</p>
          <p className="text-base font-semibold tabular-nums text-emerald-300">
            {mean != null ? formatPrice(mean, currency) : '—'}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Yüksek</p>
          <p className="font-semibold tabular-nums">
            {analyst.targetHigh != null
              ? formatPrice(analyst.targetHigh, currency)
              : '—'}
          </p>
        </div>
      </div>

      {analyst.recommendationKey ? (
        <p className="text-xs text-zinc-400">
          Konsensüs:{' '}
          <span className="font-medium uppercase text-zinc-200">
            {analyst.recommendationKey.replace(/_/g, ' ')}
          </span>
        </p>
      ) : null}

      {total > 0 ? (
        <div>
          <div className="mb-1 flex h-3 overflow-hidden rounded-full bg-zinc-800">
            {segments.map((s) =>
              s.n > 0 ? (
                <div
                  key={s.key}
                  className={cn(s.color)}
                  style={{ width: `${(s.n / total) * 100}%` }}
                  title={`${s.key}: ${s.n}`}
                />
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
            <span>Strong Buy {analyst.strongBuy}</span>
            <span>Buy {analyst.buy}</span>
            <span>Hold {analyst.hold}</span>
            <span>Sell {analyst.sell}</span>
            <span>Strong Sell {analyst.strongSell}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
