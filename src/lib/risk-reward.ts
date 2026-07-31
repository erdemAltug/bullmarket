export function stopLevels(entry: number): { pct: number; price: number }[] {
  return [3, 5, 10].map((pct) => ({
    pct,
    price: entry * (1 - pct / 100),
  }));
}

export function takeProfitLevels(
  entry: number
): { pct: number; price: number }[] {
  return [10, 20, 30].map((pct) => ({
    pct,
    price: entry * (1 + pct / 100),
  }));
}

export function riskReward(
  entry: number,
  stopPct = 5,
  targetPct = 15
): number {
  if (stopPct <= 0) return 0;
  return targetPct / stopPct;
}
