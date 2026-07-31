'use client';

import useSWR from 'swr';
import type { ScannerItem } from '@/types/scanner';

type MarketPayload = {
  success: boolean;
  error?: string;
  data?: { items: ScannerItem[] };
  markets?: ScannerItem[];
  updatedAt?: string;
  cached?: boolean;
};

async function marketFetcher(url: string): Promise<{
  items: ScannerItem[];
  updatedAt?: string;
}> {
  const res = await fetch(url);
  const json = (await res.json()) as MarketPayload;
  if (!json.success) {
    throw new Error(json.error || 'Market fetch failed');
  }
  const items = json.data?.items ?? json.markets ?? [];
  return { items, updatedAt: json.updatedAt };
}

/** Live market universe — polls `/api/market` every 15s via SWR. */
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
    updatedAt: data?.updatedAt,
    error,
    isLoading,
    isValidating,
  };
}
