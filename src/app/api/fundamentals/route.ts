import { NextResponse } from 'next/server';
import { fetchFundamentals } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import type { StockFundamentals } from '@/types';

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get('symbol')?.trim();
  if (!symbol) {
    return NextResponse.json(
      { success: false, error: 'symbol is required' },
      { status: 400 }
    );
  }

  const cacheKey = `fundamentals:${symbol}`;
  const hit = appCache.get<StockFundamentals>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const data = await fetchFundamentals(symbol);
    appCache.set(cacheKey, data, 300);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Fundamentals fetch failed',
      },
      { status: 502 }
    );
  }
}
