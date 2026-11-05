import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db';
import { runScoreScan } from '@/lib/score-scan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Server-side score scan: latest scores + one history row per symbol per day. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'database not configured' }, { status: 503 });
  }
  try {
    const result = await runScoreScan();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'scan failed' },
      { status: 500 }
    );
  }
}
