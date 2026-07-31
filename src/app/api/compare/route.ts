import { NextResponse } from 'next/server';
import { fetchFundamentals } from '@/lib/api/yahoo';
import { fetchKlines } from '@/lib/api/binance';
import { appCache } from '@/lib/cache';
import type { CompareMetrics } from '@/types';

async function metricsFor(symbol: string): Promise<CompareMetrics> {
  if (symbol.endsWith('USDT')) {
    const pts = await fetchKlines(symbol, '1Y');
    const price = pts[pts.length - 1]?.price ?? 0;
    let yearReturn: number | null = null;
    if (pts.length >= 2 && pts[0].price > 0) {
      yearReturn =
        ((pts[pts.length - 1].price - pts[0].price) / pts[0].price) * 100;
    }
    return {
      symbol,
      name: symbol.replace('USDT', ''),
      price,
      trailingPE: null,
      priceToBook: null,
      yearReturn,
      earningsGrowth: null,
      beta: null,
      dividendYield: null,
    };
  }

  const f = await fetchFundamentals(symbol);
  return {
    symbol: f.symbol,
    name: f.name,
    price: f.price,
    trailingPE: f.trailingPE,
    priceToBook: f.priceToBook,
    yearReturn: f.yearReturn,
    earningsGrowth: f.earningsGrowth,
    beta: f.beta,
    dividendYield: f.dividendYield,
  };
}

export async function GET(request: Request) {
  const symbols =
    new URL(request.url).searchParams
      .get('symbols')
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3) ?? [];

  if (symbols.length < 2) {
    return NextResponse.json(
      { success: false, error: 'En az 2 sembol gerekli' },
      { status: 400 }
    );
  }

  const cacheKey = `compare:${symbols.join(',')}`;
  const hit = appCache.get<CompareMetrics[]>(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: { items: hit },
      cached: true,
    });
  }

  try {
    const items = await Promise.all(symbols.map(metricsFor));
    appCache.set(cacheKey, items, 300);
    return NextResponse.json({ success: true, data: { items } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Compare failed',
      },
      { status: 502 }
    );
  }
}
