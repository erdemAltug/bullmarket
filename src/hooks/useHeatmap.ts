'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, Quote } from '@/types';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useHeatmap() {
  return useQuery({
    queryKey: ['heatmap'],
    queryFn: () => getJson<{ quotes: Quote[] }>('/api/heatmap'),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}
