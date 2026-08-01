export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://bullsye.app';

export const BRAND = 'Bullsye';

/** High-search BİST universe for sitemap + static params */
export const SEO_BIST_TICKERS = [
  'XU100',
  'THYAO',
  'GARAN',
  'ASELS',
  'EREGL',
  'AKBNK',
  'YKBNK',
  'ISCTR',
  'HALKB',
  'VAKBN',
  'SAHOL',
  'KCHOL',
  'BIMAS',
  'MGROS',
  'SISE',
  'TUPRS',
  'TCELL',
  'TTKOM',
  'PGSUS',
  'TAVHL',
  'FROTO',
  'TOASO',
  'DOAS',
  'PETKM',
  'SASA',
  'HEKTS',
  'ASTOR',
  'KONTR',
  'KOZAL',
  'KOZAA',
  'ENKAI',
  'ULKER',
  'ARCLK',
  'EKGYO',
  'EUPWR',
  'ODAS',
  'GESAN',
  'CWENE',
  'ALARK',
  'AEFES',
  'CCOLA',
  'OTKAR',
  'TKFEN',
  'TTRAK',
  'VESBE',
] as const;

export const SEO_CRYPTO_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'NEARUSDT',
  'UNIUSDT',
  'LTCUSDT',
  'ATOMUSDT',
] as const;

/** High-liquidity US / NASDAQ universe for sitemap + /us/[symbol] */
export const SEO_US_TICKERS = [
  'AAPL',
  'MSFT',
  'NVDA',
  'GOOGL',
  'AMZN',
  'META',
  'TSLA',
  'AVGO',
  'AMD',
  'NFLX',
  'ORCL',
  'CRM',
  'ADBE',
  'INTC',
  'QCOM',
  'PLTR',
  'COIN',
  'UBER',
  'JPM',
  'V',
  'MA',
  'BAC',
  'WMT',
  'COST',
  'DIS',
  'KO',
  'PEP',
  'XOM',
  'CVX',
  'BA',
  'UNH',
  'LLY',
  'JNJ',
  'BRK-B',
  'HD',
  'MCD',
] as const;

export const SEO_ETF_TICKERS = [
  'VOO',
  'QQQ',
  'SPY',
  'SCHD',
  'ARKK',
  'VTI',
  'IWM',
  'GLD',
] as const;

export const SEO_TEFAS_CODES = [
  'AFT',
  'YAY',
  'TTE',
  'TI2',
  'MAC',
  'IIH',
  'OJK',
  'GUM',
] as const;

export const SEO_FX_PAIRS = [
  'USD-TRY',
  'EUR-TRY',
  'GBP-TRY',
  'XAU-TRY',
] as const;

/** /bist/THYAO → THYAO.IS */
export function toYahooSymbol(routeSymbol: string): string {
  const s = routeSymbol.trim().toUpperCase().replace(/\.IS$/i, '');
  return `${s}.IS`;
}

/** Canonical path segment always UPPERCASE */
export function canonicalSymbol(raw: string): string {
  return raw.trim().toUpperCase().replace(/\.IS$/i, '');
}

export function fxPairParts(pair: string): { base: string; quote: string } {
  const [base, quote = 'TRY'] = pair.toUpperCase().replace('_', '-').split('-');
  return { base, quote };
}

export function formatMetaPrice(
  price: number,
  currency: 'TRY' | 'USD' = 'TRY'
): string {
  return price.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: price >= 1000 ? 2 : 4,
  });
}

export function formatMetaChange(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(2)}%`;
}
