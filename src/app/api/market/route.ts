import { NextResponse } from 'next/server';
import { fetchCommodities } from '@/lib/api/commodities';
import { fetchMarketNews } from '@/lib/api/news';
import { fetchCryptoFearGreed } from '@/lib/api/sentiment';
import { getBistBoard, getLiveMarketItems } from '@/lib/market-live';
import type { ScannerItem } from '@/types/scanner';

export const revalidate = 10;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function cacheHeaders(sMaxAge: number, swr: number) {
  return {
    'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  };
}

/** List rows omit the empty sparkline array. Clients default it to []. */
function toLiteItem(item: ScannerItem) {
  return {
    symbol: item.symbol,
    displaySymbol: item.displaySymbol,
    name: item.name,
    price: item.price,
    changePercent: item.changePercent,
    volume: item.volume,
    volumeRaw: item.volumeRaw,
    category: item.category,
    market: item.market,
    currency: item.currency,
    chartSymbol: item.chartSymbol,
    chartSource: item.chartSource,
    dayHigh: item.dayHigh ?? null,
    dayLow: item.dayLow ?? null,
    trailingPE: item.trailingPE ?? null,
    fundStyle: item.fundStyle ?? null,
    portfolioSize: item.portfolioSize ?? null,
    investorCount: item.investorCount ?? null,
  };
}

function filterCategory(items: ScannerItem[], category: string | null) {
  if (!category) return items;
  const key = category.toUpperCase();
  if (key === 'FON_ETF') {
    return items.filter((item) => item.category === 'FON' || item.category === 'ETF');
  }
  return items.filter((item) => item.category === key);
}

/**
 * Live market aggregate.
 * `view=lite` sends one array (no duplicate markets/data copies, no sparkline).
 * `scope=all&category=BIST` is the full BİST board, cached apart from the 15s tape.
 * `extras=0` skips news for clients that only render prices.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const view = url.searchParams.get('view');
  const scope = url.searchParams.get('scope');
  const category = url.searchParams.get('category');
  const extras = url.searchParams.get('extras');
  const lite = view === 'lite';

  try {
    if (lite && scope === 'all' && category?.toUpperCase() === 'BIST') {
      const board = await getBistBoard();
      return NextResponse.json(
        {
          success: true,
          marketItems: board.items.map(toLiteItem),
          updatedAt: board.updatedAt,
          cached: board.cached,
        },
        { headers: cacheHeaders(30, 300) }
      );
    }

    const includeNews = extras !== '0';
    const [market, commodities, sentiment, news] = await Promise.all([
      getLiveMarketItems(),
      fetchCommodities().catch(() => []),
      fetchCryptoFearGreed().catch(() => null),
      includeNews ? fetchMarketNews(12).catch(() => []) : Promise.resolve([]),
    ]);

    const items = filterCategory(market.items, category);
    const sentimentBody = sentiment
      ? { value: sentiment.value, status: sentiment.status }
      : null;

    if (lite) {
      return NextResponse.json(
        {
          success: true,
          marketItems: items.map(toLiteItem),
          commodities,
          sentiment: sentimentBody,
          news: includeNews ? news : undefined,
          updatedAt: market.updatedAt,
          cached: market.cached,
        },
        { headers: cacheHeaders(10, 50) }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { items },
        markets: items,
        marketItems: items,
        commodities,
        sentiment: sentimentBody,
        news,
        updatedAt: market.updatedAt,
        cached: market.cached,
      },
      { headers: cacheHeaders(10, 50) }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live market data' },
      { status: 500 }
    );
  }
}
