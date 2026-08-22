import { fetchQuotes } from '@/lib/api/yahoo';
import { buildPotentialCards } from '@/lib/ai-opportunity';
import { getLiveMarketItems } from '@/lib/market-live';
import { appCache } from '@/lib/cache';

export type SeoTopRow = {
  symbol: string;
  score: number;
  href: string | null;
  changePercent: number;
};

export type SeoSnapshot = {
  xu100Price: number | null;
  xu100Change: number | null;
  top: SeoTopRow[];
  asOf: string;
};

const SNAP_KEY = 'seo:snapshot:v1';

export async function getIndexQuote(): Promise<{
  price: number | null;
  change: number | null;
}> {
  try {
    const [q] = await fetchQuotes(['XU100.IS']);
    if (!q || !(q.price > 0)) return { price: null, change: null };
    return { price: q.price, change: q.changePercent };
  } catch {
    return { price: null, change: null };
  }
}

export async function getSeoSnapshot(): Promise<SeoSnapshot> {
  const hit = appCache.get<SeoSnapshot>(SNAP_KEY);
  if (hit) return hit;

  const [{ items, updatedAt }, index] = await Promise.all([
    getLiveMarketItems(),
    getIndexQuote(),
  ]);
  const cards = buildPotentialCards(items, 5);
  const xu = items.find(
    (i) => i.displaySymbol === 'XU100' || i.symbol.includes('XU100')
  );

  const snap: SeoSnapshot = {
    xu100Price: index.price ?? xu?.price ?? null,
    xu100Change: index.change ?? xu?.changePercent ?? null,
    top: cards.map((c) => ({
      symbol: c.displaySymbol,
      score: c.score,
      href: c.href,
      changePercent: c.changePercent,
    })),
    asOf: updatedAt,
  };

  appCache.set(SNAP_KEY, snap, 60);
  return snap;
}
