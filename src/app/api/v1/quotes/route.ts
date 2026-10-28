import { NextResponse } from 'next/server';
import { fetchTickers } from '@/lib/api/binance';
import { cacheHeaders } from '@/lib/api/http';
import { fetchQuotes } from '@/lib/api/yahoo';
import { readThroughCache } from '@/lib/cache';
import type { CryptoTicker, Quote } from '@/types';

export const runtime = 'nodejs';

const MAX = 60;
const SYMBOL_RE = /^[A-Z0-9.^=\-]{1,20}$/;

export interface V1Quote {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: string;
  source: 'yahoo' | 'binance';
}

/**
 * GET /api/v1/quotes?symbols=THYAO.IS,AAPL,BTCUSDT
 * One request for a whole watchlist. Yahoo symbols are fetched in batches,
 * Binance pairs (…USDT) in one call; the combined answer is cached for 15 s
 * in memory and at the CDN, so many viewers of the same list share one fetch.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('symbols') ?? '';
  const symbols = [
    ...new Set(
      raw
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => SYMBOL_RE.test(s))
    ),
  ]
    .slice(0, MAX)
    .sort();

  if (!symbols.length) {
    return NextResponse.json({ success: false, error: 'symbols required' }, { status: 400 });
  }

  const crypto = symbols.filter((s) => /USDT$/.test(s));
  const yahoo = symbols.filter((s) => !/USDT$/.test(s));

  try {
    const { value } = await readThroughCache({
      key: `v1:quotes:${symbols.join(',')}`,
      freshSec: 15,
      staleSec: 120,
      load: async () => {
        const [y, c]: [Quote[], CryptoTicker[]] = await Promise.all([
          yahoo.length ? fetchQuotes(yahoo).catch((): Quote[] => []) : Promise.resolve<Quote[]>([]),
          crypto.length
            ? fetchTickers(crypto).catch((): CryptoTicker[] => [])
            : Promise.resolve<CryptoTicker[]>([]),
        ]);
        const out: V1Quote[] = [
          ...y.map((q) => ({
            symbol: q.symbol,
            name: q.name,
            price: q.price,
            changePercent: q.changePercent,
            currency: q.currency,
            source: 'yahoo' as const,
          })),
          ...c.map((t) => ({
            symbol: t.symbol,
            name: t.symbol.replace(/USDT$/, ''),
            price: t.price,
            changePercent: t.changePercent,
            currency: 'USDT',
            source: 'binance' as const,
          })),
        ];
        return out;
      },
    });
    return NextResponse.json({ success: true, data: value }, { headers: cacheHeaders(15, 120) });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'quotes failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
