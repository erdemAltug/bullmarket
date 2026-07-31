import type { StockFundamentals } from '@/types';

export type ConsensusRatingLabel = 'GÜÇLÜ AL' | 'AL' | 'TUT' | 'SAT';
export type BrokerRating = 'AL' | 'TUT' | 'SAT';

export interface BrokerReport {
  id: string;
  brokerName: string;
  targetPrice: number;
  rating: BrokerRating;
  date: string;
  comment: string;
}

export interface AssetAnalystConsensus {
  symbol: string;
  currentPrice: number;
  currency: 'TL' | '$';
  targetPriceMean: number;
  targetPriceHigh: number;
  targetPriceLow: number;
  upsidePotential: number;
  ratings: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
  };
  consensusRating: ConsensusRatingLabel;
  aiSummaryNote: string;
  recentBrokerReports: BrokerReport[];
  /** analyst = Yahoo votes; technical = live band only (no fake kurum) */
  source: 'analyst' | 'technical';
}

function mapKey(key: string | null): ConsensusRatingLabel {
  const k = (key ?? '').toLowerCase();
  if (k.includes('strong_buy') || k === 'strongbuy') return 'GÜÇLÜ AL';
  if (k.includes('buy') || k === 'outperform') return 'AL';
  if (k.includes('sell') || k.includes('under')) return 'SAT';
  return 'TUT';
}

/** Map live Yahoo fundamentals → detail card (no fake brokers) */
export function fromLiveFundamentals(
  f: StockFundamentals
): AssetAnalystConsensus | null {
  const a = f.analyst;
  if (!a) return null;
  const mean = a.targetMean;
  const high = a.targetHigh;
  const low = a.targetLow;
  if (mean == null && high == null && low == null) {
    const votes = a.strongBuy + a.buy + a.hold + a.sell + a.strongSell;
    if (!votes && !a.recommendationKey) return null;
  }

  const price = f.price;
  const targetMean = mean ?? high ?? low;
  if (targetMean == null && !a.recommendationKey) {
    const votes = a.strongBuy + a.buy + a.hold + a.sell + a.strongSell;
    if (!votes) return null;
  }
  const resolvedMean = targetMean ?? price;
  const targetHigh = high ?? null;
  const targetLow = low ?? null;
  const upside =
    price > 0 ? ((resolvedMean - price) / price) * 100 : 0;
  const consensusRating = mapKey(a.recommendationKey);
  const display = f.symbol.replace('.IS', '');
  const currency: 'TL' | '$' = f.currency === 'USD' ? '$' : 'TL';

  const reports: BrokerReport[] = [];
  if (mean != null) {
    reports.push({
      id: 'yahoo-mean',
      brokerName: 'Yahoo Finance Konsensüs',
      targetPrice: mean,
      rating:
        upside >= 10 ? 'AL' : upside <= -5 ? 'SAT' : 'TUT',
      date: new Date().toISOString().slice(0, 10),
      comment: `${display} için ${a.strongBuy + a.buy + a.hold + a.sell + a.strongSell} analist görüşüne dayalı canlı ortalama hedef.`,
    });
  }
  if (high != null && high !== mean) {
    reports.push({
      id: 'yahoo-high',
      brokerName: 'En Yüksek Hedef (Analist)',
      targetPrice: high,
      rating: 'AL',
      date: new Date().toISOString().slice(0, 10),
      comment: 'Yahoo Finance financialData hedef bandı üstü.',
    });
  }
  if (low != null && low !== mean) {
    reports.push({
      id: 'yahoo-low',
      brokerName: 'En Düşük Hedef (Analist)',
      targetPrice: low,
      rating: upside < 0 ? 'SAT' : 'TUT',
      date: new Date().toISOString().slice(0, 10),
      comment: 'Yahoo Finance financialData hedef bandı altı.',
    });
  }

  const pe =
    f.trailingPE != null ? `F/K ${f.trailingPE.toFixed(1)}` : 'F/K verisi canlı';
  const aiSummaryNote = [
    `${display} canlı fiyat ${currency === '$' ? '$' : '₺'}${price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} (${pe}).`,
    `12 aylık analist ortalaması ${currency === '$' ? '$' : '₺'}${resolvedMean.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} · potansiyel %${upside.toFixed(1)} (${consensusRating}).`,
    a.recommendationKey
      ? `Yahoo recommendationKey: ${a.recommendationKey}.`
      : 'Tavsiye dağılımı canlı analist oylarından türetilmiştir.',
  ].join(' ');

  return {
    symbol: display,
    currentPrice: price,
    currency,
    targetPriceMean: resolvedMean,
    targetPriceHigh: targetHigh ?? resolvedMean,
    targetPriceLow: targetLow ?? Math.min(price, resolvedMean),
    upsidePotential: upside,
    ratings: {
      strongBuy: a.strongBuy,
      buy: a.buy,
      hold: a.hold,
      sell: a.sell + a.strongSell,
    },
    consensusRating,
    aiSummaryNote,
    recentBrokerReports: reports,
    source: 'analyst',
  };
}

/** Crypto: live 24h high/low band — technical only, zero fake analyst votes */
export function fromLiveCryptoBand(input: {
  symbol: string;
  price: number;
  high24h: number;
  low24h: number;
  changePercent: number;
}): AssetAnalystConsensus {
  const display = input.symbol.replace('USDT', '');
  const mid = (input.high24h + input.low24h) / 2;
  const upside =
    input.price > 0 ? ((input.high24h - input.price) / input.price) * 100 : 0;
  const bullish = input.changePercent >= 0;

  return {
    symbol: display,
    currentPrice: input.price,
    currency: '$',
    targetPriceMean: mid,
    targetPriceHigh: input.high24h,
    targetPriceLow: input.low24h,
    upsidePotential: upside,
    ratings: { strongBuy: 0, buy: 0, hold: 0, sell: 0 },
    consensusRating: bullish ? 'AL' : 'TUT',
    aiSummaryNote: `${display} canlı spot $${input.price.toLocaleString('en-US', { maximumFractionDigits: 2 })} (Binance). Bu kart kurumsal analist hedefi değildir — yalnızca 24s high/low teknik bandıdır.`,
    recentBrokerReports: [
      {
        id: 'binance-24h',
        brokerName: 'Binance 24s Teknik Bant',
        targetPrice: mid,
        rating: bullish ? 'AL' : 'TUT',
        date: new Date().toISOString().slice(0, 10),
        comment:
          'Kurumsal analist yok. Canlı 24s high/low bandından teknik referans.',
      },
    ],
    source: 'technical',
  };
}
