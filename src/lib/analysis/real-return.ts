import { tufeIndexAt } from '@/lib/analysis/tr-tufe-index';
import type {
  RealReturnPoint,
  RealReturnSummary,
} from '@/lib/analysis/types';
import type { HistoricalPricePoint } from '@/types';

function nearestUsd(
  usdSeries: HistoricalPricePoint[],
  ts: number
): number | null {
  if (!usdSeries.length) return null;
  let best = usdSeries[0];
  let bestDiff = Math.abs(best.timestamp - ts);
  for (const p of usdSeries) {
    const d = Math.abs(p.timestamp - ts);
    if (d < bestDiff) {
      best = p;
      bestDiff = d;
    }
  }
  return best.price > 0 ? best.price : null;
}

/** TL / USD / TÜFE normalize edilmiş seri (başlangıç = 100). */
export function buildRealReturnSeries(
  stock: HistoricalPricePoint[],
  usdTry: HistoricalPricePoint[]
): { points: RealReturnPoint[]; summary: RealReturnSummary } {
  const weekly = stock.filter((_, i) => i % 5 === 0 || i === stock.length - 1);
  const base = weekly[0];
  if (!base || base.price <= 0) {
    return {
      points: [],
      summary: {
        principal: 10_000,
        stockEnd: 10_000,
        depositEnd: 10_000,
        goldProxyEnd: 10_000,
        realLossPctVsTufe: 0,
        stockReturnPct: 0,
        tufeReturnPct: 0,
        label: 'Yetersiz tarihsel veri',
      },
    };
  }

  const baseUsd = nearestUsd(usdTry, base.timestamp) ?? 1;
  const baseTufe = tufeIndexAt(base.timestamp);

  const points: RealReturnPoint[] = weekly.map((p) => {
    const usd = nearestUsd(usdTry, p.timestamp) ?? baseUsd;
    const tufe = tufeIndexAt(p.timestamp);
    const tryIdx = (p.price / base.price) * 100;
    const usdIdx = ((p.price / usd) / (base.price / baseUsd)) * 100;
    const tufeIdx = (tryIdx / (tufe / baseTufe));
    return {
      t: p.timestamp,
      try: Number(tryIdx.toFixed(2)),
      usd: Number(usdIdx.toFixed(2)),
      tufe: Number(tufeIdx.toFixed(2)),
    };
  });

  const last = weekly[weekly.length - 1];
  const lastTufe = tufeIndexAt(last.timestamp);
  const stockReturnPct = ((last.price / base.price) - 1) * 100;
  const tufeReturnPct = ((lastTufe / baseTufe) - 1) * 100;
  const years =
    (last.timestamp - base.timestamp) / (365.25 * 86_400_000);
  const depositRate = 0.45;
  const depositMult = Math.pow(1 + depositRate, Math.max(0.25, years));
  // Gold proxy: USDTRY appreciation as rough hard-asset proxy for TR investor
  const lastUsd = nearestUsd(usdTry, last.timestamp) ?? baseUsd;
  const usdApprec = lastUsd / baseUsd;
  const principal = 10_000;
  const stockEnd = principal * (last.price / base.price);
  const depositEnd = principal * depositMult;
  const goldProxyEnd = principal * usdApprec * 1.05;
  const realLossPctVsTufe = stockReturnPct - tufeReturnPct;

  const summary: RealReturnSummary = {
    principal,
    stockEnd: Math.round(stockEnd),
    depositEnd: Math.round(depositEnd),
    goldProxyEnd: Math.round(goldProxyEnd),
    realLossPctVsTufe: Number(realLossPctVsTufe.toFixed(1)),
    stockReturnPct: Number(stockReturnPct.toFixed(1)),
    tufeReturnPct: Number(tufeReturnPct.toFixed(1)),
    label: `Bu hisseye 1 dönem önce yatırılan ₺${principal.toLocaleString('tr-TR')}; mevduatta ~₺${Math.round(depositEnd).toLocaleString('tr-TR')}, kur/altın vekilinde ~₺${Math.round(goldProxyEnd).toLocaleString('tr-TR')}, bu hissede ~₺${Math.round(stockEnd).toLocaleString('tr-TR')} (TÜFE’ye göre ${realLossPctVsTufe >= 0 ? '+' : ''}${realLossPctVsTufe.toFixed(1)}%).`,
  };

  return { points, summary };
}
