import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';

const TROY_OZ_GRAMS = 31.1034768;

export interface CommodityQuote {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: 'TRY' | 'USD';
  unit?: string;
  yahooSymbol?: string;
}

const CACHE_KEY = 'commodities:live:v2';
const CACHE_TTL = 60;

/**
 * Live commodities via Yahoo:
 * GC=F gold, SI=F silver, BZ=F Brent, CL=F WTI, USDTRY=X.
 * Gram Altın (TRY) = (Gold oz USD / 31.1035) × USDTRY.
 */
export async function fetchCommodities(): Promise<CommodityQuote[]> {
  const hit = appCache.get<CommodityQuote[]>(CACHE_KEY);
  if (hit) return hit;

  const quotes = await fetchQuotes([
    'GC=F',
    'SI=F',
    'BZ=F',
    'CL=F',
    'USDTRY=X',
  ]);

  const by = new Map(quotes.map((q) => [q.symbol, q]));
  const gold = by.get('GC=F');
  const silver = by.get('SI=F');
  const brent = by.get('BZ=F');
  const wti = by.get('CL=F');
  const usdtry = by.get('USDTRY=X');

  const out: CommodityQuote[] = [];

  if (gold && usdtry && gold.price > 0 && usdtry.price > 0) {
    const gramTry = (gold.price / TROY_OZ_GRAMS) * usdtry.price;
    // Approximate gram change from gold % (USDTRY daily move secondary)
    const changePercent =
      gold.changePercent + (usdtry.changePercent ?? 0) * 0.35;
    out.push({
      symbol: 'ALTIN',
      name: 'Gram Altın',
      price: gramTry,
      changePercent,
      currency: 'TRY',
      unit: '₺/gr',
      yahooSymbol: 'GC=F',
    });
    out.push({
      symbol: 'XAU',
      name: 'Ons Altın',
      price: gold.price,
      changePercent: gold.changePercent,
      currency: 'USD',
      unit: '$/oz',
      yahooSymbol: 'GC=F',
    });
  }

  if (silver && silver.price > 0) {
    out.push({
      symbol: 'GUMUS',
      name: 'Gümüş (Ons)',
      price: silver.price,
      changePercent: silver.changePercent,
      currency: 'USD',
      unit: '$/oz',
      yahooSymbol: 'SI=F',
    });
  }

  if (silver && usdtry && silver.price > 0 && usdtry.price > 0) {
    const gramTry = (silver.price / TROY_OZ_GRAMS) * usdtry.price;
    const changePercent =
      silver.changePercent + (usdtry.changePercent ?? 0) * 0.35;
    out.push({
      symbol: 'GUMUS_GR',
      name: 'Gram Gümüş',
      price: gramTry,
      changePercent,
      currency: 'TRY',
      unit: '₺/gr',
      yahooSymbol: 'SI=F',
    });
  }

  if (brent && brent.price > 0) {
    out.push({
      symbol: 'BRENT',
      name: 'Brent Petrol',
      price: brent.price,
      changePercent: brent.changePercent,
      currency: 'USD',
      unit: '$/varil',
      yahooSymbol: 'BZ=F',
    });
  }

  if (wti && wti.price > 0) {
    out.push({
      symbol: 'WTI',
      name: 'WTI Petrol',
      price: wti.price,
      changePercent: wti.changePercent,
      currency: 'USD',
      unit: '$/varil',
      yahooSymbol: 'CL=F',
    });
  }

  if (usdtry && usdtry.price > 0) {
    out.push({
      symbol: 'USDTRY',
      name: 'USD/TRY',
      price: usdtry.price,
      changePercent: usdtry.changePercent,
      currency: 'TRY',
      unit: '₺',
      yahooSymbol: 'USDTRY=X',
    });
  }

  appCache.set(CACHE_KEY, out, CACHE_TTL);
  return out;
}
