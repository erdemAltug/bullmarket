import { NextResponse } from 'next/server';
import { appCache } from '@/lib/cache';
import {
  DEFAULT_CRYPTO_SYMBOLS,
  fetchOrderBook,
  fetchTickers,
} from '@/lib/api/binance';
import type { CryptoTicker, OrderBook } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  const orderbookSymbol = searchParams.get('orderbook');

  const symbols =
    symbolsParam?.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) ??
    DEFAULT_CRYPTO_SYMBOLS;

  const cacheKey = `crypto:tickers:${symbols.join(',')}:${orderbookSymbol ?? 'none'}`;
  const hit = appCache.get<{
    tickers: CryptoTicker[];
    orderbook?: OrderBook;
  }>(cacheKey);

  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  try {
    const tickers = await fetchTickers(symbols);
    const payload: { tickers: CryptoTicker[]; orderbook?: OrderBook } = {
      tickers,
    };

    if (orderbookSymbol) {
      payload.orderbook = await fetchOrderBook(orderbookSymbol, 10);
    }

    appCache.set(cacheKey, payload, 15);
    return NextResponse.json({ success: true, data: payload });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Crypto fetch failed',
      },
      { status: 502 }
    );
  }
}
