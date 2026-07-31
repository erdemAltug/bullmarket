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
}
