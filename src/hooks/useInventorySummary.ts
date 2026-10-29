'use client';

import { useMemo } from 'react';
import { useBist, useCrypto, useFx } from '@/hooks/useMarketData';
import {
  costBasisTry,
  livePriceTry,
  usePortfolio,
} from '@/hooks/usePortfolio';

export type InventorySummary = {
  ready: boolean;
  count: number;
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
  daily: number;
  dailyPct: number;
};

/**
 * Live net worth of the user's inventory (TRY). Market queries only run
 * when there is something to price, so an empty inventory costs nothing.
 */
export function useInventorySummary(): InventorySummary {
  const { positions, ready } = usePortfolio();
  const enabled = positions.length > 0;
  const bist = useBist(undefined, { enabled });
  const crypto = useCrypto(undefined, undefined, { enabled });
  const fx = useFx(undefined, { enabled });

  return useMemo(() => {
    const rates = fx.data?.rates ?? [];
    const usdTry = rates.find((r) => r.code === 'USD')?.forexSelling ?? 0;
    const goldTry = rates.find((r) => r.code === 'GOLD')?.forexSelling ?? 0;
    const prices: Record<string, number> = {};
    const changes: Record<string, number> = {};
    for (const q of bist.data?.quotes ?? []) {
      prices[q.symbol] = q.price;
      changes[q.symbol] = q.changePercent;
    }
    for (const t of crypto.data?.tickers ?? []) {
      prices[t.symbol] = t.price;
      changes[t.symbol] = t.changePercent;
    }
    if (goldTry) prices.GOLD = goldTry;

    let value = 0;
    let cost = 0;
    let daily = 0;
    for (const p of positions) {
      const live = livePriceTry(p, prices, usdTry);
      value += live;
      cost += costBasisTry(p, usdTry);
      daily += live * ((changes[p.symbol] ?? 0) / 100);
    }
    const pnl = value - cost;
    return {
      ready,
      count: positions.length,
      value,
      cost,
      pnl,
      pnlPct: cost ? (pnl / cost) * 100 : 0,
      daily,
      dailyPct: value ? (daily / value) * 100 : 0,
    };
  }, [positions, ready, bist.data?.quotes, crypto.data?.tickers, fx.data?.rates]);
}
