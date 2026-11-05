import { NextResponse } from 'next/server';
import { readThroughCache } from '@/lib/cache';
import { fetchLiveAnalystTargets } from '@/lib/live-targets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Analyst targets take ~20s to build from scratch. The CDN keeps the last
 * response for 10 minutes and serves it stale for an hour while it refreshes,
 * so visitors never wait on a cold serverless instance.
 */
const CDN_HEADERS = {
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
};

export async function GET() {
  try {
    const { value, updatedAt, cached } = await readThroughCache({
      key: 'live:targets:v2',
      freshSec: 300,
      staleSec: 3600,
      load: fetchLiveAnalystTargets,
    });
    return NextResponse.json(
      {
        success: true,
        data: { items: value, updatedAt, source: 'yahoo-finance2' },
        cached,
      },
      { headers: CDN_HEADERS }
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Live analyst targets failed',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
