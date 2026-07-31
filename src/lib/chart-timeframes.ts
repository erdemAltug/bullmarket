export type ChartTimeframe =
  | '1D'
  | '5D'
  | '1M'
  | '6M'
  | '1Y'
  | 'YTD'
  | 'ALL';

export const CHART_TIMEFRAMES: ChartTimeframe[] = [
  '1D',
  '5D',
  '1M',
  '6M',
  '1Y',
  'YTD',
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
}

export const TIMEFRAME_CONFIG: Record<ChartTimeframe, TimeframeConfig> = {
  '1D': { yahooInterval: '5m', binanceInterval: '5m', lookbackDays: 1 },
  '5D': { yahooInterval: '15m', binanceInterval: '15m', lookbackDays: 5 },
  '1M': { yahooInterval: '1d', binanceInterval: '1h', lookbackDays: 30 },
  '6M': { yahooInterval: '1d', binanceInterval: '1d', lookbackDays: 182 },
  '1Y': { yahooInterval: '1d', binanceInterval: '1d', lookbackDays: 365 },
  YTD: { yahooInterval: '1d', binanceInterval: '1d', lookbackDays: null, ytd: true },
  ALL: { yahooInterval: '1wk', binanceInterval: '1w', lookbackDays: null, all: true },
};

export function periodStartFor(tf: ChartTimeframe): Date {
  const cfg = TIMEFRAME_CONFIG[tf];
  const now = new Date();
  if (cfg.ytd) return new Date(now.getFullYear(), 0, 1);
  if (cfg.all) return new Date(2000, 0, 1);
  const d = new Date(now);
  d.setDate(d.getDate() - (cfg.lookbackDays ?? 30));
  return d;
}

export function isChartTimeframe(value: string): value is ChartTimeframe {
  return (CHART_TIMEFRAMES as string[]).includes(value);
}
