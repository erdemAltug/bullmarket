export type ScannerCategory = 'BIST' | 'CRYPTO' | 'US';

export interface ScannerItem {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  volumeRaw: number;
  category: ScannerCategory;
  market: string;
  currency: 'TRY' | 'USD';
  sparkline: number[];
  chartSymbol: string;
  chartSource: 'yahoo' | 'binance';
  /** Session / 24h high — live from Yahoo or Binance */
  dayHigh?: number | null;
  /** Session / 24h low — live from Yahoo or Binance */
  dayLow?: number | null;
  trailingPE?: number | null;
}
