'use client';

import { Suspense, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { DynamicTitle } from '@/components/shared/DynamicTitle';
import { useBist, useCrypto } from '@/hooks/useMarketData';

function TabTitleInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const focusParam = searchParams.get('symbol');

  const isCrypto = pathname === '/crypto' || pathname.startsWith('/crypto/');
  const isBist =
    pathname === '/bist' ||
    (pathname.startsWith('/bist/') && !pathname.includes('heatmap'));
  // Overview already has market queries — avoid a second BIST poll just for the tab title
  const live = isBist || isCrypto;

  const bist = useBist(undefined, { enabled: live && !isCrypto });
  const crypto = useCrypto(undefined, undefined, {
    enabled: live && isCrypto,
  });

  const payload = useMemo(() => {
    if (!live) return null;

    if (isCrypto) {
      const fromPath = pathname.split('/')[2];
      const symbol = (focusParam ?? fromPath ?? 'BTCUSDT').toUpperCase();
      const tickers = crypto.data?.tickers ?? [];
      const focus =
        tickers.find((t) => t.symbol === symbol) ??
        tickers.find((t) => t.symbol === 'BTCUSDT');
      if (!focus) return null;
      return {
        symbol: focus.symbol.replace('USDT', ''),
        price: focus.price,
        changePercent: focus.changePercent,
        currencySymbol: '$' as const,
      };
    }

    const quotes = bist.data?.quotes ?? [];
    const fromPath = pathname.split('/')[2];
    const symbol = focusParam ?? (fromPath ? `${fromPath}.IS` : 'XU100.IS');
    const focus =
      quotes.find((q) => q.symbol === symbol.toUpperCase()) ??
      quotes.find((q) => q.symbol.includes('XU100'));
    if (!focus) return null;
    return {
      symbol: focus.symbol.replace('.IS', ''),
      price: focus.price,
      changePercent: focus.changePercent,
      currencySymbol: (focus.currency === 'USD' ? '$' : '₺') as '₺' | '$',
    };
  }, [
    live,
    isCrypto,
    pathname,
    focusParam,
    bist.data?.quotes,
    crypto.data?.tickers,
  ]);

  return (
    <DynamicTitle
      enabled={live}
      symbol={payload?.symbol}
      price={payload?.price}
      changePercent={payload?.changePercent}
      currencySymbol={payload?.currencySymbol}
    />
  );
}

export function TabTitleEngine() {
  return (
    <Suspense fallback={null}>
      <TabTitleInner />
    </Suspense>
  );
}
