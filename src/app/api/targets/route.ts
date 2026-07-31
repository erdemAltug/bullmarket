import { NextResponse } from 'next/server';
import { appCache } from '@/lib/cache';
import { fetchLiveAnalystTargets } from '@/lib/live-targets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'live:targets:v1';
  const hit = appCache.get(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: hit,
      cached: true,
    });
  }

  try {
    const items = await fetchLiveAnalystTargets();
    const payload = {
      items,
      updatedAt: new Date().toISOString(),
      source: 'yahoo-finance2',
    };
    appCache.set(cacheKey, payload, 300);
    return NextResponse.json({ success: true, data: payload });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error:
          e instanceof Error ? e.message : 'Live analyst targets failed',
      },
      { status: 502 }
    );
  }
}
