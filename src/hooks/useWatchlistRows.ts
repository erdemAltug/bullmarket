'use client';

import { useMemo } from 'react';
import { useBist } from '@/hooks/useMarketData';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { ScannerItem } from '@/types/scanner';

export type WatchRow = {
  /** Key as stored in the watchlist (THYAO.IS, BTCUSDT, AAPL). */
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  currency: 'TRY' | 'USD';
  href: string;
};

export function watchHref(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s.endsWith('.IS')) return `/bist/${s.replace(/\.IS$/, '')}`;
  if (s.endsWith('USDT')) return `/kripto/${s}`;
  return `/nasdaq/${s}`;
}

function categoryHref(category: string, symbol: string, display: string): string {
  if (category === 'BIST') return `/bist/${display}`;
  if (category === 'CRYPTO') return `/kripto/${symbol}`;
  if (category === 'FON' || category === 'ETF') return `/fon/${display}`;
  if (category === 'US') return `/nasdaq/${display}`;
  return watchHref(symbol);
}

export function watchDisplay(symbol: string): string {
  return symbol.toUpperCase().replace(/\.IS$/, '').replace(/USDT$/, '');
}

/**
 * Live rows for every watchlist entry. Scanner covers BIST/US/crypto/funds;
 * BIST names outside the scanner universe fall back to a direct quote.
 */
export function useWatchlistRows() {
  const watch = useWatchlist();
  const scanner = useMarketScanner();
  const items = scanner.data;

  const byKey = useMemo(() => {
    const map = new Map<string, ScannerItem>();
    for (const it of items ?? []) {
      map.set(it.symbol.toUpperCase(), it);
      map.set(it.displaySymbol.toUpperCase(), it);
    }
    return map;
  }, [items]);

  const missingBist = useMemo(
    () =>
      watch.symbols
        .map((s) => s.toUpperCase())
        .filter((s) => {
          if (byKey.has(s) || s.endsWith('USDT')) return false;
          // Bare tickers from older builds are BIST by convention.
          const k = s.includes('.') ? s : `${s}.IS`;
          return k.endsWith('.IS') && !byKey.has(k);
        })
        .map((s) => (s.endsWith('.IS') ? s : `${s}.IS`))
        .join(','),
    [watch.symbols, byKey]
  );
  const bist = useBist(missingBist || undefined, {
    enabled: Boolean(missingBist) && Boolean(scanner.data),
  });

  const rows = useMemo<WatchRow[]>(() => {
    const quotes = new Map(
      (bist.data?.quotes ?? []).map((q) => [q.symbol.toUpperCase(), q])
    );
    const seen = new Set<string>();
    const out: WatchRow[] = [];
    for (const raw of watch.symbols) {
      const s = raw.toUpperCase();
      const scanned = byKey.get(s) ?? byKey.get(`${s}.IS`);
      const bistKey = `${s.replace(/\.IS$/, '')}.IS`;
      const q = scanned ? undefined : quotes.get(bistKey);
      const key = scanned?.symbol.toUpperCase() ?? s;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        symbol: raw,
        displaySymbol: scanned?.displaySymbol ?? watchDisplay(s),
        name: scanned?.name ?? q?.name ?? '',
        price: scanned?.price ?? q?.price ?? null,
        changePercent: scanned?.changePercent ?? q?.changePercent ?? null,
        currency: scanned?.currency ?? (s.endsWith('USDT') ? 'USD' : 'TRY'),
        href: scanned
          ? categoryHref(scanned.category, scanned.symbol, scanned.displaySymbol)
          : watchHref(q || s.endsWith('.IS') ? bistKey : s),
      });
    }
    return out;
  }, [watch.symbols, byKey, bist.data?.quotes]);

  return {
    rows,
    ready: watch.ready,
    loading: scanner.isLoading,
    addSymbol: watch.addSymbol,
    removeSymbol: watch.removeSymbol,
    hasSymbol: watch.hasSymbol,
  };
}
