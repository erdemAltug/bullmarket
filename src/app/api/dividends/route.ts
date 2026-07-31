import { NextResponse } from 'next/server';
import { BIST_DIVIDEND_CALENDAR } from '@/lib/dividends';
import { appCache } from '@/lib/cache';

export async function GET() {
  const cacheKey = 'dividends:calendar';
  const hit = appCache.get(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  const events = [...BIST_DIVIDEND_CALENDAR].sort(
    (a, b) => +new Date(a.exDate) - +new Date(b.exDate)
  );
  const payload = { events, generatedAt: new Date().toISOString() };
  appCache.set(cacheKey, payload, 600);
  return NextResponse.json({ success: true, data: payload });
}
