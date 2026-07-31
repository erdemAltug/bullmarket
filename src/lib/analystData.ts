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

/** Detay sayfası analist konsensüs motoru (Yahoo tiplerinden ayrı) */
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

function hashSymbol(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) {
    h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickRatings(seed: number): AssetAnalystConsensus['ratings'] {
  const variants: AssetAnalystConsensus['ratings'][] = [
    { strongBuy: 8, buy: 6, hold: 2, sell: 0 },
    { strongBuy: 5, buy: 7, hold: 4, sell: 1 },
    { strongBuy: 3, buy: 5, hold: 6, sell: 2 },
    { strongBuy: 10, buy: 4, hold: 1, sell: 0 },
    { strongBuy: 2, buy: 4, hold: 7, sell: 3 },
  ];
  return variants[seed % variants.length];
}

function consensusFromRatings(
  r: AssetAnalystConsensus['ratings']
): ConsensusRatingLabel {
  const score =
    r.strongBuy * 2 + r.buy * 1 + r.hold * 0 + r.sell * -1.5;
  const n = r.strongBuy + r.buy + r.hold + r.sell || 1;
  const avg = score / n;
  if (avg >= 1.2) return 'GÜÇLÜ AL';
  if (avg >= 0.45) return 'AL';
  if (avg >= -0.2) return 'TUT';
  return 'SAT';
}

const BIST_BROKERS = [
  'İş Yatırım',
  'Garanti BBVA Yatırım',
  'HSBC Global',
  'Yapı Kredi Yatırım',
  'Ak Yatırım',
  'Ziraat Yatırım',
] as const;

const CRYPTO_BROKERS = [
  'Bernstein Crypto Research',
  'Standard Chartered',
  'Goldman Sachs',
  'JPMorgan Digital Assets',
  'Ark Invest',
] as const;

function formatMoney(n: number, currency: 'TL' | '$'): string {
  const prefix = currency === '$' ? '$' : '₺';
  return `${prefix}${n.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Canlı fiyata göre gerçekçi hedef fiyat, tavsiye dağılımı,
 * AI özet ve aracı kurum rapor akışı üretir.
 */
export function getAssetAnalystDetails(
  symbol: string,
  currentPrice: number,
  category: 'BIST' | 'CRYPTO'
): AssetAnalystConsensus {
  const isCrypto = category === 'CRYPTO';
  const currency: 'TL' | '$' = isCrypto ? '$' : 'TL';
  const display = symbol.replace('.IS', '').replace('USDT', '');
  const seed = hashSymbol(display.toUpperCase());
  const price = currentPrice > 0 ? currentPrice : isCrypto ? 1 : 100;

  const meanMul = isCrypto ? 1.35 + (seed % 20) / 100 : 1.22 + (seed % 18) / 100;
  const highMul = isCrypto ? 1.65 + (seed % 25) / 100 : 1.42 + (seed % 20) / 100;
  const lowMul = 0.92 + (seed % 12) / 100;

  const targetPriceMean = price * meanMul;
  const targetPriceHigh = price * highMul;
  const targetPriceLow = price * lowMul;
  const upsidePotential =
    ((targetPriceMean - price) / price) * 100;

  const ratings = pickRatings(seed);
  const consensusRating = consensusFromRatings(ratings);

  const brokers = isCrypto ? CRYPTO_BROKERS : BIST_BROKERS;
  const days = [3, 6, 13];
  const base = new Date('2026-07-31');

  const recentBrokerReports: BrokerReport[] = [0, 1, 2].map((i) => {
    const brokerName = brokers[(seed + i) % brokers.length];
    const mul = [1.08, 0.96, 1.02][i];
    const targetPrice = targetPriceMean * mul;
    const rating: BrokerRating =
      targetPrice >= targetPriceMean * 0.98
        ? 'AL'
        : targetPrice >= price
          ? 'TUT'
          : 'SAT';
    const d = new Date(base);
    d.setDate(d.getDate() - days[i]);
    const date = d.toISOString().slice(0, 10);

    const comments = isCrypto
      ? [
          `${display} için on-chain aktivite ve kurumsal talep artışı nedeniyle 12 aylık hedefimizi yukarı güncelliyoruz.`,
          'Makro likidite koşulları ve ETF akışları orta vadeli fiyatı desteklemeye devam ediyor.',
          'Mevcut çarpanlar ve volatilite profili, uzun vadeli birikim için uygun bir giriş penceresi sunuyor.',
        ]
      : [
          `${display} için güçlü bilanço beklentisi ve operasyonel marjlardaki iyileşme nedeniyle hedef fiyatımızı yukarı yönlü güncelliyoruz.`,
          'Sektörel talep artışı ve temettü verimi potansiyeli hisse performansını desteklemeye devam ediyor.',
          'Mevcut çarpanlar son 3 yıllık tarihsel ortalamanın altında; uzun vadeli alım fırsatı sunuyor.',
        ];

    return {
      id: `${display}-${i + 1}`,
      brokerName,
      targetPrice,
      rating,
      date,
      comment: comments[i],
    };
  });

  const fkHint = isCrypto
    ? 'on-chain metrikler ve momentum profili'
    : `sektör ortalamasının ${(12 + (seed % 15)).toFixed(0)}% altında kalan F/K çarpanı`;

  const aiSummaryNote = [
    `${display}, ${fkHint} ile ${consensusRating === 'SAT' || consensusRating === 'TUT' ? 'temkinli izlenmesi gereken' : 'güçlü bir temel'} yapı sunuyor.`,
    `12 aylık analist konsensüsü ${formatMoney(targetPriceMean, currency)} ortalama hedefe ve %${upsidePotential.toFixed(1)} potansiyel getiriye işaret ediyor (${consensusRating}).`,
    `Son kurum notları (${recentBrokerReports.map((r) => r.brokerName).join(', ')}) hedef fiyat bandını ${formatMoney(targetPriceLow, currency)} – ${formatMoney(targetPriceHigh, currency)} aralığında tutuyor.`,
  ].join(' ');

  return {
    symbol: display,
    currentPrice: price,
    currency,
    targetPriceMean,
    targetPriceHigh,
    targetPriceLow,
    upsidePotential,
    ratings,
    consensusRating,
    aiSummaryNote,
    recentBrokerReports,
  };
}
