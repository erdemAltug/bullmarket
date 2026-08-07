'use client';

import { memo, useState } from 'react';
import { LineChart } from 'lucide-react';
import { ChartTimeframeTabs } from '@/components/dashboard/ChartTimeframeTabs';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useChartHistory } from '@/hooks/useMarketData';
import type { ChartTimeframe } from '@/lib/chart-timeframes';
import { cn } from '@/lib/utils';

interface ChartPanelProps {
  title: string;
  symbol: string;
  source?: 'yahoo' | 'binance';
  isPositive?: boolean;
  currencySymbol?: string;
  defaultTimeframe?: ChartTimeframe;
  height?: number;
  detailed?: boolean;
}

function ChartPanelInner({
  title,
  symbol,
  source = 'yahoo',
  isPositive = true,
  currencySymbol = '₺',
  defaultTimeframe = '1D',
  height = 360,
  detailed = true,
}: ChartPanelProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>(defaultTimeframe);
  const [showSma, setShowSma] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const { data, isFetching, isError, error } = useChartHistory(
    symbol,
    timeframe,
    source
  );

  const points = data?.points ?? [];
  const positive =
    points.length >= 2
      ? points[points.length - 1].price >= points[0].price
      : isPositive;

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>
          {title}
          <span className="ml-2 font-normal text-[var(--muted)]">{timeframe}</span>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {detailed ? (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setShowSma((v) => !v)}
                className={cn(
                  'rounded-md border px-2 py-1 transition',
                  showSma
                    ? 'border-sky-400/40 text-sky-300'
                    : 'border-[var(--border)] text-[var(--muted)]'
                )}
              >
                SMA
              </button>
              <button
                type="button"
                onClick={() => setShowVolume((v) => !v)}
                className={cn(
                  'rounded-md border px-2 py-1 transition',
                  showVolume
                    ? 'border-[var(--muted)]/50 text-[var(--foreground)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                )}
              >
                Hacim
              </button>
            </div>
          ) : null}
          <ChartTimeframeTabs value={timeframe} onChange={setTimeframe} />
        </div>
      </CardHeader>
      <CardContent>
        {detailed && showSma ? (
          <div className="mb-2 flex flex-wrap gap-3 text-[10px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-400" /> SMA 20
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-violet-400" /> SMA 50
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: positive ? '#2dd4bf' : '#f43f5e' }}
              />{' '}
              Fiyat
            </span>
          </div>
        ) : null}
        {points.length ? (
          <PriceChart
            data={points}
            isPositive={positive}
            timeframe={timeframe}
            currencySymbol={currencySymbol}
            height={height}
            showSma={detailed && showSma}
            showVolume={detailed && showVolume}
          />
        ) : isFetching ? (
          <ChartSkeleton />
        ) : isError ? (
          <EmptyState
            icon={LineChart}
            title="Grafik yüklenemedi"
            description={error.message}
          />
        ) : (
          <EmptyState
            icon={LineChart}
            title="Grafik verisi yok"
            description="Bu zaman aralığı için veri bulunamadı."
          />
        )}
      </CardContent>
    </Card>
  );
}

export const ChartPanel = memo(ChartPanelInner);
