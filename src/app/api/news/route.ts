import { cacheHeaders } from '@/lib/api/http';
﻿import { NextResponse } from 'next/server';
import { fetchMarketNews } from '@/lib/api/news';

export async function GET() {
  try {
    const items = await fetchMarketNews(24);
    return NextResponse.json({
      success: true,
      data: { items },
      cached: false,
    }, { headers: cacheHeaders(300) });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'News fetch failed',
      },
      { status: 502 }
    );
  }
}
