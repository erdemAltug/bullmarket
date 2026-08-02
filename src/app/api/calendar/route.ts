import { NextResponse } from 'next/server';
import { fetchEconomicCalendar } from '@/lib/api/calendar';

export async function GET() {
  try {
    const events = await fetchEconomicCalendar();
    return NextResponse.json({
      success: true,
      data: {
        events,
        live: true,
        generatedAt: new Date().toISOString(),
        source: 'forex-factory-week',
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Calendar fetch failed',
        data: {
          events: [],
          live: false,
          generatedAt: new Date().toISOString(),
          notice: 'Ekonomik takvim geçici olarak alınamadı.',
        },
      },
      { status: 502 }
    );
  }
}
