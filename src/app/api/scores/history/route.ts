import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { getScoreHistory } from '@/lib/score-scan';

export const runtime = 'nodejs';

const SYMBOL_RE = /^[A-Za-z0-9.^=\-]{1,20}$/;

/** GET /api/scores/history?symbol=THYAO.IS&days=90 — daily score series. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim() ?? '';
  const days = Math.min(365, Math.max(7, Number(searchParams.get('days')) || 90));
  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json({ success: false, error: 'invalid symbol' }, { status: 400 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, data: { symbol, points: [] } });
  }
  try {
    const points = await getScoreHistory(symbol, days);
    return NextResponse.json(
      { success: true, data: { symbol, points } },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'history unavailable' }, { status: 502 });
  }
}
