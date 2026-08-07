'use client';

import { useMemo } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistoricalPricePoint } from '@/types';
import type { ChartTimeframe } from '@/lib/chart-timeframes';

interface PriceChartProps {
  data: HistoricalPricePoint[];
  isPositive?: boolean;
  timeframe?: ChartTimeframe;
  height?: number;
  currencySymbol?: string;
  showSma?: boolean;
  showVolume?: boolean;
}

function formatAxisLabel(ts: number, timeframe?: ChartTimeframe) {
  const d = new Date(ts);
  if (!timeframe || timeframe === '1D' || timeframe === '5D') {
    return d.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  if (timeframe === '1M') {
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
}

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

type ChartRow = HistoricalPricePoint & {
  sma20: number | null;
  sma50: number | null;
};

export function PriceChart({
  data,
  isPositive = true,
  timeframe,
  height = 360,
  currencySymbol = '₺',
  showSma = true,
  showVolume = true,
}: PriceChartProps) {
  const color = isPositive ? '#2dd4bf' : '#f43f5e';
  const gradientId = `colorPrice-${isPositive ? 'up' : 'down'}`;

  const chartData = useMemo(() => {
    const prices = data.map((d) => d.price);
    const s20 = sma(prices, 20);
    const s50 = sma(prices, 50);
    return data.map((d, i) => ({
      ...d,
      sma20: s20[i],
      sma50: s50[i],
    })) as ChartRow[];
  }, [data]);

  const hasVolume = showVolume && data.some((d) => (d.volume ?? 0) > 0);
  const chartH = hasVolume ? height : height;

  return (
    <div className="w-full" style={{ height: chartH }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="rgba(148,163,184,0.12)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(ts) => formatAxisLabel(Number(ts), timeframe)}
            minTickGap={40}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="price"
            domain={['auto', 'auto']}
            width={56}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              Number(v).toLocaleString('tr-TR', { maximumFractionDigits: 1 })
            }
          />
          {hasVolume ? (
            <YAxis
              yAxisId="vol"
              orientation="right"
              hide
              domain={[0, (max: number) => max * 4]}
            />
          ) : null}
          <Tooltip
            contentStyle={{
              backgroundColor: '#181c25',
              borderColor: 'rgba(148,163,184,0.2)',
              color: '#e8edf5',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(ts) => formatAxisLabel(Number(ts), timeframe)}
            formatter={(value, name) => {
              const n = Number(value);
              if (name === 'volume') {
                return [
                  n.toLocaleString('tr-TR', { notation: 'compact' }),
                  'Hacim',
                ];
              }
              if (name === 'sma20') return [`${currencySymbol}${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`, 'SMA 20'];
              if (name === 'sma50') return [`${currencySymbol}${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`, 'SMA 50'];
              return [
                `${currencySymbol}${n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`,
                'Fiyat',
              ];
            }}
          />
          {hasVolume ? (
            <Bar
              yAxisId="vol"
              dataKey="volume"
              fill="rgba(148,163,184,0.25)"
              isAnimationActive={false}
            />
          ) : null}
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={false}
          />
          {showSma ? (
            <>
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma20"
                stroke="#38bdf8"
                strokeWidth={1.25}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma50"
                stroke="#a78bfa"
                strokeWidth={1.25}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </>
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
