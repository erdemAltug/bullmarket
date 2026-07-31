'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MarketScannerTable } from '@/components/dashboard/MarketScannerTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useMarketScanner } from '@/hooks/useMarketScanner';

function BistPageInner() {
  const searchParams = useSearchParams();
  const focusSymbol = searchParams.get('symbol') ?? 'XU100.IS';
  const scanner = useMarketScanner();
  const items = scanner.data ?? [];
  const bistItems = items.filter((i) => i.category === 'BIST');
  const focus =
    bistItems.find((i) => i.symbol === focusSymbol) ??
    bistItems.find((i) => i.symbol.includes('XU100'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">BİST</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Borsa İstanbul screener — ara, filtrele, sparkline & watchlist
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
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : null}

      <MarketScannerTable
        items={items}
        isLoading={scanner.isLoading}
        error={scanner.error?.message}
        defaultFilter="BIST"
        title="BİST Market Screener"
      />
    </div>
  );
}

export default function BistPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
      <BistPageInner />
    </Suspense>
  );
}
