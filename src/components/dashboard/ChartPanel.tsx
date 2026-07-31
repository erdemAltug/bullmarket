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

interface ChartPanelProps {
  title: string;
  symbol: string;
  source?: 'yahoo' | 'binance';
  isPositive?: boolean;
  currencySymbol?: string;
  defaultTimeframe?: ChartTimeframe;
}

function ChartPanelInner({
  title,
  symbol,
  source = 'yahoo',
  isPositive = true,
  currencySymbol = '₺',
  defaultTimeframe = '1D',
}: ChartPanelProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>(defaultTimeframe);
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
          <span className="ml-2 font-normal text-zinc-500">{timeframe}</span>
        </CardTitle>
        <ChartTimeframeTabs value={timeframe} onChange={setTimeframe} />
      </CardHeader>
      <CardContent>
        {points.length ? (
          <PriceChart
            data={points}
            isPositive={positive}
            timeframe={timeframe}
            currencySymbol={currencySymbol}
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
