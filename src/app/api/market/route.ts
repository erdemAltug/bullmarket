import { NextResponse } from 'next/server';
import { getLiveMarketItems } from '@/lib/market-live';

export const revalidate = 10;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Live market aggregate (no mock):
 * - BİST + US + ETF via yahoo-finance2
 * - Crypto top pairs via Binance 24hr ticker
 * - TEFAS YAT funds via tefas.gov.tr public JSON API
 */
export async function GET() {
  try {
    const { items, cached, updatedAt } = await getLiveMarketItems();
    return NextResponse.json({
      success: true,
      data: { items },
      markets: items,
      updatedAt,
      cached,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live market data' },
      { status: 500 }
    );
  }
}
