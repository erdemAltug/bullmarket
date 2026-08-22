import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import type { RatePoint } from '@/types';

/** CBOE yield indices are quoted ×10 (e.g. 42.5 → %4.25). */
const CBOE_YIELD_X10 = new Set(['^IRX', '^FVX', '^TNX', '^TYX']);

const SERIES: {
  symbol: string;
  id: string;
  label: string;
  region: RatePoint['region'];
  kind: RatePoint['kind'];
}[] = [
  {
    symbol: '^IRX',
    id: 'us-tbill',
    label: 'ABD 13 haftalık T-bill',
    region: 'US',
    kind: 'yield',
  },
  {
    symbol: '^FVX',
    id: 'us-5y',
    label: 'ABD 5 yıl tahvil',
    region: 'US',
    kind: 'yield',
  },
  {
    symbol: '^TNX',
    id: 'us-10y',
    label: 'ABD 10 yıl tahvil',
    region: 'US',
    kind: 'yield',
  },
  {
    symbol: '^TYX',
    id: 'us-30y',
    label: 'ABD 30 yıl tahvil',
    region: 'US',
    kind: 'yield',
  },
  {
    symbol: 'EURUSD=X',
    id: 'eurusd',
    label: 'EUR / USD',
    region: 'EU',
    kind: 'fx',
  },
  {
    symbol: 'TRY=X',
    id: 'usdtry',
    label: 'USD / TRY',
    region: 'TR',
    kind: 'fx',
  },
];

export async function fetchRatePoints(): Promise<RatePoint[]> {
  const cacheKey = 'rates:yields:v1';
  const hit = appCache.get<RatePoint[]>(cacheKey);
  if (hit) return hit;

  const quotes = await fetchQuotes(SERIES.map((s) => s.symbol));
  const bySym = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

  const points: RatePoint[] = [];
  for (const spec of SERIES) {
    const q = bySym.get(spec.symbol.toUpperCase());
    if (!q || !Number.isFinite(q.price) || q.price === 0) continue;
    const value = CBOE_YIELD_X10.has(spec.symbol) ? q.price / 10 : q.price;
    points.push({
      id: spec.id,
      label: spec.label,
      region: spec.region,
      kind: spec.kind,
      value,
      changePercent: q.changePercent,
      unit: spec.kind === 'yield' ? '%' : 'FX',
      source: 'Yahoo Finance',
    });
  }

  appCache.set(cacheKey, points, 60);
  return points;
}
