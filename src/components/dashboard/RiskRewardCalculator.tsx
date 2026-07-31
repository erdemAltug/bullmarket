'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ReferenceLine,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { stopLevels, takeProfitLevels, riskReward } from '@/lib/risk-reward';
import type { HistoricalPricePoint } from '@/types';
import { cn } from '@/lib/utils';

interface RiskRewardCalculatorProps {
  entryPrice?: number;
  currencySymbol?: string;
  chartData?: HistoricalPricePoint[];
  className?: string;
}

export function RiskRewardCalculator({
  entryPrice,
  currencySymbol = '₺',
  chartData,
  className,
}: RiskRewardCalculatorProps) {
  const [entry, setEntry] = useState(
    entryPrice != null && entryPrice > 0 ? String(entryPrice) : ''
  );

  useEffect(() => {
    if (entryPrice != null && entryPrice > 0) setEntry(String(entryPrice));
  }, [entryPrice]);

  const price = Number(entry.replace(',', '.'));
  const valid = Number.isFinite(price) && price > 0;

  const stops = useMemo(() => (valid ? stopLevels(price) : []), [price, valid]);
  const takes = useMemo(
    () => (valid ? takeProfitLevels(price) : []),
    [price, valid]
  );
  const rr = valid ? riskReward(price, 5, 15) : 0;

  return (
    <div
      className={cn(
        'space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4',
        className
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Risk / Ödül Hesaplayıcı
          </p>
          <p className="text-xs text-zinc-500">
            Stop %3/%5/%10 · Take Profit %10/%20/%30
          </p>
        </div>
        <label className="text-xs text-zinc-400">
          Alış fiyatı
          <input
            type="number"
            step="any"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="mt-1 block w-36 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm tabular-nums"
            placeholder="0.00"
          />
        </label>
      </div>

      {valid ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-red-400">Stop-Loss</p>
              <ul className="space-y-1 text-sm tabular-nums">
                {stops.map((s) => (
                  <li key={s.pct} className="flex justify-between text-zinc-300">
                    <span>-%{s.pct}</span>
                    <span>
                      {currencySymbol}
                      {s.price.toLocaleString('tr-TR', {
                        maximumFractionDigits: 4,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-emerald-400">
                Kâr Al (TP)
              </p>
              <ul className="space-y-1 text-sm tabular-nums">
                {takes.map((t) => (
                  <li key={t.pct} className="flex justify-between text-zinc-300">
                    <span>+%{t.pct}</span>
                    <span>
                      {currencySymbol}
                      {t.price.toLocaleString('tr-TR', {
                        maximumFractionDigits: 4,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Örnek R:R (@%5 SL / %15 TP):{' '}
            <span className="font-medium text-zinc-300">1:{rr.toFixed(1)}</span>
          </p>

          {chartData && chartData.length > 2 ? (
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      borderColor: '#27272a',
                    }}
                    formatter={(v) => [
                      `${currencySymbol}${Number(v).toLocaleString('tr-TR')}`,
                      'Fiyat',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#a1a1aa"
                    fill="transparent"
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                  <ReferenceLine
                    y={price}
                    stroke="#fafafa"
                    strokeDasharray="4 4"
                    label={{ value: 'Giriş', fill: '#a1a1aa', fontSize: 10 }}
                  />
                  {stops.map((s) => (
                    <ReferenceLine
                      key={`sl-${s.pct}`}
                      y={s.price}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                    />
                  ))}
                  {takes.map((t) => (
                    <ReferenceLine
                      key={`tp-${t.pct}`}
                      y={t.price}
                      stroke="#22c55e"
                      strokeDasharray="3 3"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-zinc-500">Alış fiyatı girin.</p>
      )}
    </div>
  );
}
