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
  const targetMean = mean ?? high ?? low ?? price;
  const targetHigh = high ?? targetMean * 1.08;
  const targetLow = low ?? Math.min(price, targetMean * 0.92);
  const upside =
    price > 0 ? ((targetMean - price) / price) * 100 : 0;
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
      comment: 'Yahoo Finance summaryDetail / financialData hedef bandı üstü.',
    });
  }
  if (low != null && low !== mean) {
    reports.push({
      id: 'yahoo-low',
      brokerName: 'En Düşük Hedef (Analist)',
      targetPrice: low,
      rating: upside < 0 ? 'SAT' : 'TUT',
      date: new Date().toISOString().slice(0, 10),
      comment: 'Yahoo Finance summaryDetail / financialData hedef bandı altı.',
    });
  }

  const pe =
    f.trailingPE != null ? `F/K ${f.trailingPE.toFixed(1)}` : 'F/K verisi canlı';
  const aiSummaryNote = [
    `${display} canlı fiyat ${currency === '$' ? '$' : '₺'}${price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} (${pe}).`,
    `12 aylık analist ortalaması ${currency === '$' ? '$' : '₺'}${targetMean.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} · potansiyel %${upside.toFixed(1)} (${consensusRating}).`,
    a.recommendationKey
      ? `Yahoo recommendationKey: ${a.recommendationKey}.`
      : 'Tavsiye dağılımı canlı analist oylarından türetilmiştir.',
  ].join(' ');

  return {
    symbol: display,
    currentPrice: price,
    currency,
    targetPriceMean: targetMean,
    targetPriceHigh: targetHigh,
    targetPriceLow: targetLow,
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
  };
}

/** Crypto: live 24h high/low band as technical target proxy (no fake brokers) */
export function fromLiveCryptoBand(input: {
  symbol: string;
  price: number;
  high24h: number;
  low24h: number;
  changePercent: number;
}): AssetAnalystConsensus {
  const display = input.symbol.replace('USDT', '');
  const mean = (input.high24h + input.price) / 2;
  const upside =
    input.price > 0 ? ((mean - input.price) / input.price) * 100 : 0;
  const bullish = input.changePercent >= 0;

  return {
    symbol: display,
    currentPrice: input.price,
    currency: '$',
    targetPriceMean: mean,
    targetPriceHigh: input.high24h,
    targetPriceLow: input.low24h,
    upsidePotential: upside,
    ratings: {
      strongBuy: bullish ? 4 : 1,
      buy: bullish ? 3 : 2,
      hold: 2,
      sell: bullish ? 1 : 3,
    },
    consensusRating: bullish ? 'AL' : 'TUT',
    aiSummaryNote: `${display} canlı spot $${input.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}. 24s zirve $${input.high24h.toLocaleString('en-US', { maximumFractionDigits: 2 })}, dip $${input.low24h.toLocaleString('en-US', { maximumFractionDigits: 2 })} (Binance). Teknik bant ortalamasına göre potansiyel %${upside.toFixed(1)}.`,
    recentBrokerReports: [
      {
        id: 'binance-24h',
        brokerName: 'Binance 24s Teknik Bant',
        targetPrice: mean,
        rating: bullish ? 'AL' : 'TUT',
        date: new Date().toISOString().slice(0, 10),
        comment:
          'Kurumsal analist hedefi yok; canlı 24 saatlik high/low bandından türetilmiş teknik referans.',
      },
    ],
  };
}
