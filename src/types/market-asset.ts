export type MarketAssetCategory =
  | 'bist'
  | 'us'
  | 'crypto'
  | 'etf'
  | 'fon';

export interface MarketAsset {
  /** Display ticker: THYAO, AAPL, BTC */
  symbol: string;
  name: string;
  exchange: string;
  category: MarketAssetCategory;
  /** Optional logo URL; null = use category badge */
  logo: string | null;
  /** Yahoo / Binance id used by quote API */
  quoteId: string;
  href: string;
}

export interface MarketAssetQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  market: MarketAssetCategory;
  cached: boolean;
  updatedAt: string;
}
