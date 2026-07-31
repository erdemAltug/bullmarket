import { fetchFundamentals, BIST30_SYMBOLS } from '@/lib/api/yahoo';
import { SCANNER_US_SYMBOLS } from '@/lib/scanner-universe';
import type { StockFundamentals } from '@/types';

export type LiveTargetCategory = 'BIST' | 'US';

export interface LiveAnalystTarget {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: LiveTargetCategory;
  price: number;
  currency: 'TRY' | 'USD';
  targetMean: number | null;
  targetHigh: number | null;
  targetLow: number | null;
  upsidePotential: number | null;
  fundamentalScore: number;
  recommendationKey: string | null;
  consensusRating: 'GÜÇLÜ AL' | 'AL' | 'TUT' | 'SAT' | 'N/A';
  ratings: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
  analystCount: number;
}

function mapRecKey(
  key: string | null,
  ratings: LiveAnalystTarget['ratings']
): LiveAnalystTarget['consensusRating'] {
  const k = (key ?? '').toLowerCase();
  if (k.includes('strong_buy') || k === 'strongbuy') return 'GÜÇLÜ AL';
  if (k.includes('buy') || k === 'outperform') return 'AL';
  if (k.includes('hold') || k === 'neutral') return 'TUT';
  if (k.includes('sell') || k.includes('under')) return 'SAT';

  const score =
    ratings.strongBuy * 2 +
    ratings.buy -
    ratings.sell -
    ratings.strongSell * 2;
  const n =
    ratings.strongBuy +
      ratings.buy +
      ratings.hold +
      ratings.sell +
      ratings.strongSell || 1;
  const avg = score / n;
  if (avg >= 1.2) return 'GÜÇLÜ AL';
  if (avg >= 0.4) return 'AL';
  if (avg >= -0.3) return 'TUT';
  if (
    ratings.strongBuy +
      ratings.buy +
      ratings.hold +
      ratings.sell +
      ratings.strongSell ===
    0
  )
    return 'N/A';
  return 'SAT';
}

function scoreFromFundamentals(f: StockFundamentals): number {
  let s = 5;
  if (f.trailingPE != null && f.trailingPE > 0 && f.trailingPE < 15) s += 1.2;
  else if (f.trailingPE != null && f.trailingPE > 30) s -= 0.8;
  if (f.returnOnEquity != null && f.returnOnEquity > 0.12) s += 1.2;
  if (f.earningsGrowth != null && f.earningsGrowth > 0.1) s += 1;
  if (f.dividendYield != null && f.dividendYield > 0.03) s += 0.6;
  if (f.beta != null && f.beta > 1.4) s -= 0.5;
  return Math.max(1, Math.min(10, Math.round(s * 10) / 10));
}

function toLiveTarget(
  f: StockFundamentals,
  category: LiveTargetCategory
): LiveAnalystTarget | null {
  const a = f.analyst;
  if (!a) return null;
  const hasTarget = a.targetMean != null || a.targetHigh != null;
  const hasVotes =
    a.strongBuy + a.buy + a.hold + a.sell + a.strongSell > 0;
  if (!hasTarget && !hasVotes) return null;

  const upside =
    a.targetMean != null && f.price > 0
      ? ((a.targetMean - f.price) / f.price) * 100
      : null;

  const ratings = {
    strongBuy: a.strongBuy,
    buy: a.buy,
    hold: a.hold,
    sell: a.sell,
    strongSell: a.strongSell,
  };

  return {
    symbol: f.symbol,
    displaySymbol: f.symbol.replace('.IS', ''),
    name: f.name,
    category,
    price: f.price,
    currency: f.currency === 'USD' ? 'USD' : 'TRY',
    targetMean: a.targetMean,
    targetHigh: a.targetHigh,
    targetLow: a.targetLow,
    upsidePotential: upside,
    fundamentalScore: scoreFromFundamentals(f),
    recommendationKey: a.recommendationKey,
    consensusRating: mapRecKey(a.recommendationKey, ratings),
    ratings,
    analystCount:
      a.strongBuy + a.buy + a.hold + a.sell + a.strongSell,
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const part = await Promise.all(chunk.map(fn));
    out.push(...part);
  }
  return out;
}

/** Live Yahoo analyst consensus for BİST 30 + major US names */
export async function fetchLiveAnalystTargets(): Promise<LiveAnalystTarget[]> {
  const bist = BIST30_SYMBOLS.filter((s) => !s.startsWith('XU'));
  const us = [...SCANNER_US_SYMBOLS];

  const bistRows = await mapPool(bist, 4, async (sym) => {
    try {
      const f = await fetchFundamentals(sym);
      return toLiveTarget(f, 'BIST');
    } catch {
      return null;
    }
  });

  const usRows = await mapPool(us, 4, async (sym) => {
    try {
      const f = await fetchFundamentals(sym);
      return toLiveTarget(f, 'US');
    } catch {
      return null;
    }
  });

  return [...bistRows, ...usRows].filter(
    (r): r is LiveAnalystTarget => r != null
  );
}
