import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { fetchTickers } from '@/lib/api/binance';
import { appCache } from '@/lib/cache';
import {
  auditPortfolioWeights,
  fallbackSector,
  type AuditHolding,
  type LiveHoldingMetrics,
} from '@/lib/portfolio-audit';
import {
  normalizeYieldPct,
  resolveSymbol,
  type AssetMarket,
} from '@/lib/symbol-resolve';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function fetchEquityMetrics(
  display: string,
  yahoo: string,
  market: AssetMarket
): Promise<LiveHoldingMetrics> {
  const cacheKey = `audit-metric:${yahoo}`;
  const hit = appCache.get<LiveHoldingMetrics>(cacheKey);
  if (hit) return { ...hit, display };

  try {
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(yahoo),
      yahooFinance.quoteSummary(yahoo, {
        modules: [
          'summaryDetail',
          'defaultKeyStatistics',
          'assetProfile',
          'price',
        ],
      }),
    ]);
    const q = Array.isArray(quote) ? quote[0] : quote;
    const detail = summary.summaryDetail;
    const stats = summary.defaultKeyStatistics;
    const profile = summary.assetProfile;
    const priceMod = summary.price;

    const sectorRaw =
      profile?.sector ||
      profile?.industry ||
      priceMod?.quoteType ||
      null;
    const sector =
      typeof sectorRaw === 'string' && sectorRaw.length
        ? sectorRaw
        : fallbackSector(display, yahoo, market);

    const betaRaw = stats?.beta ?? stats?.beta3YearAverage ?? null;
    const beta =
      typeof betaRaw === 'number' && Number.isFinite(betaRaw)
        ? betaRaw
        : market === 'us'
          ? 1.1
          : 1;

    const metrics: LiveHoldingMetrics = {
      symbol: display,
      display,
      yahoo,
      market,
      name: q.shortName || q.longName || display,
      price: q.regularMarketPrice ?? null,
      currency: q.currency ?? null,
      beta,
      dividendYieldPct: normalizeYieldPct(detail?.dividendYield ?? null),
      sector,
      pe: detail?.trailingPE ?? q.trailingPE ?? null,
      marketCap: detail?.marketCap ?? q.marketCap ?? null,
      ok: Boolean(q.regularMarketPrice != null || q.symbol),
    };
    appCache.set(cacheKey, metrics, 180);
    return metrics;
  } catch (e) {
    return {
      symbol: display,
      display,
      yahoo,
      market,
      name: display,
      price: null,
      currency: null,
      beta: market === 'crypto' ? 1.65 : 1,
      dividendYieldPct: 0,
      sector: fallbackSector(display, yahoo, market),
      pe: null,
      marketCap: null,
      ok: false,
      error: e instanceof Error ? e.message : 'Yahoo fetch failed',
    };
  }
}

async function fetchCryptoMetrics(
  display: string,
  binance: string,
  yahoo: string | null
): Promise<LiveHoldingMetrics> {
  const cacheKey = `audit-metric:${binance}`;
  const hit = appCache.get<LiveHoldingMetrics>(cacheKey);
  if (hit) return { ...hit, display };

  let price: number | null = null;
  let ok = false;
  let err: string | undefined;

  try {
    const [ticker] = await fetchTickers([binance]);
    if (ticker) {
      price = ticker.price;
      ok = true;
    }
  } catch (e) {
    err = e instanceof Error ? e.message : 'Binance fetch failed';
  }

  // Optional Yahoo crypto (BTC-USD) for beta if available
  let beta: number | null = 1.65;
  let name = display;
  if (yahoo) {
    try {
      const summary = await yahooFinance.quoteSummary(yahoo, {
        modules: ['defaultKeyStatistics', 'price'],
      });
      beta = summary.defaultKeyStatistics?.beta ?? 1.65;
      name =
        summary.price?.shortName ||
        summary.price?.longName ||
        display;
    } catch {
      /* keep defaults */
    }
  }

  const metrics: LiveHoldingMetrics = {
    symbol: display,
    display,
    yahoo,
    market: 'crypto',
    name,
    price,
    currency: 'USDT',
    beta,
    dividendYieldPct: 0,
    sector: 'Kripto',
    pe: null,
    marketCap: null,
    ok,
    error: ok ? undefined : err ?? 'Binance ticker not found',
  };
  if (ok) appCache.set(cacheKey, metrics, 60);
  return metrics;
}

async function metricsForHolding(
  h: AuditHolding
): Promise<LiveHoldingMetrics> {
  const resolved = resolveSymbol(h.yahoo || h.symbol);
  const market = h.market ?? resolved.market;
  const display = (h.symbol || resolved.display).toUpperCase();

  if (market === 'crypto' && resolved.binance) {
    return fetchCryptoMetrics(display, resolved.binance, resolved.yahoo);
  }

  // Try explicit yahoo, then BİST .IS fallback if US lookup fails for Turkish tickers
  const primary = h.yahoo || resolved.yahoo;
  if (!primary) {
    return {
      symbol: display,
      display,
      yahoo: null,
      market,
      name: display,
      price: null,
      currency: null,
      beta: 1,
      dividendYieldPct: 0,
      sector: fallbackSector(display, null, market),
      pe: null,
      marketCap: null,
      ok: false,
      error: 'No Yahoo symbol',
    };
  }

  let metrics = await fetchEquityMetrics(display, primary, market);
  if (
    !metrics.ok &&
    market === 'us' &&
    !primary.endsWith('.IS') &&
    !primary.includes('-')
  ) {
    const bistTry = await fetchEquityMetrics(
      display,
      `${display}.IS`,
      'bist'
    );
    if (bistTry.ok) return bistTry;
  }
  return metrics;
}

export async function POST(request: Request) {
  let body: { holdings?: AuditHolding[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const holdings = (body.holdings ?? [])
    .filter((h) => h?.symbol && Number(h.weight) > 0)
    .slice(0, 25);

  if (!holdings.length) {
    return NextResponse.json(
      { success: false, error: 'holdings required' },
      { status: 400 }
    );
  }

  try {
    const liveMetrics = await Promise.all(
      holdings.map((h) => metricsForHolding(h))
    );
    const report = auditPortfolioWeights(holdings, liveMetrics);
    return NextResponse.json({
      success: true,
      data: report,
      live: true,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Audit failed',
      },
      { status: 502 }
    );
  }
}
