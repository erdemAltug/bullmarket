import { BIST30_SYMBOLS } from '@/lib/api/yahoo';

/** Expanded BİST universe for Market Scanner (≈ BIST 30 + liquid midcaps) */
export const SCANNER_BIST_SYMBOLS = [
  'XU100.IS',
  ...BIST30_SYMBOLS,
  'AEFES.IS',
  'CCOLA.IS',
  'MGROS.IS',
  'SOKM.IS',
  'MAVI.IS',
  'OTKAR.IS',
  'DOHOL.IS',
  'TKFEN.IS',
  'GESAN.IS',
  'EUREN.IS',
] as const;

export const SCANNER_CRYPTO_SYMBOLS = [
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
  'LTCUSDT',
  'UNIUSDT',
  'ATOMUSDT',
  'NEARUSDT',
  'APTUSDT',
  'ARBUSDT',
  'OPUSDT',
  'SUIUSDT',
  'PEPEUSDT',
  'SHIBUSDT',
  'TRXUSDT',
  'TONUSDT',
  'INJUSDT',
  'FETUSDT',
  'RENDERUSDT',
  'FILUSDT',
  'ICPUSDT',
  'IMXUSDT',
  'AAVEUSDT',
] as const;

export const SCANNER_US_SYMBOLS = [
  // Mega-cap tech
  'AAPL',
  'MSFT',
  'NVDA',
  'GOOGL',
  'GOOG',
  'AMZN',
  'META',
  'TSLA',
  'AVGO',
  'ORCL',
  'CRM',
  'ADBE',
  'AMD',
  'INTC',
  'QCOM',
  'TXN',
  'MU',
  'AMAT',
  'CSCO',
  'IBM',
  // Growth / software
  'NFLX',
  'PLTR',
  'SNOW',
  'CRWD',
  'PANW',
  'NET',
  'DDOG',
  'SHOP',
  'UBER',
  'ABNB',
  'COIN',
  'SQ',
  'PYPL',
  'SPOT',
  // Finance / consumer
  'JPM',
  'V',
  'MA',
  'BAC',
  'WFC',
  'GS',
  'MS',
  'AXP',
  'BRK-B',
  'WMT',
  'COST',
  'HD',
  'MCD',
  'NKE',
  'SBUX',
  'DIS',
  'KO',
  'PEP',
  // Energy / industrial / other
  'XOM',
  'CVX',
  'BA',
  'CAT',
  'GE',
  'UNH',
  'JNJ',
  'LLY',
  'PFE',
  'MRK',
] as const;

/** Deterministic sparkline removed — do not invent price history. */
export function buildSparkline(
  _price: number,
  _changePercent: number,
  _seed: string
): number[] {
  return [];
}

export function formatVolumeDisplay(
  volume: number | undefined,
  currency: 'TRY' | 'USD'
): string {
  if (volume == null || !Number.isFinite(volume) || volume <= 0) return '—';
  const prefix = currency === 'TRY' ? '₺' : '$';
  const abs = Math.abs(volume);
  if (abs >= 1e9) return `${prefix}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${prefix}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${prefix}${(abs / 1e3).toFixed(1)}K`;
  return `${prefix}${abs.toFixed(0)}`;
}
