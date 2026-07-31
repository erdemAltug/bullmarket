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
  'AAPL',
  'MSFT',
  'NVDA',
  'GOOGL',
  'AMZN',
  'META',
  'TSLA',
  'AMD',
  'NFLX',
  'INTC',
  'JPM',
  'V',
  'BAC',
  'DIS',
  'COST',
] as const;

/** Deterministic 7-point sparkline ending near current move */
export function buildSparkline(
  price: number,
  changePercent: number,
  seed: string
): number[] {
  const points = 7;
  const end = Math.max(price, 0.0001);
  const start = end / (1 + changePercent / 100);
  const out: number[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const base = start + (end - start) * t;
    hash = (hash * 1664525 + 1013904223) | 0;
    const wobble = ((hash % 1000) / 1000 - 0.5) * Math.abs(end - start) * 0.35;
    out.push(Math.max(0.0001, base + wobble));
  }
  out[points - 1] = end;
  return out;
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
