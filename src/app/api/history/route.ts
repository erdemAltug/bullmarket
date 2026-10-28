import { NextResponse } from 'next/server';
import { fetchKlines } from '@/lib/api/binance';
import { fetchTefasHistory } from '@/lib/api/tefas';
import { fetchHistory } from '@/lib/api/yahoo';
import { readThroughCache } from '@/lib/cache';
import { cacheHeaders } from '@/lib/api/http';
import { isChartTimeframe, isIntraday, type ChartTimeframe } from '@/lib/chart-timeframes';

const SOURCES = new Set(['yahoo', 'binance', 'tefas']);
/** Tickers, Yahoo suffixes (.IS, -USD, =X, ^GSPC) and fund codes. */
const SYMBOL_RE = /^[A-Za-z0-9.^=\-]{1,20}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim() ?? '';
  const source = searchParams.get('source') ?? 'yahoo';
  const tfRaw = searchParams.get('timeframe') ?? '1D';

  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json({ success: false, error: 'invalid symbol' }, { status: 400 });
  }
  if (!SOURCES.has(source)) {
    return NextResponse.json({ success: false, error: 'invalid source' }, { status: 400 });
  }
  if (!isChartTimeframe(tfRaw)) {
    return NextResponse.json({ success: false, error: 'invalid timeframe' }, { status: 400 });
  }

  const timeframe = tfRaw as ChartTimeframe;
  // Intraday bars move every few minutes; daily+ bars barely change in an hour.
  const fresh = source === 'tefas' ? 3600 : isIntraday(timeframe) ? 30 : 600;

  try {
    const { value: points, updatedAt } = await readThroughCache({
      key: `history:v2:${source}:${symbol.toUpperCase()}:${timeframe}`,
      freshSec: fresh,
      staleSec: fresh * 10,
      load: () =>
        source === 'binance'
          ? fetchKlines(symbol, timeframe)
          : source === 'tefas'
            ? fetchTefasHistory(symbol, timeframe)
            : fetchHistory(symbol, timeframe),
    });

    return NextResponse.json(
      { success: true, data: { symbol, timeframe, points }, updatedAt },
      { headers: cacheHeaders(fresh) }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'History fetch failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
