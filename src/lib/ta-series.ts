/**
 * Full-length indicator series for charts. Each output has the same length
 * as the input; positions without enough history are null.
 * Pure functions — safe on server and client.
 */

export type Series = (number | null)[];

export function smaSeries(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function emaSeries(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += values[i];
  prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function bollingerSeries(
  values: number[],
  period = 20,
  mult = 2
): { mid: Series; upper: Series; lower: Series } {
  const mid = smaSeries(values, period);
  const upper: Series = new Array(values.length).fill(null);
  const lower: Series = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const m = mid[i];
    if (m == null) continue;
    let sq = 0;
    for (let j = i - period + 1; j <= i; j++) sq += (values[j] - m) ** 2;
    const sd = Math.sqrt(sq / period);
    upper[i] = m + mult * sd;
    lower[i] = m - mult * sd;
  }
  return { mid, upper, lower };
}

/** Wilder RSI */
export function rsiSeries(values: number[], period = 14): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (period - 1) + (d > 0 ? d : 0)) / period;
    loss = (loss * (period - 1) + (d < 0 ? -d : 0)) / period;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function macdSeries(
  values: number[],
  fast = 12,
  slow = 26,
  signal = 9
): { macd: Series; signal: Series; hist: Series } {
  const ef = emaSeries(values, fast);
  const es = emaSeries(values, slow);
  const macd: Series = values.map((_, i) => {
    const a = ef[i];
    const b = es[i];
    return a == null || b == null ? null : a - b;
  });
  const start = macd.findIndex((v) => v != null);
  const sig: Series = new Array(values.length).fill(null);
  if (start >= 0) {
    const compact = macd.slice(start) as number[];
    const es2 = emaSeries(compact, signal);
    for (let i = 0; i < es2.length; i++) sig[start + i] = es2[i];
  }
  const hist: Series = macd.map((m, i) => {
    const s = sig[i];
    return m == null || s == null ? null : m - s;
  });
  return { macd, signal: sig, hist };
}

/** Session VWAP (resets each calendar day) for intraday bars. */
export function vwapSeries(
  bars: { timestamp: number; high: number; low: number; close: number; volume: number }[]
): Series {
  const out: Series = new Array(bars.length).fill(null);
  let day = '';
  let pv = 0;
  let vol = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const d = new Date(b.timestamp).toDateString();
    if (d !== day) {
      day = d;
      pv = 0;
      vol = 0;
    }
    const typical = (b.high + b.low + b.close) / 3;
    pv += typical * b.volume;
    vol += b.volume;
    out[i] = vol > 0 ? pv / vol : null;
  }
  return out;
}
