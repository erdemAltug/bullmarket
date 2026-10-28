import 'server-only';
import YahooFinance from 'yahoo-finance2';
import { fetchTopUsdtTickers } from '@/lib/api/binance';
import { postInfo, type TefasFundKind, type TefasFundRow } from '@/lib/api/tefas';
import { readThroughCache } from '@/lib/cache';
import type { MarketAsset } from '@/types/market-asset';

/**
 * Full, free asset universe for search:
 *  - every TEFAS fund (yatırım, emeklilik, borsa yatırım fonu)
 *  - every Binance USDT spot pair with any volume
 *  - any stock / ETF Yahoo Finance can find (BIST + US + global)
 *
 * Lists are refreshed twice a day and served from memory, so a keystroke
 * costs one in-memory scan plus, at most, one cached Yahoo search.
 */

const yahoo = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const HALF_DAY = 12 * 3600;

function lastWeekdays(n: number): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < n) {
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

export async function getTefasFunds(): Promise<MarketAsset[]> {
  const { value } = await readThroughCache({
    key: 'universe:tefas:v1',
    freshSec: HALF_DAY,
    staleSec: HALF_DAY * 4,
    load: async () => {
      const byCode = new Map<string, MarketAsset>();
      const kinds: TefasFundKind[] = ['YAT', 'EMK', 'BYF'];
      for (const kind of kinds) {
        let rows: TefasFundRow[] = [];
        for (const day of lastWeekdays(5)) {
          rows = await postInfo(kind, day, day).catch(() => []);
          if (rows.length) break;
        }
        for (const r of rows) {
          if (byCode.has(r.code)) continue;
          byCode.set(r.code, {
            symbol: r.code,
            name: r.name,
            exchange: kind === 'EMK' ? 'TEFAS · Emeklilik' : kind === 'BYF' ? 'TEFAS · BYF' : 'TEFAS',
            category: 'fon',
            logo: null,
            quoteId: r.code,
            href: `/fon/${r.code}`,
          });
        }
      }
      return [...byCode.values()];
    },
  });
  return value;
}

export async function getCryptoPairs(): Promise<MarketAsset[]> {
  const { value } = await readThroughCache({
    key: 'universe:binance:v1',
    freshSec: HALF_DAY,
    staleSec: HALF_DAY * 4,
    load: async () => {
      const tickers = await fetchTopUsdtTickers({ minQuoteVolumeUsd: 1, limit: 5000 });
      return tickers.map((t): MarketAsset => {
        const base = t.symbol.replace(/USDT$/, '');
        return {
          symbol: base,
          name: base,
          exchange: 'Binance',
          category: 'crypto',
          logo: null,
          quoteId: t.symbol,
          href: `/kripto/${t.symbol}`,
        };
      });
    },
  });
  return value;
}

type YahooQuoteRow = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchange?: string;
  exchDisp?: string;
};

const US_EXCHANGES = new Set(['NMS', 'NGM', 'NCM', 'NYQ', 'ASE', 'PCX', 'BTS', 'NYS', 'NAS']);

function fromYahoo(row: YahooQuoteRow): MarketAsset | null {
  const sym = (row.symbol ?? '').toUpperCase();
  if (!sym) return null;
  const name = row.shortname || row.longname || sym;
  const qt = row.quoteType;
  if (qt !== 'EQUITY' && qt !== 'ETF') return null;

  if (sym.endsWith('.IS')) {
    const s = sym.replace(/\.IS$/, '');
    return { symbol: s, name, exchange: 'BİST', category: 'bist', logo: null, quoteId: sym, href: `/bist/${s}` };
  }
  if (US_EXCHANGES.has(row.exchange ?? '') || !sym.includes('.')) {
    if (qt === 'ETF') {
      return { symbol: sym, name, exchange: row.exchDisp || 'ETF', category: 'etf', logo: null, quoteId: sym, href: `/fon/${sym}` };
    }
    return { symbol: sym, name, exchange: row.exchDisp || 'ABD', category: 'us', logo: null, quoteId: sym, href: `/nasdaq/${sym}` };
  }
  // Other exchanges (LSE, XETRA…) have no page yet.
  return null;
}

export async function searchYahoo(q: string): Promise<MarketAsset[]> {
  const { value } = await readThroughCache({
    key: `universe:yahoo:${q.toUpperCase()}`,
    freshSec: 3600,
    staleSec: 86_400,
    load: async () => {
      const res = await yahoo.search(q, { quotesCount: 15, newsCount: 0 });
      return ((res.quotes ?? []) as unknown as YahooQuoteRow[])
        .map(fromYahoo)
        .filter((a): a is MarketAsset => a != null);
    },
  });
  return value;
}

function within(p: Promise<MarketAsset[]>, ms: number): Promise<MarketAsset[]> {
  return Promise.race([
    p.catch((): MarketAsset[] => []),
    new Promise<MarketAsset[]>((resolve) => setTimeout(() => resolve([]), ms)),
  ]);
}

function rank(a: MarketAsset, q: string): number {
  const s = a.symbol.toUpperCase();
  const n = a.name.toLocaleUpperCase('tr-TR');
  if (s === q) return 0;
  if (s.startsWith(q)) return 1;
  if (n.startsWith(q)) return 2;
  if (n.includes(q)) return 3;
  return 4;
}

/** Search every source, best matches first, de-duplicated. */
export async function searchUniverse(raw: string, limit = 20): Promise<MarketAsset[]> {
  const q = raw.trim().toLocaleUpperCase('tr-TR');
  if (q.length < 2) return [];

  // The fund and crypto lists load once (cold start ~5 s). Don't make the
  // first searcher wait: answer with what's ready, the load keeps going.
  const [funds, crypto, stocks] = await Promise.all([
    within(getTefasFunds(), 1500),
    within(getCryptoPairs(), 1500),
    within(searchYahoo(raw.trim()), 4000),
  ]);

  const local = [...funds, ...crypto].filter((a) => rank(a, q) < 4);
  const seen = new Set<string>();
  const out: MarketAsset[] = [];
  for (const a of [...stocks, ...local].sort((x, y) => rank(x, q) - rank(y, q))) {
    const key = `${a.category}:${a.symbol}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
    if (out.length >= limit) break;
  }
  return out;
}
