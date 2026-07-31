import { NextResponse } from 'next/server';
import { fetchHistory } from '@/lib/api/yahoo';
import { fetchKlines } from '@/lib/api/binance';
import { appCache } from '@/lib/cache';
import { rsi } from '@/lib/indicators';

async function closesFor(symbol: string): Promise<number[]> {
  if (symbol.endsWith('USDT')) {
    const pts = await fetchKlines(symbol, '6M');
    return pts.map((p) => p.price);
  }
  const pts = await fetchHistory(symbol, '6M');
  return pts.map((p) => p.price);
}

export async function GET(request: Request) {
  const symbols =
    new URL(request.url).searchParams
      .get('symbols')
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12) ?? [];

  if (!symbols.length) {
    return NextResponse.json(
      { success: false, error: 'symbols gerekli' },
      { status: 400 }
    );
  }

  const cacheKey = `rsi:${symbols.join(',')}`;
  const hit = appCache.get<{ symbol: string; rsi: number | null }[]>(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: { items: hit },
      cached: true,
    });
  }

  try {
    const items = await Promise.all(
      symbols.map(async (symbol) => {
        const closes = await closesFor(symbol);
        return { symbol, rsi: rsi(closes, 14) };
      })
    );
    appCache.set(cacheKey, items, 60);
    return NextResponse.json({ success: true, data: { items } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'RSI failed',
      },
      { status: 502 }
    );
  }
}
