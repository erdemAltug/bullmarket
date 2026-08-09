import { NextResponse } from 'next/server';
import { fetchTickers } from '@/lib/api/binance';
import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import { resolveSymbol } from '@/lib/symbol-resolve';
import type { MarketAssetQuote } from '@/types/market-asset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_TTL_SEC = 60;

type Params = { params: Promise<{ symbol: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { symbol: raw } = await params;
  const decoded = decodeURIComponent(raw ?? '').trim();
  if (!decoded) {
    return NextResponse.json(
      { success: false, error: 'symbol required' },
      { status: 400 }
    );
  }

  const resolved = resolveSymbol(decoded);
  const cacheKey = `market:asset:${resolved.market}:${(
    resolved.binance ??
    resolved.yahoo ??
    decoded
  ).toUpperCase()}`;

  const hit = appCache.get<MarketAssetQuote>(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: { ...hit, cached: true },
      cached: true,
    });
  }

  try {
    let quote: MarketAssetQuote;

    if (resolved.market === 'crypto' && resolved.binance) {
      const [ticker] = await fetchTickers([resolved.binance]);
      if (!ticker) throw new Error(`Crypto quote not found: ${resolved.binance}`);
      quote = {
        symbol: resolved.display,
        name: resolved.display,
        price: ticker.price,
        change: ticker.price * (ticker.changePercent / 100),
        changePercent: ticker.changePercent,
        currency: 'USDT',
        market: 'crypto',
        cached: false,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const yahoo = resolved.yahoo ?? decoded.toUpperCase();
      const [q] = await fetchQuotes([yahoo]);
      if (!q) throw new Error(`Quote not found: ${yahoo}`);
      quote = {
        symbol: resolved.display || q.symbol,
        name: q.name,
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
        currency: q.currency,
        market: resolved.market === 'bist' ? 'bist' : 'us',
        cached: false,
        updatedAt: new Date().toISOString(),
      };
    }

    appCache.set(cacheKey, quote, CACHE_TTL_SEC);
    return NextResponse.json({ success: true, data: quote });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Asset fetch failed',
      },
      { status: 502 }
    );
  }
}
