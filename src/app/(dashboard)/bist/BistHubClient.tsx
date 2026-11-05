'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MarketScannerTable } from '@/components/dashboard/MarketScannerTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useBistBoard, useMarketScanner } from '@/hooks/useMarketScanner';

function BistPageInner() {
  const searchParams = useSearchParams();
  const focusSymbol = searchParams.get('symbol') ?? 'XU100.IS';
  const scanner = useMarketScanner();
  const board = useBistBoard();
  // The full board covers every listed stock; the live tape keeps XU100 and
  // refreshes faster, so its quotes win where both have a symbol.
  const tape = scanner.data ?? [];
  const liveBySymbol = new Map(tape.map((i) => [i.symbol, i]));
  const items = [
    ...tape.filter((i) => i.category === 'BIST'),
    ...(board.data ?? []).filter((i) => !liveBySymbol.has(i.symbol)),
  ];
  const bistItems = items.filter((i) => i.category === 'BIST');
  const focus =
    bistItems.find((i) => i.symbol === focusSymbol) ??
    bistItems.find((i) => i.symbol.includes('XU100'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tarama</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Borsa İstanbul hisselerini ara, sektöre göre filtrele, sırala ve izleme listene ekle
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
        scope={['BIST']}
        title="BİST hisseleri"
      />
    </div>
  );
}

export function BistHubClient() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Yükleniyor…</p>}>
      <BistPageInner />
    </Suspense>
  );
}
