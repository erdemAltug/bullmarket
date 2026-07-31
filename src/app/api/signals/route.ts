import { NextResponse } from 'next/server';
import { fetchHistory } from '@/lib/api/yahoo';
import { fetchKlines } from '@/lib/api/binance';
import { appCache } from '@/lib/cache';
import { rsi, sma, smaCrossover } from '@/lib/indicators';
import type { TradeSignal } from '@/types';

function displayOf(symbol: string): string {
  return symbol.replace('.IS', '').replace('USDT', '');
}

async function pricesFor(symbol: string): Promise<number[]> {
  if (symbol.endsWith('USDT')) {
    const pts = await fetchKlines(symbol, '6M');
    return pts.map((p) => p.price);
  }
  const pts = await fetchHistory(symbol, '6M');
  return pts.map((p) => p.price);
}

function signalsFrom(symbol: string, closes: number[]): TradeSignal[] {
  const out: TradeSignal[] = [];
  if (closes.length < 51) return out;

  const price = closes[closes.length - 1];
  const rsiVal = rsi(closes, 14);
  const sma50 = sma(closes, 50);
  const cross = smaCrossover(closes, 50);
  const displaySymbol = displayOf(symbol);

  if (rsiVal != null && rsiVal < 30) {
    out.push({
      symbol,
      displaySymbol,
      kind: 'rsi_oversold',
      label: 'Aşırı Satım / Fırsat (RSI < 30)',
      rsi: rsiVal,
      sma50,
      price,
    });
  } else if (rsiVal != null && rsiVal > 70) {
    out.push({
      symbol,
      displaySymbol,
      kind: 'rsi_overbought',
      label: 'Aşırı Alım (RSI > 70)',
      rsi: rsiVal,
      sma50,
      price,
    });
  }

  if (cross === 'up') {
    out.push({
      symbol,
      displaySymbol,
      kind: 'sma_cross_up',
      label: 'Alım Sinyali (SMA Crossover)',
      rsi: rsiVal,
      sma50,
      price,
    });
  } else if (cross === 'down') {
    out.push({
      symbol,
      displaySymbol,
      kind: 'sma_cross_down',
      label: 'Satım Sinyali (SMA Altı)',
      rsi: rsiVal,
      sma50,
      price,
    });
  }

  return out;
}

export async function GET(request: Request) {
  const symbolsParam = new URL(request.url).searchParams.get('symbols');
  const symbols =
    symbolsParam
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8) ?? [];

  if (!symbols.length) {
    return NextResponse.json(
      { success: false, error: 'symbols required' },
      { status: 400 }
    );
  }

  const cacheKey = `signals:${symbols.join(',')}`;
  const hit = appCache.get<TradeSignal[]>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: { signals: hit }, cached: true });
  }

  try {
    const batches = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const closes = await pricesFor(symbol);
          return signalsFrom(symbol, closes);
        } catch {
          return [] as TradeSignal[];
        }
      })
    );

    const signals = batches.flat();
    appCache.set(cacheKey, signals, 120);
    return NextResponse.json({ success: true, data: { signals } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Signals failed',
      },
      { status: 502 }
    );
  }
}
