import { NextResponse } from 'next/server';
import { getLiveMarketItems } from '@/lib/market-live';

/** Next.js route segment: ISR-style revalidation hint (15s) */
export const revalidate = 15;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Free live market aggregate:
 * - BİST + US via yahoo-finance2
 * - Crypto via Binance public mirrors (451-safe failover)
 */
export async function GET() {
  try {
    const { items, cached, updatedAt } = await getLiveMarketItems();
    return NextResponse.json({
      success: true,
      data: { items },
      /** Spec-compatible flat alias */
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
