import {
  SCANNER_BIST_UNIQUE,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_ETF_SYMBOLS,
  SCANNER_TEFAS_CODES,
  SCANNER_US_UNIQUE,
} from '@/lib/scanner-universe';

export type AlertAssetGroup =
  | 'Emtia'
  | 'Döviz'
  | 'BİST'
  | 'Kripto'
  | 'ABD'
  | 'Fon'
  | 'ETF';

export interface AlertAssetOption {
  symbol: string;
  display: string;
  group: AlertAssetGroup;
  keywords: string;
  /** RSI alarms only make sense for equity/crypto with /api/rsi support */
  supportsRsi: boolean;
}

const COMMODITY_ASSETS: AlertAssetOption[] = [
  {
    symbol: 'ALTIN',
    display: 'Gram Altın',
    group: 'Emtia',
    keywords: 'altın gold gram xau',
    supportsRsi: false,
  },
  {
    symbol: 'XAU',
    display: 'Ons Altın',
    group: 'Emtia',
    keywords: 'ons altın gold ounce xau',
    supportsRsi: false,
  },
  {
    symbol: 'GUMUS_GR',
    display: 'Gram Gümüş',
    group: 'Emtia',
    keywords: 'gümüş silver gram',
    supportsRsi: false,
  },
  {
    symbol: 'GUMUS',
    display: 'Gümüş (Ons)',
    group: 'Emtia',
    keywords: 'gümüş silver ons',
    supportsRsi: false,
  },
  {
    symbol: 'BRENT',
    display: 'Brent Petrol',
    group: 'Emtia',
    keywords: 'brent petrol oil',
    supportsRsi: false,
  },
  {
    symbol: 'WTI',
    display: 'WTI Petrol',
    group: 'Emtia',
    keywords: 'wti petrol crude',
    supportsRsi: false,
  },
];

const FX_ASSETS: AlertAssetOption[] = [
  {
    symbol: 'USDTRY',
    display: 'USD/TRY',
    group: 'Döviz',
    keywords: 'dolar usd try döviz',
    supportsRsi: false,
  },
  {
    symbol: 'EUR',
    display: 'EUR/TRY',
    group: 'Döviz',
    keywords: 'euro eur try döviz',
    supportsRsi: false,
  },
  {
    symbol: 'GBP',
    display: 'GBP/TRY',
    group: 'Döviz',
    keywords: 'sterlin gbp pound döviz',
    supportsRsi: false,
  },
];

function bistDisplay(sym: string): string {
  return sym.replace(/\.IS$/i, '');
}

function buildUniverse(): AlertAssetOption[] {
  const bist = SCANNER_BIST_UNIQUE.map((symbol) => ({
    symbol,
    display: bistDisplay(symbol),
    group: 'BİST' as const,
    keywords: `${bistDisplay(symbol)} bist hisse`.toLowerCase(),
    supportsRsi: true,
  }));

  const crypto = SCANNER_CRYPTO_SYMBOLS.map((symbol) => ({
    symbol,
    display: symbol.replace(/USDT$/i, ''),
    group: 'Kripto' as const,
    keywords: `${symbol} crypto`.toLowerCase(),
    supportsRsi: true,
  }));

  const us = SCANNER_US_UNIQUE.map((symbol) => ({
    symbol,
    display: symbol,
    group: 'ABD' as const,
    keywords: `${symbol} nasdaq us abd`.toLowerCase(),
    supportsRsi: true,
  }));

  const fon = SCANNER_TEFAS_CODES.map((symbol) => ({
    symbol,
    display: symbol,
    group: 'Fon' as const,
    keywords: `${symbol} tefas fon`.toLowerCase(),
    supportsRsi: false,
  }));

  const etf = SCANNER_ETF_SYMBOLS.map((symbol) => ({
    symbol,
    display: symbol,
    group: 'ETF' as const,
    keywords: `${symbol} etf`.toLowerCase(),
    supportsRsi: true,
  }));

  const all = [
    ...COMMODITY_ASSETS,
    ...FX_ASSETS,
    ...bist,
    ...crypto,
    ...us,
    ...fon,
    ...etf,
  ];

  const seen = new Set<string>();
  return all.filter((a) => {
    if (seen.has(a.symbol)) return false;
    seen.add(a.symbol);
    return true;
  });
}

export const ALERT_ASSETS: AlertAssetOption[] = buildUniverse();

export const ALERT_ASSET_GROUPS: AlertAssetGroup[] = [
  'Emtia',
  'Döviz',
  'BİST',
  'Kripto',
  'ABD',
  'Fon',
  'ETF',
];

export function findAlertAsset(symbol: string): AlertAssetOption | undefined {
  const s = symbol.trim().toUpperCase();
  return ALERT_ASSETS.find(
    (a) =>
      a.symbol.toUpperCase() === s ||
      a.display.toUpperCase() === s ||
      a.symbol.replace('.IS', '') === s
  );
}

export function filterAlertAssets(query: string): AlertAssetOption[] {
  const q = query.trim().toLocaleLowerCase('tr-TR');
  if (!q) return ALERT_ASSETS;
  return ALERT_ASSETS.filter(
    (a) =>
      a.display.toLocaleLowerCase('tr-TR').includes(q) ||
      a.symbol.toLocaleLowerCase('tr-TR').includes(q) ||
      a.keywords.includes(q) ||
      a.group.toLocaleLowerCase('tr-TR').includes(q)
  );
}

export function assetSupportsRsi(symbol: string): boolean {
  return findAlertAsset(symbol)?.supportsRsi ?? true;
}
