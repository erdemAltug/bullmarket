'use client';

import { useQuery } from '@tanstack/react-query';
import type { ScannerItem } from '@/types/scanner';
import type { ApiResponse } from '@/types';

async function fetchScanner(): Promise<ScannerItem[]> {
  const res = await fetch('/api/scanner');
  const json = (await res.json()) as ApiResponse<{ items: ScannerItem[] }>;
  if (!json.success) throw new Error(json.error);
  return json.data.items;
}

export function useMarketScanner() {
  return useQuery({
    queryKey: ['market-scanner'],
    queryFn: fetchScanner,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
