'use client';

import { useQuery } from '@tanstack/react-query';
import type { LiveAnalystTarget } from '@/lib/live-targets';

/** Analyst consensus targets (BIST + US), cached 10 minutes. */
export function useTargets() {
  return useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const res = await fetch('/api/targets');
      const json = (await res.json()) as { data?: { items?: LiveAnalystTarget[] } };
      return json.data?.items ?? [];
    },
    staleTime: 10 * 60_000,
  });
}
