import YahooFinance from 'yahoo-finance2';
import {
  periodStartFor,
  TIMEFRAME_CONFIG,
  type ChartTimeframe,
} from '@/lib/chart-timeframes';
import type { HistoricalPricePoint, Quote, StockFundamentals } from '@/types';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

function toQuote(raw: {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  marketState?: string;
  regularMarketPreviousClose?: number;
  marketCap?: number;
  regularMarketVolume?: number;
  trailingPE?: number;
}): Quote {
  return {
    symbol: raw.symbol ?? '',
    name: raw.shortName || raw.longName || raw.symbol || '',
    price: raw.regularMarketPrice ?? 0,
    change: raw.regularMarketChange ?? 0,
    changePercent: raw.regularMarketChangePercent ?? 0,
    currency: raw.currency ?? 'TRY',
    marketState: raw.marketState,
    previousClose: raw.regularMarketPreviousClose,
    marketCap: raw.marketCap,
    volume: raw.regularMarketVolume,
    trailingPE: raw.trailingPE,
  };
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const results = await yahooFinance.quote(symbols);
  const list = Array.isArray(results) ? results : [results];
  return list.map((item) => toQuote(item as Parameters<typeof toQuote>[0]));
}

export async function fetchHistory(
  symbol: string,
  timeframe: ChartTimeframe = '1D'
): Promise<HistoricalPricePoint[]> {
  const { yahooInterval } = TIMEFRAME_CONFIG[timeframe];
  const chart = await yahooFinance.chart(symbol, {
    period1: periodStartFor(timeframe),
    interval: yahooInterval,
  });

  return (chart.quotes ?? [])
    .filter((q) => q.close != null && q.date != null)
    .map((q) => ({
      timestamp: new Date(q.date).getTime(),
      price: q.close as number,
      volume: q.volume ?? undefined,
    }));
}

export async function fetchFundamentals(
  symbol: string
): Promise<StockFundamentals> {
  const [quote, summary, yearHist] = await Promise.all([
    yahooFinance.quote(symbol),
    yahooFinance.quoteSummary(symbol, {
      modules: [
        'summaryDetail',
        'defaultKeyStatistics',
        'financialData',
        'recommendationTrend',
      ],
    }),
    fetchHistory(symbol, '1Y').catch(() => [] as HistoricalPricePoint[]),
  ]);

  const q = Array.isArray(quote) ? quote[0] : quote;
  const detail = summary.summaryDetail;
  const stats = summary.defaultKeyStatistics;
  const fin = summary.financialData;
  const trend = summary.recommendationTrend?.trend?.[0];

  let yearReturn: number | null = null;
  if (yearHist.length >= 2) {
    const first = yearHist[0].price;
    const last = yearHist[yearHist.length - 1].price;
    if (first > 0) yearReturn = ((last - first) / first) * 100;
  }

  const price = q.regularMarketPrice ?? 0;

  return {
    symbol: q.symbol ?? symbol,
    name: q.shortName || q.longName || symbol,
    price,
    currency: q.currency ?? 'TRY',
    trailingPE: detail?.trailingPE ?? q.trailingPE ?? null,
    priceToBook: stats?.priceToBook ?? null,
    fiftyTwoWeekHigh: detail?.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: detail?.fiftyTwoWeekLow ?? null,
    returnOnEquity: fin?.returnOnEquity ?? null,
    marketCap: detail?.marketCap ?? stats?.marketCap ?? q.marketCap ?? null,
    beta: stats?.beta ?? null,
    dividendYield: detail?.dividendYield ?? null,
    earningsGrowth: fin?.earningsGrowth ?? null,
    yearReturn,
    analyst: {
      targetMean: fin?.targetMeanPrice ?? null,
      targetHigh: fin?.targetHighPrice ?? null,
      targetLow: fin?.targetLowPrice ?? null,
      recommendationKey: fin?.recommendationKey ?? null,
      strongBuy: trend?.strongBuy ?? 0,
      buy: trend?.buy ?? 0,
      hold: trend?.hold ?? 0,
      sell: trend?.sell ?? 0,
      strongSell: trend?.strongSell ?? 0,
    },
  };
}

export const DEFAULT_BIST_SYMBOLS = [
  'XU100.IS',
  'THYAO.IS',
  'GARAN.IS',
  'ASELS.IS',
  'EREGL.IS',
];

export const BIST30_SYMBOLS = [
  'AKBNK.IS',
  'ALARK.IS',
  'ARCLK.IS',
  'ASELS.IS',
  'ASTOR.IS',
  'BIMAS.IS',
  'BRSAN.IS',
  'DOAS.IS',
  'EKGYO.IS',
  'ENKAI.IS',
  'EREGL.IS',
  'FROTO.IS',
  'GARAN.IS',
  'GUBRF.IS',
  'HEKTS.IS',
  'ISCTR.IS',
  'KCHOL.IS',
  'KONTR.IS',
  'KOZAL.IS',
  'KRDMD.IS',
  'ODAS.IS',
  'PETKM.IS',
  'PGSUS.IS',
  'SAHOL.IS',
  'SASA.IS',
  'SISE.IS',
  'TAVHL.IS',
  'TCELL.IS',
  'THYAO.IS',
  'TOASO.IS',
  'TUPRS.IS',
  'ULKER.IS',
  'VESTL.IS',
  'YKBNK.IS',
];
