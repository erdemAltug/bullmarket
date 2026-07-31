import { NextResponse } from 'next/server';
import { getEconomicCalendar } from '@/lib/economic-calendar';
import { appCache } from '@/lib/cache';

export async function GET() {
  const cacheKey = 'calendar:v1';
  const hit = appCache.get(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  const events = getEconomicCalendar();
  const payload = { events, generatedAt: new Date().toISOString() };
  appCache.set(cacheKey, payload, 600);
  return NextResponse.json({ success: true, data: payload });
}
