'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { OrderBookDepth } from '@/components/dashboard/OrderBookDepth';
import { WatchlistTable } from '@/components/dashboard/WatchlistTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton, ListSkeleton } from '@/components/ui/skeleton';
import { useCrypto } from '@/hooks/useMarketData';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { formatCompact } from '@/lib/utils';

function CryptoPageInner() {
  const searchParams = useSearchParams();
  const focusSymbol = (searchParams.get('symbol') ?? 'BTCUSDT').toUpperCase();
  const { formatPrice, t } = usePreferences();

  const { data, isLoading, error } = useCrypto(undefined, focusSymbol);

  const tickers = data?.tickers ?? [];
  const orderbook = data?.orderbook;
  const focus =
    tickers.find((t) => t.symbol === focusSymbol) ??
    tickers.find((t) => t.symbol === 'BTCUSDT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crypto</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Kripto piyasası, derinlik ve grafikler
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tickers.slice(0, 4).map((t) => (
          <MetricCard
            key={t.symbol}
            title={t.symbol.replace('USDT', '')}
            value={t.price}
            changePercent={t.changePercent}
            currency="USD"
            subtitle={`Vol ${formatCompact(t.quoteVolume)}`}
          />
        ))}
      </div>

      {focus ? (
        <ChartPanel
          title={focus.symbol.replace('USDT', '')}
          symbol={focus.symbol}
          source="binance"
          isPositive={focus.changePercent >= 0}
          currencySymbol="$"
          defaultTimeframe="1D"
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-[var(--muted)]">
            {t.common.tickers}
          </h2>
          {error ? (
            <p className="text-sm text-red-400">{error.message}</p>
          ) : isLoading && !tickers.length ? (
            <ListSkeleton rows={5} />
          ) : (
            <WatchlistTable
              rows={tickers.map((t) => ({
                symbol: t.symbol,
                name: t.symbol.replace('USDT', '/USDT'),
                price: t.price,
                changePercent: t.changePercent,
                currency: 'USD',
              }))}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Order Book · {orderbook?.symbol ?? focusSymbol}
              {focus ? (
                <span className="ml-2 font-normal text-zinc-500">
                  {formatPrice(focus.price, 'USD')}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderbook ? (
              <OrderBookDepth orderbook={orderbook} />
            ) : isLoading ? (
              <ChartSkeleton />
            ) : (
              <p className="py-8 text-center text-sm text-[var(--muted)]">
                {t.common.noOrderBook}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CryptoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <CryptoPageInner />
    </Suspense>
  );
}
