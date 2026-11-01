import type { AlertKind, PriceAlert } from '@/types';

/**
 * Alert rules shared by the in-browser AlertEngine and the server cron, so a
 * threshold means the same thing whether the tab is open or not.
 */
export interface LiveQuoteSnap {
  symbol: string;
  displaySymbol: string;
  price: number;
  changePercent: number;
  rsi?: number | null;
  score?: number | null;
}

type AlertRule = Pick<PriceAlert, 'kind' | 'threshold'>;

export function evaluateAlert(alert: AlertRule, snap: LiveQuoteSnap): boolean {
  switch (alert.kind) {
    case 'price_above':
      return snap.price >= alert.threshold;
    case 'price_below':
      return snap.price <= alert.threshold;
    case 'change_above':
      return snap.changePercent >= alert.threshold;
    case 'change_below':
      return snap.changePercent <= alert.threshold;
    case 'rsi_above':
      return snap.rsi != null && snap.rsi >= alert.threshold;
    case 'rsi_below':
      return snap.rsi != null && snap.rsi <= alert.threshold;
    case 'score_above':
      return snap.score != null && snap.score >= alert.threshold;
    default:
      return false;
  }
}

export function alertKindLabel(kind: AlertKind): string {
  switch (kind) {
    case 'price_above':
      return 'fiyat üstü';
    case 'price_below':
      return 'fiyat altı';
    case 'change_above':
      return '% hareket üstü';
    case 'change_below':
      return '% hareket altı';
    case 'rsi_above':
      return 'RSI üstü';
    case 'rsi_below':
      return 'RSI altı';
    case 'score_above':
      return 'Skor üstü';
    default:
      return kind;
  }
}

/** "THYAO: 250,5 (hedef: 250)" style line for notifications and e-mail. */
export function describeAlertHit(
  alert: Pick<PriceAlert, 'kind' | 'threshold' | 'displaySymbol'>,
  snap: LiveQuoteSnap
): string {
  const detail = alert.kind.startsWith('rsi')
    ? `RSI ${snap.rsi?.toFixed(1) ?? '—'} (hedef: ${alert.threshold})`
    : alert.kind === 'score_above'
      ? `skor ${snap.score ?? '—'} (hedef: ${alert.threshold})`
      : alert.kind.startsWith('change')
        ? `%${snap.changePercent.toFixed(2)} (hedef: %${alert.threshold})`
        : `${snap.price.toLocaleString('tr-TR')} (hedef: ${alert.threshold})`;
  return `${alert.displaySymbol}: ${detail}`;
}

export function indexSnap(map: Map<string, LiveQuoteSnap>, snap: LiveQuoteSnap) {
  map.set(snap.symbol.toUpperCase(), snap);
  map.set(snap.displaySymbol.toUpperCase(), snap);
  const bare = snap.symbol.replace(/\.IS$/i, '').toUpperCase();
  if (bare !== snap.symbol.toUpperCase()) map.set(bare, snap);
}

export function lookupSnap(
  map: Map<string, LiveQuoteSnap>,
  alert: Pick<PriceAlert, 'symbol' | 'displaySymbol'>
): LiveQuoteSnap | undefined {
  return (
    map.get(alert.symbol.toUpperCase()) ??
    map.get(alert.displaySymbol.toUpperCase()) ??
    map.get(alert.symbol.replace(/\.IS$/i, '').toUpperCase())
  );
}
