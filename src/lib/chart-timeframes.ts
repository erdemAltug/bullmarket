export type ChartTimeframe =
  | '1D'
  | '5D'
  | '1M'
  | '3M'
  | '6M'
  | 'YTD'
  | '1Y'
  | '5Y'
  | 'ALL';

export const CHART_TIMEFRAMES: ChartTimeframe[] = [
  '1D',
  '5D',
  '1M',
  '3M',
  '6M',
  'YTD',
  '1Y',
  '5Y',
  'ALL',
];

/** Yahoo Finance chart interval for each UI timeframe */
export type YahooInterval =
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '1d'
  | '1wk'
  | '1mo';

export type BinanceInterval =
  | '5m'
  | '15m'
  | '1h'
  | '4h'
  | '1d'
  | '1w'
  | '1M';

export interface TimeframeConfig {
  yahooInterval: YahooInterval;
  binanceInterval: BinanceInterval;
  /** Approximate lookback in days; null = max / YTD handled separately */
  lookbackDays: number | null;
  ytd?: boolean;
  all?: boolean;
  /** Fetch window for 1D; only the last session is kept. */
  intradayDays?: number;
}

export const TIMEFRAME_CONFIG: Record<ChartTimeframe, TimeframeConfig> = {
  // 1D looks back 4 days so a weekend / holiday still shows the last session.
  '1D': { yahooInterval: '5m', binanceInterval: '5m', lookbackDays: 1, intradayDays: 4 },
  '5D': { yahooInterval: '15m', binanceInterval: '15m', lookbackDays: 7 },
  '1M': { yahooInterval: '1h', binanceInterval: '1h', lookbackDays: 31 },
  '3M': { yahooInterval: '1d', binanceInterval: '4h', lookbackDays: 92 },
  '6M': { yahooInterval: '1d', binanceInterval: '1d', lookbackDays: 183 },
  YTD: { yahooInterval: '1d', binanceInterval: '1d', lookbackDays: null, ytd: true },
  '1Y': { yahooInterval: '1d', binanceInterval: '1d', lookbackDays: 366 },
  '5Y': { yahooInterval: '1wk', binanceInterval: '1w', lookbackDays: 1827 },
  ALL: { yahooInterval: '1mo', binanceInterval: '1M', lookbackDays: null, all: true },
};

export function periodStartFor(tf: ChartTimeframe): Date {
  const cfg = TIMEFRAME_CONFIG[tf];
  const now = new Date();
  if (cfg.ytd) return new Date(now.getFullYear(), 0, 1);
  if (cfg.all) return new Date(1990, 0, 1);
  const d = new Date(now);
  d.setDate(d.getDate() - (cfg.intradayDays ?? cfg.lookbackDays ?? 30));
  return d;
}

export function isChartTimeframe(value: string): value is ChartTimeframe {
  return (CHART_TIMEFRAMES as string[]).includes(value);
}

/** True for timeframes whose bars carry a time of day. */
export function isIntraday(tf: ChartTimeframe): boolean {
  return tf === '1D' || tf === '5D' || tf === '1M';
}

/**
 * 1D fetches a few days so weekends still show data; keep only the
 * most recent trading session (the last calendar day that has bars).
 */
export function lastSession<T extends { timestamp: number }>(
  points: T[],
  tf: ChartTimeframe
): T[] {
  if (tf !== '1D' || points.length === 0) return points;
  const lastDay = new Date(points[points.length - 1].timestamp).toDateString();
  return points.filter((p) => new Date(p.timestamp).toDateString() === lastDay);
}
