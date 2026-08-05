import {
  SCANNER_BIST_UNIQUE,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_ETF_SYMBOLS,
  SCANNER_TEFAS_CODES,
  SCANNER_US_UNIQUE,
} from '@/lib/scanner-universe';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://bullsye.app';

export const BRAND = 'Bullsye';

/** Scanner ile tek kaynak: sitemap, static params ve dahili linkler aynı evren. */
export const SEO_BIST_TICKERS: readonly string[] = SCANNER_BIST_UNIQUE.map(
  (symbol) => symbol.replace(/\.IS$/i, '')
);

export const SEO_CRYPTO_SYMBOLS: readonly string[] = [
  ...new Set(SCANNER_CRYPTO_SYMBOLS),
];

/** Delist / dead tickers — SEO + soft-404 allowlist dışı. */
const SEO_US_EXCLUDED = new Set(['ATVI', 'WOLF']);
export const SEO_US_TICKERS: readonly string[] = SCANNER_US_UNIQUE.filter(
  (symbol) => !SEO_US_EXCLUDED.has(symbol)
);

export const SEO_ETF_TICKERS: readonly string[] = [...SCANNER_ETF_SYMBOLS];
export const SEO_TEFAS_CODES: readonly string[] = [...SCANNER_TEFAS_CODES];

export const SEO_FX_PAIRS = [
  'USD-TRY',
  'EUR-TRY',
  'GBP-TRY',
  'XAU-TRY',
] as const;

const BIST_SET = new Set(SEO_BIST_TICKERS);
const US_SET = new Set(SEO_US_TICKERS);
const CRYPTO_SET = new Set(SEO_CRYPTO_SYMBOLS);

export function isIndexedBistSymbol(symbol: string): boolean {
  return BIST_SET.has(canonicalSymbol(symbol));
}

export function isIndexedUsSymbol(symbol: string): boolean {
  return US_SET.has(symbol.trim().toUpperCase());
}

export function isIndexedCryptoSymbol(symbol: string): boolean {
  let s = symbol.trim().toUpperCase();
  if (!s.endsWith('USDT') && !s.endsWith('USD')) s = `${s}USDT`;
  return CRYPTO_SET.has(s);
}

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
