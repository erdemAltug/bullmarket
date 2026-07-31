import { NextResponse } from 'next/server';

/**
 * Live economic calendar feed is not wired yet.
 * Returning empty avoids showing fabricated TCMB/CPI dates to users.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      events: [],
      live: false,
      generatedAt: new Date().toISOString(),
      notice:
        'Canlı ekonomik takvim henüz bağlanmadı — uydurma tarihler gösterilmiyor.',
    },
  });
}
