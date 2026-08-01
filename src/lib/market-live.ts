import { fetchTickers } from '@/lib/api/binance';
import { fetchTefasLatest } from '@/lib/api/tefas';
import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';
import {
  ETF_META,
  SCANNER_BIST_SYMBOLS,
  SCANNER_CRYPTO_SYMBOLS,
  SCANNER_ETF_SYMBOLS,
  SCANNER_TEFAS_CODES,
  SCANNER_TEFAS_FUNDS,
  SCANNER_US_SYMBOLS,
  buildSparkline,
  formatVolumeDisplay,
} from '@/lib/scanner-universe';
import type { ScannerItem } from '@/types/scanner';

const CACHE_KEY = 'market:live:v3';
const CACHE_TTL_SEC = 10;

/** Aggregates BİST + US + ETF (Yahoo) + Crypto (Binance) + TEFAS FON. */
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

  const tefasMeta = new Map<string, (typeof SCANNER_TEFAS_FUNDS)[number]>(
    SCANNER_TEFAS_FUNDS.map((f) => [f.code, f])
  );

  const [bistQuotes, usQuotes, etfQuotes, cryptoTickers, tefasFunds] =
    await Promise.all([
      fetchQuotes([...SCANNER_BIST_SYMBOLS]).catch(() => []),
      fetchQuotes([...SCANNER_US_SYMBOLS]).catch(() => []),
      fetchQuotes([...SCANNER_ETF_SYMBOLS]).catch(() => []),
      fetchTickers([...SCANNER_CRYPTO_SYMBOLS]).catch(() => []),
      fetchTefasLatest(SCANNER_TEFAS_CODES, 'YAT').catch(() => []),
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
      dayHigh: q.dayHigh ?? null,
      dayLow: q.dayLow ?? null,
      trailingPE: q.trailingPE ?? null,
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
      dayHigh: q.dayHigh ?? null,
      dayLow: q.dayLow ?? null,
      trailingPE: q.trailingPE ?? null,
    });
  }

  for (const q of etfQuotes) {
    const meta = ETF_META[q.symbol as keyof typeof ETF_META];
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
  appCache.set(CACHE_KEY, items, CACHE_TTL_SEC);

  return {
    items,
    cached: false,
    updatedAt: new Date().toISOString(),
  };
}
