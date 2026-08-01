'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MarketScannerTable } from '@/components/dashboard/MarketScannerTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useMarketScanner } from '@/hooks/useMarketScanner';

function UsPageInner() {
  const searchParams = useSearchParams();
  const focusSymbol = (searchParams.get('symbol') ?? 'AAPL').toUpperCase();
  const scanner = useMarketScanner();
  const items = scanner.data ?? [];
  const usItems = items.filter((i) => i.category === 'US');
  const focus =
    usItems.find((i) => i.symbol === focusSymbol) ??
    usItems.find((i) => i.displaySymbol === 'AAPL') ??
    usItems[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          NASDAQ & ABD
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Amerikan borsaları — canlı Yahoo fiyat, F/K, analist hedefi & screener
        </p>
      </div>

      {focus ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MetricCard
            title={focus.name}
            value={focus.price}
            changePercent={focus.changePercent}
            currency={focus.currency}
          />
          <ChartPanel
            title={focus.displaySymbol}
            symbol={focus.chartSymbol}
            source="yahoo"
            isPositive={focus.changePercent >= 0}
            defaultTimeframe="5D"
          />
        </div>
      ) : scanner.isLoading ? (
        <p className="text-sm text-[var(--muted)]">Yükleniyor…</p>
      ) : null}

      <MarketScannerTable
        items={items}
        isLoading={scanner.isLoading}
        error={scanner.error?.message}
        defaultFilter="US"
        title="ABD / NASDAQ Market Screener"
      />
    </div>
  );
}

export default function UsPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-[var(--muted)]">Yükleniyor…</p>}
    >
      <UsPageInner />
    </Suspense>
  );
}
