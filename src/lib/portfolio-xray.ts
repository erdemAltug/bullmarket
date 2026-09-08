import type { PortfolioPosition } from '@/types';

export type XrayMetrics = {
  totalValue: number;
  equityPct: number;
  cashCushionPct: number;
  topSymbolSharePct: number;
  topSymbol?: string;
};

/** Portföy Röntgeni metrikleri — liveValues pozisyon id → TRY. */
export function computeXrayMetrics(
  positions: PortfolioPosition[],
  liveValues: Record<string, number>
): XrayMetrics {
  let total = 0;
  let equity = 0;
  let cushion = 0;
  const bySymbol = new Map<string, number>();

  for (const p of positions) {
    const v = liveValues[p.id] ?? 0;
    total += v;
    if (p.assetClass === 'cash' || p.assetClass === 'deposit') {
      cushion += v;
    } else {
      equity += v;
    }
    const key =
      p.assetClass === 'cash' || p.assetClass === 'deposit'
        ? p.name
        : p.symbol.replace(/\.IS$/i, '').replace(/USDT$/i, '');
    bySymbol.set(key, (bySymbol.get(key) ?? 0) + v);
  }

  let topSymbol: string | undefined;
  let topShare = 0;
  for (const [sym, v] of bySymbol) {
    const pct = total > 0 ? (v / total) * 100 : 0;
    if (pct > topShare) {
      topShare = pct;
      topSymbol = sym;
    }
  }

  return {
    totalValue: total,
    equityPct: total > 0 ? (equity / total) * 100 : 0,
    cashCushionPct: total > 0 ? (cushion / total) * 100 : 0,
    topSymbolSharePct: topShare,
    topSymbol,
  };
}
