import type { ScannerItem } from '@/types/scanner';

export interface SignalCardData {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: 'BIST' | 'CRYPTO';
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
}

/**
 * Live signal cards from real price + session/24h high-low.
 * SL/TP are mathematical % of the live entry (no mock arrays).
 */
export function generateRealTimeSignals(
  marketItems: ScannerItem[]
): SignalCardData[] {
  if (!marketItems?.length) return [];

  const eligible = marketItems.filter(
    (item) =>
      (item.category === 'BIST' || item.category === 'CRYPTO') &&
      item.price > 0
  );

  const cards: SignalCardData[] = [];

  for (const item of eligible) {
    const price = item.price;
    const high = item.dayHigh && item.dayHigh > 0 ? item.dayHigh : price * 1.02;
    const low = item.dayLow && item.dayLow > 0 ? item.dayLow : price * 0.98;
    const span = Math.max(high - low, price * 0.005);
    const rangePos = Math.min(1, Math.max(0, (price - low) / span));
    const chg = item.changePercent;

    let signalType: SignalCardData['signalType'] | null = null;
    let strategyName = '';

    if (rangePos <= 0.22 && chg > -8) {
      signalType = rangePos <= 0.12 ? 'STRONG_BUY' : 'BUY';
      strategyName = 'Destek (gün içi dip) tepkisi — aşırı satım bölgesi';
    } else if (rangePos >= 0.82 && chg < 8) {
      signalType = 'SELL';
      strategyName = 'Direnç (gün içi zirve) reddi — aşırı alım bölgesi';
    } else if (chg >= 3 && rangePos < 0.7) {
      signalType = chg >= 5 ? 'STRONG_BUY' : 'BUY';
      strategyName = 'Momentum kırılımı — güçlü pozitif günlük değişim';
    } else if (chg <= -3 && rangePos > 0.3) {
      signalType = 'SELL';
      strategyName = 'Negatif ivme — destek kırılımı riski';
    } else if (price >= high * 0.995 && chg > 0) {
      signalType = 'BUY';
      strategyName = 'Gün içi zirveye yakın kırılım denemesi';
    } else {
      continue; // no clear live signal — skip (no fake cards)
    }

    const isBuy = signalType === 'BUY' || signalType === 'STRONG_BUY';
    const slPct = isBuy ? 0.028 : 0.028;
    const tpPct = isBuy ? 0.055 : 0.055;
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
      category: item.category as 'BIST' | 'CRYPTO',
      signalType,
      strategyName,
      entryPrice: price,
      stopLoss,
      targetPrice,
      confidenceScore,
      timeAgo: 'canlı',
      riskRewardRatio: `1:${rr.toFixed(1)}`,
      changePercent: chg,
    });
  }

  return cards.sort((a, b) => {
    const score = (s: SignalCardData) =>
      s.confidenceScore + Math.abs(s.changePercent) * 2;
    return score(b) - score(a);
  });
}
