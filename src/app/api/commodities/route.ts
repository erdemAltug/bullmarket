import { NextResponse } from 'next/server';
import { fetchCommodities } from '@/lib/api/commodities';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await fetchCommodities();
    return NextResponse.json({
      success: true,
      data: { items },
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Commodities fetch failed',
      },
      { status: 502 }
    );
  }
}
