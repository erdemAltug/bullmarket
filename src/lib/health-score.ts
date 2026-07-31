import type { StockFundamentals } from '@/types';

export interface HealthSubScore {
  key: 'valuation' | 'health' | 'growth' | 'dividend';
  label: string;
  score: number;
  takeaway: string;
}

export interface AssetHealthReport {
  overall: number;
  label: string;
  subs: HealthSubScore[];
  takeaways: string[];
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function peScore(pe: number | null): number {
  if (pe == null || pe <= 0) return 55;
  if (pe < 8) return 88;
  if (pe < 12) return 78;
  if (pe < 18) return 65;
  if (pe < 28) return 48;
  return 32;
}

function pbScore(pb: number | null): number {
  if (pb == null || pb <= 0) return 55;
  if (pb < 1) return 90;
  if (pb < 1.5) return 78;
  if (pb < 2.5) return 62;
  if (pb < 4) return 45;
  return 30;
}

function roeScore(roe: number | null): number {
  if (roe == null) return 50;
  const pct = roe * 100;
  if (pct >= 20) return 92;
  if (pct >= 12) return 78;
  if (pct >= 8) return 62;
  if (pct >= 0) return 45;
  return 25;
}

function growthScore(g: number | null): number {
  if (g == null) return 50;
  const pct = g * 100;
  if (pct >= 25) return 90;
  if (pct >= 10) return 75;
  if (pct >= 0) return 58;
  if (pct >= -10) return 40;
  return 25;
}

function divScore(yieldPct: number | null, yearReturn: number | null): number {
  const y = yieldPct != null ? yieldPct * 100 : null;
  let s = 50;
  if (y != null) {
    if (y >= 6) s = 88;
    else if (y >= 3) s = 72;
    else if (y >= 1) s = 58;
    else s = 42;
  }
  if (yearReturn != null && yearReturn > 20) s = Math.min(100, s + 5);
  return clamp(s);
}

function betaHealth(beta: number | null): number {
  if (beta == null) return 55;
  if (beta < 0.8) return 85;
  if (beta < 1.1) return 70;
  if (beta < 1.4) return 52;
  return 35;
}

export function computeAssetHealth(
  f: Pick<
    StockFundamentals,
    | 'trailingPE'
    | 'priceToBook'
    | 'returnOnEquity'
    | 'earningsGrowth'
    | 'dividendYield'
    | 'beta'
    | 'yearReturn'
  >
): AssetHealthReport {
  const valuation = clamp(
    peScore(f.trailingPE) * 0.55 + pbScore(f.priceToBook) * 0.45
  );
  const health = clamp(
    roeScore(f.returnOnEquity) * 0.55 + betaHealth(f.beta) * 0.45
  );
  const growth = growthScore(f.earningsGrowth);
  const dividend = divScore(f.dividendYield, f.yearReturn);

  const overall = clamp(
    valuation * 0.28 + health * 0.28 + growth * 0.24 + dividend * 0.2
  );

  const label =
    overall >= 80
      ? 'Mükemmel Temel Yapı'
      : overall >= 65
        ? 'Sağlıklı Profil'
        : overall >= 45
          ? 'Orta — Dikkatli İzle'
          : 'Zayıf Temeller';

  const takeaways: string[] = [];
  if (f.trailingPE != null && f.trailingPE < 12) {
    takeaways.push('✅ F/K oranı görece cazip seviyede');
  } else if (f.trailingPE != null && f.trailingPE > 25) {
    takeaways.push('⚠️ F/K oranı yüksek — değerleme pahalı görünebilir');
  }
  if (f.returnOnEquity != null && f.returnOnEquity >= 0.12) {
    takeaways.push('✅ Özsermaye kârlılığı sektör ortalamasının üstünde');
  } else if (f.beta != null && f.beta > 1.3) {
    takeaways.push('⚠️ Beta yüksek — piyasa düşüşlerine daha duyarlı');
  }
  if (f.earningsGrowth != null && f.earningsGrowth > 0.1) {
    takeaways.push('✅ Son dönem kâr büyümesi pozitif');
  } else if (f.earningsGrowth != null && f.earningsGrowth < 0) {
    takeaways.push('⚠️ Kâr büyümesi negatif — momentum zayıf');
  }
  if (f.dividendYield != null && f.dividendYield >= 0.03) {
    takeaways.push('✅ Temettü verimi nakit akışı desteği sunuyor');
  }
  if (!takeaways.length) {
    takeaways.push('ℹ️ Bazı metrikler eksik; karnesini canlı veriyle güncelleyin');
  }

  const subs: HealthSubScore[] = [
    {
      key: 'valuation',
      label: 'Değerleme',
      score: valuation,
      takeaway:
        f.trailingPE != null
          ? `F/K ${f.trailingPE.toFixed(1)}`
          : 'F/K verisi yok',
    },
    {
      key: 'health',
      label: 'Sağlık & Borçluluk',
      score: health,
      takeaway:
        f.returnOnEquity != null
          ? `ROE %${(f.returnOnEquity * 100).toFixed(1)}`
          : 'ROE verisi yok',
    },
    {
      key: 'growth',
      label: 'Büyüme',
      score: growth,
      takeaway:
        f.earningsGrowth != null
          ? `Kâr büyümesi %${(f.earningsGrowth * 100).toFixed(1)}`
          : 'Büyüme verisi yok',
    },
    {
      key: 'dividend',
      label: 'Temettü & Nakit',
      score: dividend,
      takeaway:
        f.dividendYield != null
          ? `Verim %${(f.dividendYield * 100).toFixed(1)}`
          : 'Temettü verisi yok',
    },
  ];

  return { overall, label, subs, takeaways };
}

/** Kripto için basitleştirilmiş skor (fundamentals sınırlı) */
export function computeCryptoHealth(input: {
  yearReturn: number | null;
  changePercent: number;
  price: number;
}): AssetHealthReport {
  const yr = input.yearReturn;
  const momentum =
    yr == null
      ? 50
      : yr >= 50
        ? 88
        : yr >= 15
          ? 72
          : yr >= 0
            ? 55
            : yr >= -30
              ? 38
              : 22;
  const vol = Math.abs(input.changePercent);
  const stability =
    vol < 2 ? 80 : vol < 5 ? 62 : vol < 10 ? 45 : 28;
  const liquidity = input.price > 0 ? 70 : 40;
  const overall = clamp(momentum * 0.45 + stability * 0.35 + liquidity * 0.2);

  return {
    overall,
    label:
      overall >= 75
        ? 'Güçlü Momentum'
        : overall >= 55
          ? 'Nötr Teknik Profil'
          : 'Yüksek Volatilite Riski',
    subs: [
      {
        key: 'growth',
        label: 'Momentum (1Y)',
        score: clamp(momentum),
        takeaway: yr != null ? `%${yr.toFixed(1)} 1Y` : '1Y veri yok',
      },
      {
        key: 'health',
        label: 'Volatilite',
        score: clamp(stability),
        takeaway: `Günlük %${input.changePercent.toFixed(2)}`,
      },
      {
        key: 'valuation',
        label: 'Likidite / Fiyat',
        score: clamp(liquidity),
        takeaway: 'Spot piyasa',
      },
      {
        key: 'dividend',
        label: 'Getiri (N/A)',
        score: 40,
        takeaway: 'Kriptoda temettü yok',
      },
    ],
    takeaways: [
      yr != null && yr > 20
        ? '✅ Son 1 yılda güçlü getiri'
        : '⚠️ Momentum zayıf veya veri eksik',
      vol > 5
        ? '⚠️ Gün içi volatilite yüksek — pozisyon boyutunu sınırlayın'
        : '✅ Günlük hareket görece sakin',
    ],
  };
}
