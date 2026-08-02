import { NextResponse } from 'next/server';
import { fetchCommodities } from '@/lib/api/commodities';
import { fetchMarketNews } from '@/lib/api/news';
import { fetchCryptoFearGreed } from '@/lib/api/sentiment';
import { getLiveMarketItems } from '@/lib/market-live';

export const revalidate = 10;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Live market aggregate (no mock):
 * - BİST + US + ETF + TEFAS + crypto scanners
 * - Commodities (gold/silver/oil/USDTRY)
 * - Crypto Fear & Greed snapshot
 * - News headline snapshot
 * Economic calendar: GET /api/calendar (separate, slower feed)
 */
export async function GET() {
  try {
    const [market, commodities, sentiment, news] = await Promise.all([
      getLiveMarketItems(),
      fetchCommodities().catch(() => []),
      fetchCryptoFearGreed().catch(() => null),
      fetchMarketNews(12).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: { items: market.items },
      markets: market.items,
      marketItems: market.items,
      commodities,
      sentiment: sentiment
        ? { value: sentiment.value, status: sentiment.status }
        : null,
      news,
      updatedAt: market.updatedAt,
      cached: market.cached,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live market data' },
      { status: 500 }
    );
  }
}
