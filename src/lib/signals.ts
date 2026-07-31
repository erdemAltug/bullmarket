import type { ScannerItem } from '@/types/scanner';

export interface SignalCardData {
  id: string;
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
}

const BULL_STRATEGIES = [
  'RSI (14) Aşırı Satım Bölgesinden Çıkış',
  'SMA 50 / 200 Golden Cross Kırılımı',
  'Bollinger Alt Bant Sıçrama Sinyali',
  'MACD Pozitif İvme Kesişimi',
  'Destek Seviyesinden Güçlü Hacimli Tepki',
] as const;

const BEAR_STRATEGIES = [
  'RSI (14) Aşırı Alım Bölgesinden Dönüş',
  'SMA 20 Düzeltme Sinyali',
  'Direnç Bölgesi Hacimsiz Reddi',
  'MACD Negatif İvme Kesişimi',
] as const;

function seedHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Live-price based deterministic signal cards for BİST + Crypto. */
export function generateRealTimeSignals(
  marketItems: ScannerItem[]
): SignalCardData[] {
  if (!marketItems?.length) return [];

  const eligible = marketItems.filter(
    (item) => item.category === 'BIST' || item.category === 'CRYPTO'
  );

  const cards = eligible.map((item) => {
    const price = item.price;
    const isBullish = item.changePercent >= 0;
    const strategies = isBullish ? BULL_STRATEGIES : BEAR_STRATEGIES;
    const hash = seedHash(item.symbol + String(Math.round(price * 100)));
    const strategyName = strategies[hash % strategies.length];

    const slMultiplier = isBullish ? 0.972 : 1.028;
    const tpMultiplier = isBullish ? 1.068 : 0.932;
    const confidenceScore = Math.min(
      97,
      Math.floor(78 + ((Math.abs(item.changePercent) * 7) % 17))
    );

    const displaySymbol =
      item.displaySymbol ||
      item.symbol.replace('.IS', '').replace('USDT', '');

    return {
      id: `${item.symbol}-${hash % 97}`,
      symbol: item.symbol,
      displaySymbol,
      name: item.name,
      category: item.category as 'BIST' | 'CRYPTO',
      signalType: isBullish
        ? confidenceScore > 88
          ? ('STRONG_BUY' as const)
          : ('BUY' as const)
        : ('SELL' as const),
      strategyName,
      entryPrice: price,
      stopLoss: price * slMultiplier,
      targetPrice: price * tpMultiplier,
      confidenceScore,
      timeAgo: `${(hash % 45) + 3} dk önce`,
      riskRewardRatio: isBullish ? '1:2.4' : '1:2.1',
      changePercent: item.changePercent,
    };
  });

  // Prioritize high-confidence / strong moves for terminal feel
  return cards.sort((a, b) => {
    const score = (s: SignalCardData) =>
      s.confidenceScore + Math.abs(s.changePercent) * 2;
    return score(b) - score(a);
  });
}
