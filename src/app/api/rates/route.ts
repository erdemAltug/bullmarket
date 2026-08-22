import { NextResponse } from 'next/server';
import { fetchRatesNews } from '@/lib/api/news';
import { fetchRatePoints } from '@/lib/api/rates';

export async function GET() {
  try {
    const [points, news] = await Promise.all([
      fetchRatePoints(),
      fetchRatesNews(16),
    ]);
    return NextResponse.json({
      success: true,
      data: { points, news },
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Rates fetch failed',
      },
      { status: 502 }
    );
  }
}
