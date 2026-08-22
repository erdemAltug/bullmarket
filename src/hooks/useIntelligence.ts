'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  ApiResponse,
  CompareMetrics,
  EconomicEvent,
  NewsItem,
  RatePoint,
  SmartRadarCard,
  StockFundamentals,
  TradeSignal,
} from '@/types';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useFundamentals(symbol: string | undefined) {
  return useQuery({
    queryKey: ['fundamentals', symbol],
    enabled: Boolean(symbol),
    queryFn: () =>
      getJson<StockFundamentals>(
        `/api/fundamentals?symbol=${encodeURIComponent(symbol!)}`
      ),
    staleTime: 300_000,
  });
}

export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: () => getJson<{ items: NewsItem[] }>('/api/news'),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useSignals(symbols: string[]) {
  const key = symbols.slice(0, 8).join(',');
  return useQuery({
    queryKey: ['signals', key],
    enabled: symbols.length > 0,
    queryFn: () =>
      getJson<{ signals: TradeSignal[] }>(
        `/api/signals?symbols=${encodeURIComponent(key)}`
      ),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useSmartRadar(symbols?: string[]) {
  const key = symbols?.slice(0, 10).join(',') ?? 'default';
  return useQuery({
    queryKey: ['smart-radar', key],
    queryFn: () =>
      getJson<{ cards: SmartRadarCard[] }>(
        `/api/smart-radar${symbols?.length ? `?symbols=${encodeURIComponent(key)}` : ''}`
      ),
    refetchInterval: 180_000,
    staleTime: 120_000,
  });
}

export function useCompare(symbols: string[]) {
  const key = symbols.join(',');
  return useQuery({
    queryKey: ['compare', key],
    enabled: symbols.length >= 2,
    queryFn: () =>
      getJson<{ items: CompareMetrics[] }>(
        `/api/compare?symbols=${encodeURIComponent(key)}`
      ),
    staleTime: 300_000,
  });
}

export function useCalendar() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: () =>
      getJson<{ events: EconomicEvent[]; generatedAt: string }>('/api/calendar'),
    staleTime: 600_000,
  });
}

export function useRatesDesk() {
  return useQuery({
    queryKey: ['rates-desk'],
    queryFn: () =>
      getJson<{ points: RatePoint[]; news: NewsItem[] }>('/api/rates'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
