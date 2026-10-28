import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/api/http';
import { searchUniverse } from '@/lib/market/universe';

export const runtime = 'nodejs';

/** GET /api/v1/search?q=asel → every stock, ETF, TEFAS fund and crypto pair that matches. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2 || q.length > 40) {
    return NextResponse.json({ success: true, data: [] }, { headers: cacheHeaders(3600) });
  }
  try {
    const data = await searchUniverse(q, 20);
    return NextResponse.json({ success: true, data }, { headers: cacheHeaders(600) });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'search failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
