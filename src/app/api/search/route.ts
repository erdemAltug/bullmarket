import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { appCache } from '@/lib/cache';
import { filterSymbolUniverse, type AssetMarket } from '@/lib/symbol-resolve';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface SearchHit {
  symbol: string;
  yahoo: string;
  name: string;
  market: AssetMarket;
  exchange: string;
}

function marketFromExchange(
  exchDisp?: string,
  symbol?: string
): AssetMarket {
  const ex = (exchDisp ?? '').toUpperCase();
  const sym = (symbol ?? '').toUpperCase();
  if (sym.endsWith('-USD') || sym.endsWith('USDT')) return 'crypto';
  if (ex.includes('IST') || sym.endsWith('.IS')) return 'bist';
  if (
    ex.includes('NASDAQ') ||
    ex.includes('NYSE') ||
    ex.includes('AMEX') ||
    ex === 'NMS' ||
    ex === 'NGM' ||
    ex === 'NYQ'
  ) {
    return 'us';
  }
  if (sym.endsWith('.IS')) return 'bist';
  return 'us';
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 1) {
    return NextResponse.json({
      success: true,
      data: filterSymbolUniverse('', 10).map(
        (p): SearchHit => ({
          symbol: p.symbol,
          yahoo:
            p.market === 'bist'
              ? `${p.symbol}.IS`
              : p.market === 'crypto'
                ? `${p.symbol}-USD`
                : p.symbol,
          name: p.label,
          market: p.market,
          exchange:
            p.market === 'bist'
              ? 'BİST'
              : p.market === 'crypto'
                ? 'Crypto'
                : 'NASDAQ',
        })
      ),
    });
  }

  const cacheKey = `search:${q.toUpperCase()}`;
  const hit = appCache.get<SearchHit[]>(cacheKey);
  if (hit) {
    return NextResponse.json({ success: true, data: hit, cached: true });
  }

  const local = filterSymbolUniverse(q, 8).map(
    (p): SearchHit => ({
      symbol: p.symbol,
      yahoo:
        p.market === 'bist'
          ? `${p.symbol}.IS`
          : p.market === 'crypto'
            ? `${p.symbol}-USD`
            : p.symbol,
      name: p.label,
      market: p.market,
      exchange:
        p.market === 'bist'
          ? 'BİST'
          : p.market === 'crypto'
            ? 'Crypto'
            : 'NASDAQ',
    })
  );

  let remote: SearchHit[] = [];
  try {
    const result = await yahooFinance.search(q, {
      quotesCount: 12,
      newsCount: 0,
    });
    remote = (result.quotes ?? [])
      .filter((row) => {
        const qt = (row as { quoteType?: string }).quoteType;
        return (
          qt === 'EQUITY' ||
          qt === 'ETF' ||
          qt === 'CRYPTOCURRENCY' ||
          !qt
        );
      })
      .map((row) => {
        const symbol = String(
          (row as { symbol?: string }).symbol ?? ''
        ).toUpperCase();
        const exchDisp = (row as { exchDisp?: string }).exchDisp;
        const market = marketFromExchange(exchDisp, symbol);
        const display = symbol
          .replace(/\.IS$/i, '')
          .replace(/-USD$/i, '')
          .replace(/USDT$/i, '');
        return {
          symbol: display,
          yahoo: symbol,
          name:
            (row as { shortname?: string; longname?: string }).shortname ||
            (row as { longname?: string }).longname ||
            display,
          market,
          exchange: exchDisp || (market === 'bist' ? 'BİST' : 'ABD'),
        } satisfies SearchHit;
      })
      .filter((r) => r.symbol.length > 0);
  } catch {
    remote = [];
  }

  const seen = new Set<string>();
  const merged: SearchHit[] = [];
  for (const item of [...local, ...remote]) {
    const key = `${item.market}:${item.yahoo}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= 15) break;
  }

  appCache.set(cacheKey, merged, 120);
  return NextResponse.json({ success: true, data: merged });
}
