import { fetchTickers, fetchTopUsdtTickers } from '@/lib/api/binance';
import { fetchTefasLatest } from '@/lib/api/tefas';
import { fetchQuotes } from '@/lib/api/yahoo';
import { readThroughCache } from '@/lib/cache';
import { SEO_BIST_TICKERS, toYahooSymbol } from '@/lib/seo/symbols';
import {
  ETF_META,
  SCANNER_BIST_UNIQUE,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_ETF_SYMBOLS,
  SCANNER_TEFAS_CODES,
  SCANNER_TEFAS_FUNDS,
  SCANNER_US_UNIQUE,
  buildSparkline,
  formatVolumeDisplay,
} from '@/lib/scanner-universe';
import type { Quote } from '@/types';
import type { ScannerItem } from '@/types/scanner';

const CACHE_KEY = 'market:live:v5';
const BOARD_KEY = 'market:bist-board:v1';

function bistItemFromQuote(q: Quote): ScannerItem | null {
  if (!q.symbol || !(q.price > 0)) return null;
  const display = q.symbol.replace('.IS', '');
  const vol = q.volume ?? 0;
  return {
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
    dayHigh: q.dayHigh ?? null,
    dayLow: q.dayLow ?? null,
    trailingPE: q.trailingPE ?? null,
  };
}

/** Full BİST universe, separate from the 15s tape so the hot poll stays small. */
export async function getBistBoard(): Promise<{
  items: ScannerItem[];
  cached: boolean;
  updatedAt: string;
}> {
  const result = await readThroughCache({
    key: BOARD_KEY,
    freshSec: 60,
    staleSec: 600,
    load: loadBistBoard,
  });
  return {
    items: result.value,
    cached: result.cached,
    updatedAt: result.updatedAt,
  };
}

async function loadBistBoard(): Promise<ScannerItem[]> {
  const symbols = SEO_BIST_TICKERS.map((symbol) => toYahooSymbol(symbol));
  const width = Math.ceil(symbols.length / 3) || symbols.length;
  const groups = [0, 1, 2]
    .map((i) => symbols.slice(i * width, (i + 1) * width))
    .filter((group) => group.length > 0);

  const parts = await Promise.all(
    groups.map((group) => fetchQuotes(group).catch(() => [] as Quote[]))
  );

  const items: ScannerItem[] = [];
  for (const quote of parts.flat()) {
    const item = bistItemFromQuote(quote);
    if (item) items.push(item);
  }
  if (!items.length) throw new Error('BIST board empty');
  items.sort((a, b) => b.volumeRaw - a.volumeRaw);
  return items;
}

/** Aggregates BİST + US + ETF (Yahoo) + Crypto (Binance max) + TEFAS FON. */
export async function getLiveMarketItems(): Promise<{
  items: ScannerItem[];
  cached: boolean;
  updatedAt: string;
}> {
  const result = await readThroughCache({
    key: CACHE_KEY,
    freshSec: 15,
    staleSec: 90,
    load: loadLiveMarketItems,
  });
  return {
    items: result.value,
    cached: result.cached,
    updatedAt: result.updatedAt,
  };
}

async function loadLiveMarketItems(): Promise<ScannerItem[]> {
  const tefasMeta = new Map<string, (typeof SCANNER_TEFAS_FUNDS)[number]>(
    SCANNER_TEFAS_FUNDS.map((f) => [f.code, f])
  );

  const [bistQuotes, usQuotes, etfQuotes, cryptoTickers, tefasFunds] =
    await Promise.all([
      fetchQuotes(SCANNER_BIST_UNIQUE).catch(() => []),
      fetchQuotes(SCANNER_US_UNIQUE).catch(() => []),
      fetchQuotes([...SCANNER_ETF_SYMBOLS]).catch(() => []),
      fetchTopUsdtTickers({ minQuoteVolumeUsd: 400_000, limit: 200 }).catch(
        () => fetchTickers([...SCANNER_CRYPTO_SYMBOLS]).catch(() => [])
      ),
      fetchTefasLatest(SCANNER_TEFAS_CODES, 'YAT').catch(() => []),
    ]);

  const items: ScannerItem[] = [];

  for (const q of bistQuotes) {
    const item = bistItemFromQuote(q);
    if (item) items.push(item);
  }

  for (const q of usQuotes) {
    if (!q.symbol || !(q.price > 0)) continue;
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
      dayHigh: q.dayHigh ?? null,
      dayLow: q.dayLow ?? null,
      trailingPE: q.trailingPE ?? null,
    });
  }

  for (const q of etfQuotes) {
    if (!q.symbol || !(q.price > 0)) continue;
    const meta = ETF_META[q.symbol];
    items.push({
      symbol: q.symbol,
      displaySymbol: q.symbol,
      name: q.name || q.symbol,
      price: q.price,
      changePercent: q.changePercent,
      volume: formatVolumeDisplay((q.volume ?? 0) * (q.price || 1), 'USD'),
      volumeRaw: (q.volume ?? 0) * (q.price || 1),
      category: 'ETF',
      market: 'ETF',
      currency: 'USD',
      sparkline: buildSparkline(q.price, q.changePercent, q.symbol),
      chartSymbol: q.symbol,
      chartSource: 'yahoo',
      dayHigh: q.dayHigh ?? null,
      dayLow: q.dayLow ?? null,
      trailingPE: q.trailingPE ?? null,
      fundStyle: meta?.style ?? 'ABD ETF',
    });
  }

  for (const t of cryptoTickers) {
    if (!(t.price > 0)) continue;
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
      dayHigh: t.high24h,
      dayLow: t.low24h,
    });
  }

  for (const f of tefasFunds) {
    const meta = tefasMeta.get(f.code);
    const aum = f.portfolioSize ?? 0;
    items.push({
      symbol: `TEFAS:${f.code}`,
      displaySymbol: f.code,
      name: f.name,
      price: f.price,
      changePercent: f.changePercent,
      volume: formatVolumeDisplay(aum, 'TRY'),
      volumeRaw: aum,
      category: 'FON',
      market: 'TEFAS',
      currency: 'TRY',
      sparkline: [],
      chartSymbol: f.code,
      chartSource: 'tefas',
      dayHigh: null,
      dayLow: null,
      fundStyle: meta?.style ?? 'Yatırım Fonu',
      portfolioSize: f.portfolioSize,
      investorCount: f.investorCount,
    });
  }

  items.sort((a, b) => b.volumeRaw - a.volumeRaw);
  if (!items.length) throw new Error('Live market empty');
  return items;
}
