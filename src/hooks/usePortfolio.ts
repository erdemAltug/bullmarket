'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPortfolioPosition,
  getUserPortfolio,
  removePortfolioPosition,
} from '@/actions/portfolio';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AssetClass, PortfolioPosition } from '@/types';
import { authClient } from '@/lib/auth/client';

const LS_KEY = 'bullmarket:portfolio';

export function usePortfolio(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? 'anon';
  const [lsPositions, setLsPositions, lsReady] = useLocalStorage<
    PortfolioPosition[]
  >(LS_KEY, []);
  const [preferDb, setPreferDb] = useState(false);

  const query = useQuery({
    queryKey: ['portfolio', userId],
    queryFn: () => getUserPortfolio(),
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: false,
  });

  useEffect(() => {
    if (query.data?.db) setPreferDb(true);
  }, [query.data?.db]);

  const useDb = preferDb && query.data?.db;
  const positions = useDb ? (query.data?.positions ?? []) : lsPositions;
  const ready = useDb ? !query.isLoading : lsReady;

  const addPosition = useCallback(
    (input: Omit<PortfolioPosition, 'id'>) => {
      const pos: PortfolioPosition = { ...input, id: crypto.randomUUID() };
      if (!useDb) setLsPositions((prev) => [...prev, pos]);
      void addPortfolioPosition(input).then((data) => {
        if (data.db) {
          setPreferDb(true);
          qc.setQueryData(['portfolio'], data);
        }
      });
      return pos;
    },
    [useDb, setLsPositions, qc]
  );

  const removePosition = useCallback(
    (id: string) => {
      if (!useDb) setLsPositions((prev) => prev.filter((p) => p.id !== id));
      void removePortfolioPosition(id).then((data) => {
        if (data.db) qc.setQueryData(['portfolio'], data);
      });
    },
    [useDb, setLsPositions, qc]
  );

  const byClass = useMemo(() => {
    const map: Record<AssetClass, PortfolioPosition[]> = {
      bist: [],
      crypto: [],
      gold: [],
    };
    for (const p of positions) map[p.assetClass].push(p);
    return map;
  }, [positions]);

  return {
    positions,
    addPosition,
    removePosition,
    byClass,
    ready,
    source: useDb ? ('neon' as const) : ('local' as const),
  };
}

export function livePriceTry(
  position: PortfolioPosition,
  priceMap: Record<string, number>,
  usdTry: number
): number {
  const px = priceMap[position.symbol] ?? position.buyPrice;
  const raw = px * position.quantity;
  if (position.currency === 'USD' || position.assetClass === 'crypto') {
    return raw * (usdTry || 1);
  }
  return raw;
}

export function costBasisTry(
  position: PortfolioPosition,
  usdTry: number
): number {
  const raw = position.buyPrice * position.quantity;
  if (position.currency === 'USD' || position.assetClass === 'crypto') {
    return raw * (usdTry || 1);
  }
  return raw;
}
