import { NextResponse } from 'next/server';
import { appCache } from '@/lib/cache';
import { DEFAULT_FX_CODES, fetchFxRates } from '@/lib/api/tcmb';
import type { FxRate } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codesParam = searchParams.get('codes');

  const codes =
    codesParam?.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean) ??
    DEFAULT_FX_CODES;

  const cacheKey = `fx:rates:${codes.join(',')}`;
  const hit = appCache.get<{ rates: FxRate[]; updatedAt: string }>(cacheKey);

  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const data = await fetchFxRates(codes);
    appCache.set(cacheKey, data, 60);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'FX fetch failed',
      },
      { status: 502 }
    );
  }
}
