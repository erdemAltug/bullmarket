import type { HistoricalPricePoint } from '@/types';

export function sma(
  points: HistoricalPricePoint[],
  period: number
): number | null {
  if (points.length < period) return null;
  const slice = points.slice(-period);
  const sum = slice.reduce((a, p) => a + p.price, 0);
  return sum / period;
}

export function rsi14(points: HistoricalPricePoint[]): number | null {
  if (points.length < 15) return null;
  const closes = points.map((p) => p.price);
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

export function fibLevels(points: HistoricalPricePoint[]) {
  if (points.length < 20) {
    return { fib382: null, fib500: null, fib618: null, high: null, low: null };
  }
  const window = points.slice(-120);
  let high = -Infinity;
  let low = Infinity;
  for (const p of window) {
    if (p.price > high) high = p.price;
    if (p.price < low) low = p.price;
  }
  const span = high - low;
  return {
    high,
    low,
    fib382: high - span * 0.382,
    fib500: high - span * 0.5,
    fib618: high - span * 0.618,
  };
}

export function buildTechSummary(input: {
  price: number;
  sma200: number | null;
  rsi14: number | null;
}): string {
  const { price, sma200, rsi14: rsi } = input;
  if (sma200 != null && sma200 > 0) {
    const dist = ((price - sma200) / sma200) * 100;
    if (dist <= -4) {
      return `Hisse 200 günlük ortalamanın %${Math.abs(dist).toFixed(1)} altında (aşırı satım bandına yakın).`;
    }
    if (dist >= 8) {
      return `Hisse 200 günlük ortalamanın %${dist.toFixed(1)} üstünde (uzama riski).`;
    }
    if (Math.abs(dist) < 2) {
      return 'Fiyat 200 günlük ortalamaya yapışık — denge / karar bölgesi.';
    }
  }
  if (rsi != null) {
    if (rsi <= 30) return `RSI ${rsi.toFixed(0)} — düşük momentum bandı.`;
    if (rsi >= 70) return `RSI ${rsi.toFixed(0)} — yüksek momentum bandı.`;
  }
  return 'Teknik seviyeler kural tabanlıdır; çizim tavsiyesi değildir.';
}
