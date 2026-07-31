'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WatchlistTable } from '@/components/dashboard/WatchlistTable';
import { useBist } from '@/hooks/useMarketData';

type SortKey = 'symbol' | 'price' | 'changePercent';

function BistPageInner() {
  const searchParams = useSearchParams();
  const focusSymbol = searchParams.get('symbol') ?? 'XU100.IS';

  const { data, isLoading, error } = useBist();
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [asc, setAsc] = useState(true);

  const quotes = useMemo(() => {
    const list = [...(data?.quotes ?? [])];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return asc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return list;
  }, [data?.quotes, sortKey, asc]);

  const focus =
    quotes.find((q) => q.symbol === focusSymbol) ??
    quotes.find((q) => q.symbol.includes('XU100'));

  function handleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">BİST</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Borsa İstanbul canlı fiyatlar ve grafikler
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
            title={focus.symbol.replace('.IS', '')}
            symbol={focus.symbol}
            source="yahoo"
            isPositive={focus.changePercent >= 0}
            defaultTimeframe="5D"
          />
        </div>
      ) : isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-400">{error.message}</p>
      ) : (
        <WatchlistTable
          rows={quotes.map((q) => ({
            symbol: q.symbol,
            name: q.name,
            price: q.price,
            changePercent: q.changePercent,
            currency: q.currency,
          }))}
          onSort={handleSort}
        />
      )}
    </div>
  );
}

export default function BistPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <BistPageInner />
    </Suspense>
  );
}
