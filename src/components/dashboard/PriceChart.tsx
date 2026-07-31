'use client';

import {
  Area,
  AreaChart,
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
}

function formatAxisLabel(ts: number, timeframe?: ChartTimeframe) {
  const d = new Date(ts);
  if (!timeframe || timeframe === '1D' || timeframe === '5D') {
    return d.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

export function PriceChart({
  data,
  isPositive = true,
  timeframe,
  height = 250,
  currencySymbol = '₺',
}: PriceChartProps) {
  const color = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `colorPrice-${isPositive ? 'up' : 'down'}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              color: '#fff',
            }}
            labelFormatter={(ts) => formatAxisLabel(Number(ts), timeframe)}
            formatter={(value) => [
              `${currencySymbol}${Number(value).toLocaleString('tr-TR')}`,
              'Price',
            ]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
