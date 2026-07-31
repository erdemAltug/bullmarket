'use client';

import { useQuery } from '@tanstack/react-query';
import type { ChartTimeframe } from '@/lib/chart-timeframes';
import type {
  ApiResponse,
  CryptoTicker,
  FxRate,
  HistoricalPricePoint,
  OrderBook,
  Quote,
} from '@/types';

const QUOTE_REFETCH = 15_000;
const QUOTE_STALE = 12_000;

type QueryOpts = { enabled?: boolean };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/** Live quotes only — polls every 15s. Chart history is separate. */
export function useBist(symbols?: string, opts?: QueryOpts) {
  const qs = symbols ? `?symbols=${encodeURIComponent(symbols)}` : '';

  return useQuery({
    queryKey: ['bist', symbols ?? 'default'],
    queryFn: () => getJson<{ quotes: Quote[] }>(`/api/bist${qs}`),
    enabled: opts?.enabled ?? true,
    staleTime: QUOTE_STALE,
    refetchInterval: opts?.enabled === false ? false : QUOTE_REFETCH,
  });
}

export function useCrypto(
  symbols?: string,
  orderbook?: string,
  opts?: QueryOpts
) {
  const params = new URLSearchParams();
  if (symbols) params.set('symbols', symbols);
  if (orderbook) params.set('orderbook', orderbook);
  const qs = params.toString();

  return useQuery({
    queryKey: ['crypto', symbols ?? 'default', orderbook ?? null],
    queryFn: () =>
      getJson<{ tickers: CryptoTicker[]; orderbook?: OrderBook }>(
        `/api/crypto${qs ? `?${qs}` : ''}`
      ),
    enabled: opts?.enabled ?? true,
    staleTime: QUOTE_STALE,
    refetchInterval: opts?.enabled === false ? false : QUOTE_REFETCH,
  });
}

export function useFx(codes?: string, opts?: QueryOpts) {
  const qs = codes ? `?codes=${encodeURIComponent(codes)}` : '';

  return useQuery({
    queryKey: ['fx', codes ?? 'default'],
    queryFn: () =>
      getJson<{ rates: FxRate[]; updatedAt: string }>(`/api/fx${qs}`),
    enabled: opts?.enabled ?? true,
    staleTime: QUOTE_STALE,
    refetchInterval: opts?.enabled === false ? false : QUOTE_REFETCH,
  });
}

/** Chart series — refetches only on symbol/timeframe change. */
export function useChartHistory(
  symbol: string | undefined,
  timeframe: ChartTimeframe,
  source: 'yahoo' | 'binance' = 'yahoo'
) {
  return useQuery({
    queryKey: ['history', source, symbol, timeframe],
    enabled: Boolean(symbol),
    queryFn: () =>
      getJson<{
        symbol: string;
        timeframe: ChartTimeframe;
        points: HistoricalPricePoint[];
      }>(
        `/api/history?symbol=${encodeURIComponent(symbol!)}&timeframe=${timeframe}&source=${source}`
      ),
    staleTime: timeframe === '1D' || timeframe === '5D' ? 60_000 : 180_000,
    refetchInterval: false,
  });
}
