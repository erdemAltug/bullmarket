import axios, { type AxiosInstance } from 'axios';
import {
  periodStartFor,
  TIMEFRAME_CONFIG,
  type ChartTimeframe,
} from '@/lib/chart-timeframes';
import type {
  CryptoTicker,
  HistoricalPricePoint,
  OrderBook,
  OrderBookLevel,
} from '@/types';

/** Market-data mirrors — api.binance.com often returns 451 in TR / some clouds */
const BINANCE_BASES = [
  'https://data-api.binance.vision/api/v3',
  'https://api1.binance.com/api/v3',
  'https://api2.binance.com/api/v3',
  'https://api3.binance.com/api/v3',
  'https://api4.binance.com/api/v3',
  'https://api.binance.com/api/v3',
] as const;

let preferredBase: string | null = null;

function createClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 12_000,
    headers: {
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (compatible; Bullsye/1.0; +https://bullsye.app)',
    },
  });
}

async function binanceGet<T>(
  path: string,
  params?: Record<string, string | number>
): Promise<T> {
  const bases = preferredBase
    ? [preferredBase, ...BINANCE_BASES.filter((b) => b !== preferredBase)]
    : [...BINANCE_BASES];

  let lastError: unknown;

  for (const base of bases) {
    try {
      const { data } = await createClient(base).get<T>(path, { params });
      preferredBase = base;
      return data;
    } catch (e) {
      lastError = e;
      const status = axios.isAxiosError(e) ? e.response?.status : undefined;
      // Retry on geo-blocks / upstream failures
      if (status === 451 || status === 403 || status === 418 || status === 429) {
        preferredBase = null;
        continue;
      }
      if (axios.isAxiosError(e) && !e.response) {
        preferredBase = null;
        continue;
      }
      throw e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Binance unreachable from all mirrors');
}

interface Binance24hr {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

function toTicker(raw: Binance24hr): CryptoTicker {
  return {
    symbol: raw.symbol,
    price: Number(raw.lastPrice),
    changePercent: Number(raw.priceChangePercent),
    high24h: Number(raw.highPrice),
    low24h: Number(raw.lowPrice),
    volume: Number(raw.volume),
    quoteVolume: Number(raw.quoteVolume),
  };
}

export async function fetchTickers(symbols: string[]): Promise<CryptoTicker[]> {
  const wanted = symbols.map((s) => s.toUpperCase());

  // Prefer scoped request (lighter + fewer geo quirks than full book)
  try {
    const data = await binanceGet<Binance24hr[]>('/ticker/24hr', {
      symbols: JSON.stringify(wanted),
    });
    return data.map(toTicker);
  } catch {
    /* fall through to full book filter */
  }

  const data = await binanceGet<Binance24hr[]>('/ticker/24hr');
  const set = new Set(wanted);
  return data.filter((t) => set.has(t.symbol)).map(toTicker);
}

function parseLevels(rows: [string, string][]): OrderBookLevel[] {
  return rows.map(([price, quantity]) => ({
    price: Number(price),
    quantity: Number(quantity),
  }));
}

export async function fetchOrderBook(
  symbol: string,
  limit = 10
): Promise<OrderBook> {
  const data = await binanceGet<{
    bids: [string, string][];
    asks: [string, string][];
  }>('/depth', { symbol: symbol.toUpperCase(), limit });

  return {
    symbol: symbol.toUpperCase(),
    bids: parseLevels(data.bids),
    asks: parseLevels(data.asks),
  };
}

/** Binance kline row: [openTime, open, high, low, close, ...] */
type KlineRow = [number, string, string, string, string, ...unknown[]];

export async function fetchKlines(
  symbol: string,
  timeframe: ChartTimeframe = '1D'
): Promise<HistoricalPricePoint[]> {
  const { binanceInterval } = TIMEFRAME_CONFIG[timeframe];
  const start = periodStartFor(timeframe).getTime();

  const data = await binanceGet<KlineRow[]>('/klines', {
    symbol: symbol.toUpperCase(),
    interval: binanceInterval,
    startTime: start,
    limit: 1000,
  });

  return data.map((row) => ({
    timestamp: row[0],
    price: Number(row[4]),
    volume: Number(row[5]),
  }));
}

export const DEFAULT_CRYPTO_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
];

export interface AggTradeRow {
  id: number;
  symbol: string;
  price: number;
  qty: number;
  quoteQty: number;
  time: number;
  isBuyerMaker: boolean;
}

/** Recent aggregated trades — filter client-side for large notional. */
export async function fetchAggTrades(
  symbol: string,
  limit = 200
): Promise<AggTradeRow[]> {
  const data = await binanceGet<
    {
      a: number;
      p: string;
      q: string;
      f: number;
      l: number;
      T: number;
      m: boolean;
    }[]
  >('/aggTrades', { symbol: symbol.toUpperCase(), limit });

  return data.map((t) => {
    const price = Number(t.p);
    const qty = Number(t.q);
    return {
      id: t.a,
      symbol: symbol.toUpperCase(),
      price,
      qty,
      quoteQty: price * qty,
      time: t.T,
      isBuyerMaker: t.m,
    };
  });
}

/** Large recent trades (default ≥ $250k — true $1M fills are rare in a short window). */
export async function fetchLargeCryptoTrades(
  symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  minNotionalUsd = 250_000
): Promise<AggTradeRow[]> {
  const batches = await Promise.all(
    symbols.map(async (sym) => {
      try {
        const trades = await fetchAggTrades(sym, 500);
        return trades.filter((t) => t.quoteQty >= minNotionalUsd);
      } catch {
        return [] as AggTradeRow[];
      }
    })
  );
  return batches.flat().sort((a, b) => b.time - a.time);
}
