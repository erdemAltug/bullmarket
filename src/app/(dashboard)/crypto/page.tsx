'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MarketScannerTable } from '@/components/dashboard/MarketScannerTable';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { OrderBookDepth } from '@/components/dashboard/OrderBookDepth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from '@/components/ui/skeleton';
import { useCrypto } from '@/hooks/useMarketData';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { usePreferences } from '@/components/providers/PreferencesProvider';

function CryptoPageInner() {
  const searchParams = useSearchParams();
  const focusSymbol = (searchParams.get('symbol') ?? 'BTCUSDT').toUpperCase();
  const { formatPrice, t } = usePreferences();
  const { data, isLoading, error } = useCrypto(undefined, focusSymbol);
  const scanner = useMarketScanner();

  const tickers = data?.tickers ?? [];
  const orderbook = data?.orderbook;
  const focus =
    tickers.find((t) => t.symbol === focusSymbol) ??
    tickers.find((t) => t.symbol === 'BTCUSDT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Crypto</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kripto screener, derinlik ve grafikler
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarketScannerTable
            items={scanner.data ?? []}
            isLoading={scanner.isLoading}
            error={error?.message ?? scanner.error?.message}
            defaultFilter="CRYPTO"
            title="Crypto Market Screener"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              Order Book · {orderbook?.symbol ?? focusSymbol}
              {focus ? (
                <span className="ml-2 font-normal text-[var(--muted)]">
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
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
      <CryptoPageInner />
    </Suspense>
  );
}
