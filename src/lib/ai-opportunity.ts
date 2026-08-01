import type { ScannerItem } from '@/types/scanner';

export interface DailyVisionReport {
  headline: string;
  body: string;
  avgUpsidePct: number;
  bullishShare: number;
  opportunityCount: number;
  topSymbols: string[];
  asOf: string;
}

export interface PotentialCard {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: 'BIST' | 'CRYPTO' | 'US';
  price: number;
  currency: 'TRY' | 'USD';
  score: number;
  changePercent: number;
  /** Real day-high distance % when available; else null */
  toHighPct: number | null;
  /** Real day-low distance % when available; else null */
  toLowPct: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  trailingPE: number | null;
  volume: string;
  volumeRaw: number;
  catalysts: string[];
  href: string | null;
}

export interface SentimentReading {
  value: number;
  label: string;
  detail: string;
  bistBreadth: number;
  cryptoMomentum: number;
}

function rangePos(item: ScannerItem): number {
  const price = item.price;
  const high = item.dayHigh && item.dayHigh > 0 ? item.dayHigh : price * 1.01;
  const low = item.dayLow && item.dayLow > 0 ? item.dayLow : price * 0.99;
  const span = Math.max(high - low, price * 0.002);
  return Math.min(1, Math.max(0, (price - low) / span));
}

/** 0–100 opportunity score from live metrics only */
export function scoreOpportunity(item: ScannerItem): number {
  let s = 48;
  const chg = item.changePercent;
  const pos = rangePos(item);

  // Momentum
  if (chg >= 4) s += 18;
  else if (chg >= 2) s += 12;
  else if (chg >= 0.5) s += 6;
  else if (chg <= -4) s -= 14;
  else if (chg <= -2) s -= 8;

  // Near support = bounce potential
  if (pos <= 0.25) s += 14;
  else if (pos <= 0.4) s += 8;
  else if (pos >= 0.85) s -= 6;

  // Volume proxy (relative within category handled later — raw log)
  if (item.volumeRaw > 0) {
    const volScore = Math.min(12, Math.log10(item.volumeRaw + 1) * 1.2);
    s += volScore;
  }

  // Valuation discount when PE available
  if (item.trailingPE != null && item.trailingPE > 0) {
    if (item.trailingPE < 10) s += 12;
    else if (item.trailingPE < 15) s += 8;
    else if (item.trailingPE > 35) s -= 8;
  }

  return Math.max(12, Math.min(98, Math.round(s)));
}

function catalystsFor(item: ScannerItem, score: number): string[] {
  const out: string[] = [];
  const pos = rangePos(item);
  const pe = item.trailingPE;

  if (pe != null && pe > 0 && pe < 14) {
    out.push(`F/K ${pe.toFixed(1)} — görece iskontolu değerleme bandı`);
  } else if (item.changePercent >= 2) {
    out.push(`Günlük momentum +%${item.changePercent.toFixed(1)} — kırılım ivmesi`);
  } else {
    out.push(`Canlı hacim ${item.volume} — likidite desteği`);
  }

  if (pos <= 0.3) {
    out.push('Gün içi dip bölgesine yakın — teknik toparlanma potansiyeli');
  } else if (pos >= 0.7 && item.changePercent > 0) {
    out.push('Zirve bandında güçlü alım baskısı sürüyor');
  } else {
    out.push(
      item.category === 'CRYPTO'
        ? '24s high/low bandı içinde aktif fiyat keşfi'
        : 'Seans aralığında dengeli ama fırsat odaklı konum'
    );
  }

  if (score >= 80) {
    out.push(`Fırsat skoru ${score}/100 — üst dilim profil`);
  } else if (item.category === 'BIST') {
    out.push('BİST likidite evreninde tarama sinyali pozitif');
  } else {
    out.push('Global risk iştahı ile uyumlu canlı profil');
  }

  return out.slice(0, 3);
}

function detailHref(item: ScannerItem): string | null {
  if (item.category === 'BIST') return `/bist/${item.displaySymbol}`;
  if (item.category === 'CRYPTO') return `/crypto/${item.symbol}`;
  if (item.category === 'US') return `/us/${item.displaySymbol}`;
  return null;
}

/** 2-sentence conversion hook for Asset Detail Drawer */
export function buildMicroReview(card: PotentialCard): string {
  const pos =
    card.dayHigh != null &&
    card.dayLow != null &&
    card.dayHigh > card.dayLow
      ? (card.price - card.dayLow) / (card.dayHigh - card.dayLow)
      : 0.5;

  let band =
    'gün içi bant ortasında dengeli bir konumda';
  if (pos <= 0.28) {
    band = 'gün içi bant pozisyonunda güçlü alım / destek bölgesinde';
  } else if (pos >= 0.78) {
    band = 'gün içi zirve bandına yakın, direnç bölgesinde';
  }

  const pe =
    card.trailingPE != null && card.trailingPE > 0
      ? ` Canlı F/K ${card.trailingPE.toFixed(1)} ile değerleme filtresi skorunu destekliyor.`
      : card.category === 'CRYPTO'
        ? ' Spot hacim ve 24s bant, fırsat skorunun ana sürücüleri.'
        : ' Hacim ve momentum, fırsat skorunun ana sürücüleri.';

  const tone =
    card.score >= 80
      ? 'üst dilim fırsat profili'
      : card.score >= 65
        ? 'izlenmeye değer fırsat profili'
        : 'seçici izleme adayı';

  return `${card.displaySymbol}, canlı teknik verilere göre ${band} yer alıyor (skor ${card.score}/100 — ${tone}).${pe} Bu bir yatırım tavsiyesi değildir; alarm ve izleme listesiyle disiplini otomatikleştirin.`;
}

export function buildPotentialCards(
  items: ScannerItem[],
  limit = 6
): PotentialCard[] {
  const eligible = items.filter(
    (i) =>
      i.price > 0 &&
      (i.category === 'BIST' || i.category === 'CRYPTO' || i.category === 'US') &&
      !i.displaySymbol.includes('XU')
  );

  const ranked = eligible
    .map((item) => {
      const score = scoreOpportunity(item);
      const dayHigh =
        item.dayHigh && item.dayHigh > 0 ? item.dayHigh : null;
      const dayLow = item.dayLow && item.dayLow > 0 ? item.dayLow : null;
      const toHighPct =
        dayHigh && item.price > 0
          ? ((dayHigh - item.price) / item.price) * 100
          : null;
      const toLowPct =
        dayLow && item.price > 0
          ? ((item.price - dayLow) / item.price) * 100
          : null;
      return {
        symbol: item.symbol,
        displaySymbol: item.displaySymbol,
        name: item.name,
        category: item.category,
        price: item.price,
        currency: item.currency,
        score,
        changePercent: item.changePercent,
        toHighPct,
        toLowPct,
        dayHigh,
        dayLow,
        trailingPE: item.trailingPE ?? null,
        volume: item.volume,
        volumeRaw: item.volumeRaw,
        catalysts: catalystsFor(item, score),
        href: detailHref(item),
      } satisfies PotentialCard;
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}

export function buildDailyVision(items: ScannerItem[]): DailyVisionReport {
  const cards = buildPotentialCards(items, 12);
  const avgScore =
    cards.length > 0
      ? cards.reduce((s, c) => s + c.score, 0) / cards.length
      : 0;
  const movers = items.filter((i) => i.price > 0 && !i.displaySymbol.includes('XU'));
  const bullish = movers.filter((i) => i.changePercent >= 0).length;
  const bullishShare = movers.length ? (bullish / movers.length) * 100 : 50;
  const opportunityCount = cards.filter((c) => c.score >= 72).length;
  const topSymbols = cards.slice(0, 4).map((c) => c.displaySymbol);

  const tone =
    avgScore >= 72
      ? 'fırsat pencereleri açılıyor'
      : avgScore >= 55
        ? 'seçici alım fırsatları oluşuyor'
        : 'temkinli ama izlenebilir kırılımlar var';

  const headline = `Günlük tarama · ${tone.charAt(0).toUpperCase()}${tone.slice(1)}`;

  const body = `Canlı piyasa taramasında ${tone}. Ortalama fırsat skoru ${avgScore.toFixed(0)}/100 · ${opportunityCount || cards.length} yüksek skorlu profil${
    topSymbols.length ? ` — öne çıkanlar: ${topSymbols.join(', ')}` : ''
  }. Günlük genişlik: yükselenlerin oranı %${bullishShare.toFixed(0)}. Bu bir fiyat tahmini değildir.`;

  return {
    headline,
    body,
    avgUpsidePct: avgScore,
    bullishShare,
    opportunityCount: opportunityCount || cards.length,
    topSymbols,
    asOf: new Date().toISOString(),
  };
}

export function computeMarketSentiment(items: ScannerItem[]): SentimentReading {
  const bist = items.filter(
    (i) => i.category === 'BIST' && !i.displaySymbol.includes('XU')
  );
  const crypto = items.filter((i) => i.category === 'CRYPTO');

  const bistUp = bist.filter((i) => i.changePercent >= 0).length;
  const bistBreadth = bist.length ? (bistUp / bist.length) * 100 : 50;

  const cryptoAvg =
    crypto.length > 0
      ? crypto.reduce((s, i) => s + i.changePercent, 0) / crypto.length
      : 0;
  const cryptoMomentum = Math.max(
    0,
    Math.min(100, 50 + cryptoAvg * 8)
  );

  const avgChg =
    items.length > 0
      ? items.reduce((s, i) => s + i.changePercent, 0) / items.length
      : 0;

  let value = Math.round(
    bistBreadth * 0.45 + cryptoMomentum * 0.35 + (50 + avgChg * 6) * 0.2
  );
  value = Math.max(5, Math.min(95, value));

  let label: string;
  let detail: string;
  if (value >= 78) {
    label = 'Güçlü Boğa İvmesi';
    detail = 'Genişlik ve momentum aynı yönde — risk iştahı yüksek.';
  } else if (value >= 62) {
    label = 'Boğa Eğilimli';
    detail = 'Yükselenler ağır basıyor; seçici alımlar destekleniyor.';
  } else if (value >= 45) {
    label = 'Nötr / Dengeli';
    detail = 'Piyasa yön arıyor; fırsatlar hisse bazlı.';
  } else if (value >= 30) {
    label = 'Dip Bölgesi Toparlanma';
    detail = 'Zayıf seyirde toparlanma sinyalleri aranıyor.';
  } else {
    label = 'Ayı Baskısı';
    detail = 'Satış baskısı belirgin; pozisyon boyutuna dikkat.';
  }

  return { value, label, detail, bistBreadth, cryptoMomentum };
}

export interface WealthProjectionYear {
  year: number;
  value: number;
  contributed: number;
}

export interface WealthProjection {
  finalValue: number;
  totalContributed: number;
  totalGain: number;
  years: WealthProjectionYear[];
}

/** Compound growth + optional monthly contribution (DRIP-style reinvestment) */
export function projectWealth(input: {
  principal: number;
  annualReturnPct: number;
  monthlyContribution: number;
  years?: number;
}): WealthProjection {
  const years = input.years ?? 3;
  const rMonthly = input.annualReturnPct / 100 / 12;
  let value = Math.max(0, input.principal);
  let contributed = value;
  const out: WealthProjectionYear[] = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = value * (1 + rMonthly) + Math.max(0, input.monthlyContribution);
      contributed += Math.max(0, input.monthlyContribution);
    }
    out.push({
      year: y,
      value,
      contributed,
    });
  }

  return {
    finalValue: value,
    totalContributed: contributed,
    totalGain: value - contributed,
    years: out,
  };
}
