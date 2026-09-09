import type { HealthRadarAxis } from '@/lib/analysis/types';
import type { StockFundamentals } from '@/types';

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function buildHealthRadar(input: {
  fundamentals: StockFundamentals;
  peDiscountPct: number | null;
  rsi: number | null;
  sma50: number | null;
  sma200: number | null;
}): HealthRadarAxis[] {
  const f = input.fundamentals;
  const roe = f.returnOnEquity != null ? f.returnOnEquity * 100 : null;
  const profit =
    roe == null ? 50 : roe >= 20 ? 90 : roe >= 12 ? 75 : roe >= 5 ? 55 : 30;

  const beta = f.beta;
  const pb = f.priceToBook;
  let leverage = 55;
  if (pb != null) {
    if (pb < 1.2) leverage = 80;
    else if (pb < 2.5) leverage = 60;
    else leverage = 40;
  }
  if (beta != null) {
    if (beta > 1.4) leverage = Math.max(20, leverage - 15);
    if (beta < 0.9) leverage = Math.min(95, leverage + 10);
  }

  const g = f.earningsGrowth != null ? f.earningsGrowth * 100 : null;
  const growth =
    g == null ? 50 : g >= 25 ? 90 : g >= 10 ? 72 : g >= 0 ? 55 : 30;

  let valuation = 50;
  if (input.peDiscountPct != null) {
    if (input.peDiscountPct >= 20) valuation = 88;
    else if (input.peDiscountPct >= 5) valuation = 70;
    else if (input.peDiscountPct <= -20) valuation = 28;
    else valuation = 48;
  } else if (f.trailingPE != null) {
    valuation =
      f.trailingPE < 10 ? 85 : f.trailingPE < 18 ? 65 : f.trailingPE < 30 ? 45 : 28;
  }

  let momentum = 50;
  if (input.sma50 != null && input.sma200 != null && input.sma200 > 0) {
    momentum = input.sma50 >= input.sma200 ? 72 : 38;
  }
  if (input.rsi != null) {
    if (input.rsi <= 30) momentum = Math.min(95, momentum + 15);
    else if (input.rsi >= 70) momentum = Math.max(15, momentum - 10);
  }

  return [
    { key: 'profit', label: 'Kârlılık', score: clamp(profit) },
    { key: 'leverage', label: 'Borç / Likidite*', score: clamp(leverage) },
    { key: 'growth', label: 'Büyüme', score: clamp(growth) },
    { key: 'valuation', label: 'Değerleme', score: clamp(valuation) },
    { key: 'momentum', label: 'Momentum', score: clamp(momentum) },
  ];
}
