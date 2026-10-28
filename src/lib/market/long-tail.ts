import 'server-only';
import { fetchTickers } from '@/lib/api/binance';
import { fetchQuotes } from '@/lib/api/yahoo';
import { appCache } from '@/lib/cache';

/**
 * Long-tail symbols: anything the data source actually knows, beyond the
 * curated SEO universe. Pages for these render on first visit (ISR) and stay
 * noindex until they earn a place in the curated list, so crawl budget is
 * not spent on thin pages.
 *
 * Lookups are cached for a day (misses for an hour) so a burst of requests
 * for an unknown ticker costs one upstream call, not one per request.
 */

const TICKER_RE = /^[A-Z0-9][A-Z0-9.\-]{0,14}$/;
const DAY = 86_400;

async function cachedExists(key: string, check: () => Promise<boolean>): Promise<boolean> {
  const hit = appCache.get<boolean>(key);
  if (hit !== undefined) return hit;
  let ok = false;
  try {
    ok = await check();
  } catch {
    // Upstream hiccup: don't 404 a real symbol for a whole day.
    appCache.set(key, false, 60);
    return false;
  }
  appCache.set(key, ok, ok ? DAY : 3600);
  return ok;
}

/** True when Yahoo returns a live price for this symbol (e.g. ASTOR.IS, PLTR). */
export function yahooSymbolExists(yahooSymbol: string): Promise<boolean> {
  const s = yahooSymbol.trim().toUpperCase();
  if (!TICKER_RE.test(s)) return Promise.resolve(false);
  return cachedExists(`lt:yahoo:${s}`, async () => {
    const [q] = await fetchQuotes([s]);
    return Boolean(q && q.price > 0);
  });
}

/** True when Binance lists this spot pair (e.g. PEPEUSDT). */
export function binancePairExists(pair: string): Promise<boolean> {
  const s = pair.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,15}USDT?$/.test(s)) return Promise.resolve(false);
  return cachedExists(`lt:binance:${s}`, async () => {
    const rows = await fetchTickers([s]);
    return rows.some((r) => r.price > 0);
  });
}
