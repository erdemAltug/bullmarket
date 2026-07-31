import { NextResponse } from 'next/server';
import { BIST30_SYMBOLS, fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import type { Quote } from '@/types';

export async function GET() {
  const cacheKey = 'bist:heatmap:30';
  const hit = appCache.get<Quote[]>(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: { quotes: hit },
      cached: true,
    });
  }

  try {
    const quotes = await fetchQuotes(BIST30_SYMBOLS);
    appCache.set(cacheKey, quotes, 30);
    return NextResponse.json({ success: true, data: { quotes } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Heatmap fetch failed',
      },
      { status: 502 }
    );
  }
}
