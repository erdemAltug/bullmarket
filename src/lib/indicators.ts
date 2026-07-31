/** Pure technical helpers — no React / network */

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** Wilder RSI */
export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function smaCrossover(
  values: number[],
  period = 50
): 'up' | 'down' | null {
  if (values.length < period + 1) return null;
  const prev = values.slice(0, -1);
  const smaPrev = sma(prev, period);
  const smaNow = sma(values, period);
  if (smaPrev == null || smaNow == null) return null;

  const pricePrev = values[values.length - 2];
  const priceNow = values[values.length - 1];

  const wasBelow = pricePrev < smaPrev;
  const isAbove = priceNow >= smaNow;
  const wasAbove = pricePrev > smaPrev;
  const isBelow = priceNow <= smaNow;

  if (wasBelow && isAbove) return 'up';
  if (wasAbove && isBelow) return 'down';
  return null;
}

/** Price within pct of SMA and bouncing (prev below/at, now above). */
export function smaBounce(
  values: number[],
  period = 200,
  proximityPct = 1.5
): boolean {
  if (values.length < period + 1) return false;
  const ma = sma(values, period);
  if (ma == null || ma === 0) return false;
  const price = values[values.length - 1];
  const prev = values[values.length - 2];
  const dist = (Math.abs(price - ma) / ma) * 100;
  const touched = dist <= proximityPct || prev <= ma * 1.01;
  const reacting = price > prev && price >= ma * 0.995;
  return touched && reacting;
}

export function avgVolume(volumes: number[], period: number): number | null {
  if (volumes.length < period) return null;
  const slice = volumes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function nearLow(
  price: number,
  low52: number,
  withinPct = 5
): boolean {
  if (!low52 || low52 <= 0) return false;
  return ((price - low52) / low52) * 100 <= withinPct;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
