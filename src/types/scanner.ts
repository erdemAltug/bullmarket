export type ScannerCategory = 'BIST' | 'CRYPTO' | 'US' | 'FON' | 'ETF';

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
  chartSource: 'yahoo' | 'binance' | 'tefas';
  /** Session / 24h high — live from Yahoo or Binance */
  dayHigh?: number | null;
  /** Session / 24h low — live from Yahoo or Binance */
  dayLow?: number | null;
  trailingPE?: number | null;
  /** TEFAS / ETF style tag e.g. Yabancı Teknoloji Hisse */
  fundStyle?: string | null;
  /** Portfolio AUM (TRY) when from TEFAS */
  portfolioSize?: number | null;
  investorCount?: number | null;
}
