'use client';

import { useQuery } from '@tanstack/react-query';
import { PLAN_LIMITS, type PlanId, type PlanLimits } from '@/lib/pro-plan';

type PlanState = { plan: PlanId; limits: PlanLimits };
const FREE: PlanState = { plan: 'free', limits: PLAN_LIMITS.free };

/** Current user's plan (free until the server says otherwise). */
export function usePlan() {
  const { data } = useQuery({
    queryKey: ['me-plan'],
    queryFn: async (): Promise<PlanState> => {
      const res = await fetch('/api/me/plan');
      if (!res.ok) return FREE;
      const json = (await res.json()) as { data?: PlanState };
      return json.data ?? FREE;
    },
    staleTime: 5 * 60_000,
  });
  const state = data ?? FREE;
  return { ...state, isPaid: state.plan !== 'free' };
}
