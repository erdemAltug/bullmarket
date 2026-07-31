import { NextResponse } from 'next/server';
import { fetchKlines } from '@/lib/api/binance';
import {
  BIST30_SYMBOLS,
  DEFAULT_BIST_SYMBOLS,
  fetchFundamentals,
  fetchHistory,
} from '@/lib/api/yahoo';
import { DEFAULT_CRYPTO_SYMBOLS } from '@/lib/api/binance';
import { appCache } from '@/lib/cache';
import {
  avgVolume,
  clamp,
  nearLow,
  rsi,
  sma,
  smaBounce,
  smaCrossover,
} from '@/lib/indicators';
import type { HistoricalPricePoint, SmartRadarCard } from '@/types';

function displayOf(symbol: string): string {
  return symbol.replace('.IS', '').replace('USDT', '');
}

async function candles(symbol: string): Promise<HistoricalPricePoint[]> {
  if (symbol.endsWith('USDT')) return fetchKlines(symbol, '1Y');
  return fetchHistory(symbol, '1Y');
}

async function scanSymbol(symbol: string): Promise<SmartRadarCard[]> {
  const cards: SmartRadarCard[] = [];
  const pts = await candles(symbol);
  if (pts.length < 60) return cards;

  const closes = pts.map((p) => p.price);
  const volumes = pts.map((p) => p.volume ?? 0);
  const price = closes[closes.length - 1];
  const rsiVal = rsi(closes, 14);
  const displaySymbol = displayOf(symbol);

  let low52: number | null = null;
  try {
    if (!symbol.endsWith('USDT')) {
      const f = await fetchFundamentals(symbol);
      low52 = f.fiftyTwoWeekLow;
    } else {
      low52 = Math.min(...closes);
    }
  } catch {
    low52 = Math.min(...closes);
  }

  // Dip: RSI < 30 + near 52w low
  if (rsiVal != null && rsiVal < 30 && low52 != null && nearLow(price, low52, 5)) {
    const conf = clamp(Math.round(85 + (30 - rsiVal)), 70, 96);
    cards.push({
      symbol,
      displaySymbol,
      kind: 'dip',
      tag: 'Aşırı Satımda',
      reason: `RSI ${rsiVal.toFixed(1)} aşırı satım bölgesinde ve fiyat 52h dibine %5 yakın — kısa vadeli tepki potansiyeli.`,
      confidence: conf,
      price,
      rsi: rsiVal,
    });
  }

  // Breakout: SMA50 cross up + volume 2x 10d avg
  const cross = smaCrossover(closes, 50);
  const volToday = volumes[volumes.length - 1] || 0;
  const volAvg10 = avgVolume(volumes.slice(0, -1), 10);
  if (cross === 'up' && volAvg10 && volToday >= volAvg10 * 2) {
    cards.push({
      symbol,
      displaySymbol,
      kind: 'breakout',
      tag: 'Hacimli Kırılım',
      reason: `Fiyat SMA50'yi yukarı kesti; bugünkü hacim 10 günlük ortalamanın ${(volToday / volAvg10).toFixed(1)} katı.`,
      confidence: clamp(Math.round(78 + Math.min(15, (volToday / volAvg10) * 3)), 72, 95),
      price,
      rsi: rsiVal,
    });
  }

  // SMA200 bounce
  if (smaBounce(closes, Math.min(200, closes.length - 1), 1.5)) {
    const ma = sma(closes, Math.min(200, closes.length));
    cards.push({
      symbol,
      displaySymbol,
      kind: 'sma200_bounce',
      tag: 'Trend Desteği',
      reason: `Fiyat ${ma ? `SMA200 (~${ma.toFixed(0)})` : 'uzun vadeli HO'} civarında tepki verdi — trend desteği testi.`,
      confidence: 74,
      price,
      rsi: rsiVal,
    });
  }

  return cards;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const custom = searchParams.get('symbols');

  const symbols = (
    custom
      ? custom.split(',').map((s) => s.trim()).filter(Boolean)
      : [
          ...DEFAULT_BIST_SYMBOLS.filter((s) => !s.includes('XU')),
          ...BIST30_SYMBOLS.slice(0, 6),
          ...DEFAULT_CRYPTO_SYMBOLS.slice(0, 3),
        ]
  )
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 10);

  const cacheKey = `smart-radar:${symbols.join(',')}`;
  const hit = appCache.get<SmartRadarCard[]>(cacheKey);
  if (hit) {
    return NextResponse.json({
      success: true,
      data: { cards: hit },
      cached: true,
    });
  }

  try {
    const batches = await Promise.all(
      symbols.map(async (s) => {
        try {
          return await scanSymbol(s);
        } catch {
          return [] as SmartRadarCard[];
        }
      })
    );

    const cards = batches
      .flat()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 12);

    appCache.set(cacheKey, cards, 180);
    return NextResponse.json({ success: true, data: { cards } });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Smart radar failed',
      },
      { status: 502 }
    );
  }
}
