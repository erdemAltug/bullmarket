import { NextResponse } from 'next/server';
import { appCache } from '@/lib/cache';
import {
  DEFAULT_BIST_SYMBOLS,
  fetchQuotes,
} from '@/lib/api/yahoo';
import type { Quote } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  const symbols =
    symbolsParam?.split(',').map((s) => s.trim()).filter(Boolean) ??
    DEFAULT_BIST_SYMBOLS;

  const cacheKey = `bist:quote:${symbols.join(',')}`;
  const hit = appCache.get<Quote[]>(cacheKey);

  if (hit) {
    return NextResponse.json({
      success: true,
      data: { quotes: hit },
      cached: true,
    });
  }

  try {
    const quotes = await fetchQuotes(symbols);
    appCache.set(cacheKey, quotes, 15);
    return NextResponse.json({ success: true, data: { quotes } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'BİST fetch failed',
      },
      { status: 502 }
    );
  }
}
