'use client';

import { useQuery } from '@tanstack/react-query';
import assets from '@/data/market-assets.json';
import type { MarketAsset } from '@/types/market-asset';

/** Static universe — loaded once, zero vendor cost per keystroke */
export function useMarketAssets(enabled = true) {
  return useQuery({
    queryKey: ['market-assets'],
    queryFn: async (): Promise<MarketAsset[]> => assets as MarketAsset[],
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
