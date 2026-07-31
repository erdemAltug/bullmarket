import { fetchTickers } from '@/lib/api/binance';
import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import {
  SCANNER_BIST_SYMBOLS,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_US_SYMBOLS,
  buildSparkline,
  formatVolumeDisplay,
} from '@/lib/scanner-universe';
import type { ScannerItem } from '@/types/scanner';

const CACHE_KEY = 'market:live:v1';
const CACHE_TTL_SEC = 15;

/** Aggregates BİST (Yahoo) + Crypto (Binance mirrors) + US (Yahoo) with 15s cache. */
export async function getLiveMarketItems(): Promise<{
  items: ScannerItem[];
  cached: boolean;
  updatedAt: string;
}> {
  const hit = appCache.get<ScannerItem[]>(CACHE_KEY);
  if (hit) {
    return {
      items: hit,
      cached: true,
      updatedAt: new Date().toISOString(),
    };
  }

  const [bistQuotes, usQuotes, cryptoTickers] = await Promise.all([
    fetchQuotes([...SCANNER_BIST_SYMBOLS]).catch(() => []),
    fetchQuotes([...SCANNER_US_SYMBOLS]).catch(() => []),
    fetchTickers([...SCANNER_CRYPTO_SYMBOLS]).catch(() => []),
  ]);

  const items: ScannerItem[] = [];

  for (const q of bistQuotes) {
    const display = q.symbol.replace('.IS', '');
    const vol = q.volume ?? 0;
    items.push({
      symbol: q.symbol,
      displaySymbol: display,
      name: q.name || display,
      price: q.price,
      changePercent: q.changePercent,
      volume: formatVolumeDisplay(vol * (q.price || 1), 'TRY'),
      volumeRaw: vol * (q.price || 1),
      category: 'BIST',
      market: 'BIST',
      currency: 'TRY',
      sparkline: buildSparkline(q.price, q.changePercent, q.symbol),
      chartSymbol: q.symbol,
      chartSource: 'yahoo',
    });
  }

  for (const q of usQuotes) {
    items.push({
      symbol: q.symbol,
      displaySymbol: q.symbol,
      name: q.name || q.symbol,
      price: q.price,
      changePercent: q.changePercent,
      volume: formatVolumeDisplay((q.volume ?? 0) * (q.price || 1), 'USD'),
      volumeRaw: (q.volume ?? 0) * (q.price || 1),
      category: 'US',
      market: 'NASDAQ',
      currency: 'USD',
      sparkline: buildSparkline(q.price, q.changePercent, q.symbol),
      chartSymbol: q.symbol,
      chartSource: 'yahoo',
    });
  }

  for (const t of cryptoTickers) {
    const display = t.symbol.replace('USDT', '');
    items.push({
      symbol: t.symbol,
      displaySymbol: display,
      name: `${display} / USDT`,
      price: t.price,
      changePercent: t.changePercent,
      volume: formatVolumeDisplay(t.quoteVolume, 'USD'),
      volumeRaw: t.quoteVolume,
      category: 'CRYPTO',
      market: 'BINANCE',
      currency: 'USD',
      sparkline: buildSparkline(t.price, t.changePercent, t.symbol),
      chartSymbol: t.symbol,
      chartSource: 'binance',
    });
  }

  items.sort((a, b) => b.volumeRaw - a.volumeRaw);
  appCache.set(CACHE_KEY, items, CACHE_TTL_SEC);

  return {
    items,
    cached: false,
    updatedAt: new Date().toISOString(),
  };
}
