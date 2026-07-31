import axios from 'axios';
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

const binance = axios.create({
  baseURL: 'https://api.binance.com/api/v3',
  timeout: 10_000,
});

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
  const { data } = await binance.get<Binance24hr[]>('/ticker/24hr');
  const set = new Set(symbols.map((s) => s.toUpperCase()));
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
  const { data } = await binance.get<{
    bids: [string, string][];
    asks: [string, string][];
  }>('/depth', { params: { symbol: symbol.toUpperCase(), limit } });

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

  const { data } = await binance.get<KlineRow[]>('/klines', {
    params: {
      symbol: symbol.toUpperCase(),
      interval: binanceInterval,
      startTime: start,
      limit: 1000,
    },
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
