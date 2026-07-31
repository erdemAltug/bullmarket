import { NextResponse } from 'next/server';
import { fetchKlines } from '@/lib/api/binance';
import { fetchHistory } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import { isChartTimeframe, type ChartTimeframe } from '@/lib/chart-timeframes';
import type { HistoricalPricePoint } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim();
  const source = (searchParams.get('source') ?? 'yahoo') as 'yahoo' | 'binance';
  const tfRaw = searchParams.get('timeframe') ?? '1D';

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: 'symbol is required' },
      { status: 400 }
    );
  }

  if (!isChartTimeframe(tfRaw)) {
    return NextResponse.json(
      { success: false, error: 'invalid timeframe' },
      { status: 400 }
    );
  }

  const timeframe = tfRaw as ChartTimeframe;
  const cacheKey = `history:${source}:${symbol}:${timeframe}`;
  const hit = appCache.get<HistoricalPricePoint[]>(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: { symbol, timeframe, points: hit },
      cached: true,
    });
  }

  try {
    const points =
      source === 'binance'
        ? await fetchKlines(symbol, timeframe)
        : await fetchHistory(symbol, timeframe);

    const ttl = timeframe === '1D' || timeframe === '5D' ? 30 : 120;
    appCache.set(cacheKey, points, ttl);

    return NextResponse.json({
      success: true,
      data: { symbol, timeframe, points },
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'History fetch failed',
      },
      { status: 502 }
    );
  }
}
