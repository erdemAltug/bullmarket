export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://bullsye.app';

export const BRAND = 'Bullsye';

export const SEO_BIST_TICKERS = [
  'XU100',
  'THYAO',
  'GARAN',
  'ASELS',
  'EREGL',
  'AKBNK',
  'YKBNK',
  'ISCTR',
  'SAHOL',
  'KCHOL',
  'BIMAS',
  'SISE',
  'TUPRS',
  'TCELL',
  'PGSUS',
  'FROTO',
  'TOASO',
  'PETKM',
  'SASA',
  'HEKTS',
  'ASTOR',
  'KOZAL',
  'ENKAI',
  'ULKER',
  'ARCLK',
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
