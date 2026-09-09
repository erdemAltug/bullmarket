import { NextResponse } from 'next/server';
import { buildSymbolAnalysisBundle } from '@/lib/analysis/build-bundle';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';
import { appCache } from '@/lib/cache';
import { toYahooSymbol } from '@/lib/seo/symbols';

const TTL_SEC = 86_400;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('symbol')?.trim();
  if (!raw) {
    return NextResponse.json(
      { success: false, error: 'symbol required' },
      { status: 400 }
    );
  }

  const yahoo = toYahooSymbol(raw.toUpperCase());
  const cacheKey = `analysis:symbol:${yahoo}`;
  const hit = appCache.get<SymbolAnalysisBundle>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const data = await buildSymbolAnalysisBundle(yahoo);
    appCache.set(cacheKey, data, TTL_SEC);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Analysis build failed',
      },
      { status: 502 }
    );
  }
}
