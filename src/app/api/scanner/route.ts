import { cacheHeaders } from '@/lib/api/http';
import { NextResponse } from 'next/server';
import { getLiveMarketItems } from '@/lib/market-live';

export const revalidate = 15;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { items, cached, updatedAt } = await getLiveMarketItems();
    return NextResponse.json({
      success: true,
      data: { items },
      updatedAt,
      cached,
    }, { headers: cacheHeaders(15) });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Scanner fetch failed',
      },
      { status: 502 }
    );
  }
}
