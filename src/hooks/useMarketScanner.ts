'use client';

import useSWR from 'swr';
import type { CommodityQuote } from '@/lib/api/commodities';
import type { ScannerItem } from '@/types/scanner';
import type { NewsItem } from '@/types';

type MarketPayload = {
  success: boolean;
  error?: string;
  data?: { items: ScannerItem[] };
  markets?: ScannerItem[];
  marketItems?: ScannerItem[];
  commodities?: CommodityQuote[];
  sentiment?: { value: number; status: string } | null;
  news?: NewsItem[];
  updatedAt?: string;
  cached?: boolean;
};

async function marketFetcher(url: string) {
  const res = await fetch(url);
  const json = (await res.json()) as MarketPayload;
  if (!json.success) {
    throw new Error(json.error || 'Market fetch failed');
  }
  const items =
    json.data?.items ?? json.marketItems ?? json.markets ?? [];
  return {
    items,
    commodities: json.commodities ?? [],
    sentiment: json.sentiment ?? null,
    news: json.news ?? [],
    updatedAt: json.updatedAt,
  };
}

/** Live market universe — polls `/api/market` every 10s via SWR. */
export function useMarketScanner() {
  const { data, error, isLoading, isValidating } = useSWR(
    '/api/market',
    marketFetcher,
    {
      refreshInterval: 10_000,
      revalidateOnFocus: true,
      dedupingInterval: 8_000,
      keepPreviousData: true,
    }
  );

  return {
    data: data?.items,
    commodities: data?.commodities,
    sentiment: data?.sentiment,
    news: data?.news,
    updatedAt: data?.updatedAt,
    error,
    isLoading,
    isValidating,
  };
}

export function useCommodities() {
  const { data, error, isLoading } = useSWR(
    '/api/commodities',
    async (url: string) => {
      const res = await fetch(url);
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { items: CommodityQuote[] };
      };
      if (!json.success) throw new Error(json.error || 'Commodities failed');
      return json.data?.items ?? [];
    },
    { refreshInterval: 60_000, keepPreviousData: true }
  );
  return { data: data ?? [], error, isLoading };
}
