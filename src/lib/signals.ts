import type { ScannerItem } from '@/types/scanner';

export interface SignalCardData {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: 'BIST' | 'CRYPTO' | 'US' | 'FON' | 'ETF';
  signalType: 'BUY' | 'SELL' | 'STRONG_BUY';
  strategyName: string;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  confidenceScore: number;
  timeAgo: string;
  riskRewardRatio: string;
  changePercent: number;
  id: string;
  /** What is happening, in plain terms (shown instead of buy/sell). */
  kind: SignalKind;
  /** 0 = at the day low, 1 = at the day high. */
  rangePos: number;
  dayHigh: number;
  dayLow: number;
}

export type SignalKind = 'DIP' | 'PEAK' | 'SURGE' | 'SLUMP' | 'BREAKOUT';

/** Moves beyond these are almost always bad quotes or corporate actions. */
const MAX_PLAUSIBLE_MOVE = { CRYPTO: 60, DEFAULT: 25 } as const;

/**
 * Intraday band signals from live price + session/24h high-low.
 * Not RSI/SMA/MACD — those live on /api/signals (history-based).
 * SL/TP are mathematical % of the live entry.
 */
export function generateRealTimeSignals(
  marketItems: ScannerItem[]
): SignalCardData[] {
  if (!marketItems?.length) return [];

  const eligible = marketItems.filter(
    (item) =>
      (item.category === 'BIST' ||
        item.category === 'CRYPTO' ||
        item.category === 'US' ||
        item.category === 'ETF') &&
      item.price > 0
  );

  const cards: SignalCardData[] = [];

  for (const item of eligible) {
    const price = item.price;
    if (!item.dayHigh || !item.dayLow || item.dayHigh <= item.dayLow) {
      continue; // require real high/low — no invented bands
    }
    const high = item.dayHigh;
    const low = item.dayLow;
    const span = Math.max(high - low, price * 0.005);
    const rangePos = Math.min(1, Math.max(0, (price - low) / span));
    const chg = item.changePercent;
    const maxMove = item.category === 'CRYPTO' ? MAX_PLAUSIBLE_MOVE.CRYPTO : MAX_PLAUSIBLE_MOVE.DEFAULT;
    if (!Number.isFinite(chg) || Math.abs(chg) > maxMove) continue;

    let signalType: SignalCardData['signalType'] | null = null;
    let strategyName = '';
    let kind: SignalKind = 'DIP';

    if (rangePos <= 0.22 && chg > -8) {
      signalType = rangePos <= 0.12 ? 'STRONG_BUY' : 'BUY';
      strategyName = 'Fiyat günün en düşük seviyesine yakın';
      kind = 'DIP';
    } else if (rangePos >= 0.82 && chg < 8) {
      signalType = 'SELL';
      strategyName = 'Fiyat günün en yüksek seviyesine yakın';
      kind = 'PEAK';
    } else if (chg >= 3 && rangePos < 0.7) {
      signalType = chg >= 5 ? 'STRONG_BUY' : 'BUY';
      strategyName = `Bugün %${chg.toFixed(1)} yükseldi, hâlâ zirvenin altında`;
      kind = 'SURGE';
    } else if (chg <= -3 && rangePos > 0.3) {
      signalType = 'SELL';
      strategyName = `Bugün %${Math.abs(chg).toFixed(1)} düştü, dibin üstünde`;
      kind = 'SLUMP';
    } else if (price >= high * 0.995 && chg > 0) {
      signalType = 'BUY';
      strategyName = 'Gün içi zirveyi zorluyor';
      kind = 'BREAKOUT';
    } else {
      continue;
    }

    const isBuy = signalType === 'BUY' || signalType === 'STRONG_BUY';
    const slPct = 0.028;
    const tpPct = 0.055;
    const stopLoss = isBuy
      ? Math.min(price * (1 - slPct), low)
      : Math.max(price * (1 + slPct), high);
    const targetPrice = isBuy
      ? Math.max(price * (1 + tpPct), high)
      : Math.min(price * (1 - tpPct), low);

    const risk = Math.abs(price - stopLoss);
    const reward = Math.abs(targetPrice - price);
    const rr = risk > 0 ? reward / risk : 2;
    const confidenceScore = Math.min(
      96,
      Math.round(
        62 +
          Math.abs(chg) * 3 +
          (isBuy ? (1 - rangePos) * 18 : rangePos * 18)
      )
    );

    const displaySymbol =
      item.displaySymbol ||
      item.symbol.replace('.IS', '').replace('USDT', '');

    cards.push({
      id: `${item.symbol}-${signalType}`,
      symbol: item.symbol,
      displaySymbol,
      name: item.name,
      category: item.category as SignalCardData['category'],
      signalType,
      strategyName,
      entryPrice: price,
      stopLoss,
      targetPrice,
      confidenceScore,
      timeAgo: 'canlı',
      riskRewardRatio: `1:${rr.toFixed(1)}`,
      changePercent: chg,
      kind,
      rangePos,
      dayHigh: high,
      dayLow: low,
    });
  }

  return cards.sort((a, b) => {
    const score = (s: SignalCardData) =>
      s.confidenceScore + Math.abs(s.changePercent) * 2;
    return score(b) - score(a);
  });
}
