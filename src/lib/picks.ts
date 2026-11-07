/**
 * Shortlist engine for the terminal: turns the live scan plus analyst targets
 * into ranked, explained picks. Everything here is an observation built from
 * public data; wording stays descriptive (no buy/sell calls).
 */
import { scoreOpportunity } from '@/lib/ai-opportunity';
import type { LiveAnalystTarget } from '@/lib/live-targets';
import type { ScannerItem } from '@/types/scanner';

export type PickMarket = 'BIST' | 'US' | 'CRYPTO' | 'FUND';

export type PickTheme =
  | 'best'
  | 'upside'
  | 'cheap'
  | 'momentum'
  | 'favorites'
  | 'pullback'
  | 'volume'
  | 'rebound';

export type Pick = {
  item: ScannerItem;
  score: number;
  rank: number;
  upside: number | null;
  target: number | null;
  analysts: number;
  bullish: number;
  positive: boolean;
  pos: number;
  reasons: string[];
};

export const MARKETS: { id: PickMarket; label: string }[] = [
  { id: 'BIST', label: 'BİST' },
  { id: 'US', label: 'ABD' },
  { id: 'CRYPTO', label: 'Kripto' },
  { id: 'FUND', label: 'Fon ve ETF' },
];

export const THEMES: Record<PickTheme, { label: string; hint: string; markets: PickMarket[] }> = {
  best: {
    label: 'Günün en iyileri',
    hint: 'Skor, analist hedefi ve değerleme birlikte en güçlü olanlar',
    markets: ['BIST', 'US', 'CRYPTO', 'FUND'],
  },
  upside: {
    label: 'Hedefe en uzak',
    hint: 'Analist ortalama hedef fiyatına göre en çok yükselme payı olanlar',
    markets: ['BIST', 'US'],
  },
  favorites: {
    label: 'Analist favorileri',
    hint: 'En çok analistin olumlu görüş verdiği şirketler',
    markets: ['BIST', 'US'],
  },
  cheap: {
    label: 'Ucuz kalanlar',
    hint: 'Kârına göre düşük çarpanla işlem gören, skoru iyi hisseler',
    markets: ['BIST', 'US'],
  },
  pullback: {
    label: 'Düşüşte, hedefi yüksek',
    hint: 'Bugün geri çekilen ama analist hedefi hâlâ çok yukarıda olanlar',
    markets: ['BIST', 'US'],
  },
  momentum: {
    label: 'Güç kazananlar',
    hint: 'Bugün yükselen ve günün tepesine yakın kapananlar',
    markets: ['BIST', 'US', 'CRYPTO', 'FUND'],
  },
  rebound: {
    label: 'Dipten dönenler',
    hint: 'Gün içinde sert düşüp güçlü toparlananlar',
    markets: ['BIST', 'US', 'CRYPTO'],
  },
  volume: {
    label: 'Hacim patlaması',
    hint: 'Bugün en yoğun işlem gören ve yükselenler',
    markets: ['BIST', 'US', 'CRYPTO'],
  },
};

export const THEME_ORDER: PickTheme[] = [
  'best',
  'upside',
  'favorites',
  'cheap',
  'pullback',
  'momentum',
  'rebound',
  'volume',
];

export function marketOf(i: ScannerItem): PickMarket {
  if (i.category === 'FON' || i.category === 'ETF') return 'FUND';
  return i.category as PickMarket;
}

export function rangePos(i: ScannerItem): number {
  if (i.dayHigh == null || i.dayLow == null || i.dayHigh <= i.dayLow) return i.changePercent >= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, (i.price - i.dayLow) / (i.dayHigh - i.dayLow)));
}

/** Score every scan row once; themes only filter and sort this list. */
export function buildPicks(items: ScannerItem[], targets: LiveAnalystTarget[]): Pick[] {
  const t = new Map(targets.map((x) => [x.symbol, x]));
  // Crypto: only the 60 most traded coins, so thin micro-caps never top a list.
  const cryptoVol = items
    .filter((i) => i.category === 'CRYPTO')
    .map((i) => i.volumeRaw)
    .sort((a, b) => b - a);
  const cryptoCut = cryptoVol[Math.min(59, cryptoVol.length - 1)] ?? 0;
  return items
    .filter((i) => i.category !== 'CRYPTO' || i.volumeRaw >= cryptoCut)
    .filter((i) => i.price > 0 && !i.displaySymbol.startsWith('XU') && Math.abs(i.changePercent) < (i.category === 'CRYPTO' ? 40 : 15))
    .map((item) => {
      const score = scoreOpportunity(item);
      const tg = t.get(item.symbol);
      const target = tg?.targetMean ?? null;
      const upside = target && item.price > 0 ? ((target - item.price) / item.price) * 100 : null;
      const analysts = tg?.analystCount ?? 0;
      const r = tg?.ratings;
      const bullish = r ? r.strongBuy + r.buy : 0;
      const positive = Boolean(r && bullish > r.hold + r.sell + r.strongSell);
      const pe = item.trailingPE;
      const pos = rangePos(item);

      let rank = score;
      if (upside != null && analysts >= 3) rank += Math.max(-10, Math.min(30, upside * 0.6));
      if (positive) rank += 8;
      if (pe != null && pe > 0 && pe < 12) rank += 6;

      const reasons: string[] = [];
      if (upside != null && analysts >= 3 && upside > 5) reasons.push(`Hedefe %${upside.toFixed(0)} uzakta`);
      if (positive && analysts >= 3) reasons.push(`${bullish}/${analysts} analist olumlu`);
      if (pe != null && pe > 0 && pe < 12) reasons.push(`F/K ${pe.toFixed(1)}`);
      if (item.changePercent >= 2) reasons.push(`Bugün +%${item.changePercent.toFixed(1)}`);
      if (item.changePercent < 0 && pos >= 0.6) reasons.push('Gün içinde toparladı');
      if (pos >= 0.9 && item.changePercent > 0) reasons.push('Günün tepesinde');
      if (score >= 80) reasons.push(`Skor ${score}`);
      if (!reasons.length) reasons.push(`Skor ${score}`);

      return { item, score, rank, upside, target, analysts, bullish, positive, pos, reasons: reasons.slice(0, 3) };
    });
}

export function pickTheme(theme: PickTheme, all: Pick[]): Pick[] {
  const by = (f: (p: Pick) => boolean, sort: (a: Pick, b: Pick) => number) => all.filter(f).sort(sort);
  switch (theme) {
    case 'upside':
      return by((p) => p.upside != null && p.analysts >= 5 && p.upside > 0, (a, b) => b.upside! - a.upside!);
    case 'favorites':
      return by((p) => p.analysts >= 5 && p.positive, (a, b) => b.bullish / b.analysts - a.bullish / a.analysts || b.analysts - a.analysts);
    case 'cheap':
      return by(
        (p) => p.item.trailingPE != null && p.item.trailingPE > 0 && p.item.trailingPE < 12 && p.score >= 55,
        (a, b) => a.item.trailingPE! - b.item.trailingPE!
      );
    case 'pullback':
      return by(
        (p) => p.item.changePercent <= -1 && p.upside != null && p.upside >= 20 && p.analysts >= 3,
        (a, b) => b.upside! - a.upside!
      );
    case 'momentum':
      return by((p) => p.item.changePercent >= 1.5 && p.pos >= 0.6, (a, b) => b.item.changePercent - a.item.changePercent);
    case 'rebound':
      return by(
        (p) => {
          const { dayHigh, dayLow, price } = p.item;
          if (dayHigh == null || dayLow == null || dayHigh <= dayLow) return false;
          const swing = ((dayHigh - dayLow) / dayLow) * 100;
          const bounce = ((price - dayLow) / dayLow) * 100;
          return swing >= 3 && bounce >= 2 && p.pos >= 0.7;
        },
        (a, b) => b.pos - a.pos || b.score - a.score
      );
    case 'volume':
      return by((p) => p.item.changePercent > 0, (a, b) => b.item.volumeRaw - a.item.volumeRaw);
    default:
      return by(() => true, (a, b) => b.rank - a.rank);
  }
}
