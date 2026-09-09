import { BIST_SECTOR_PEERS } from '@/lib/sector-peers';
import { SEO_US_TICKERS } from '@/lib/seo/symbols';

export type CompareMarket = 'bist' | 'us';

export type ComparePair = {
  a: string;
  b: string;
  slug: string;
  market: CompareMarket;
  sectorTr?: string;
};

function normBist(s: string) {
  return s.toUpperCase().replace(/\.IS$/i, '');
}

function pairSlug(a: string, b: string) {
  const [x, y] = [a.toLowerCase(), b.toLowerCase()].sort();
  // Prefer focus-first order for SEO: lower alphabetical for stable canon
  return `${x}-vs-${y}`;
}

/** Sector peer cartesian (undirected) + curated US megacap pairs */
export function buildComparePairs(): ComparePair[] {
  const seen = new Set<string>();
  const out: ComparePair[] = [];

  function add(a: string, b: string, market: CompareMarket, sectorTr?: string) {
    if (a === b) return;
    const slug = pairSlug(a, b);
    if (seen.has(slug)) return;
    seen.add(slug);
    const [x, y] = slug.split('-vs-');
    out.push({
      a: x.toUpperCase(),
      b: y.toUpperCase(),
      slug,
      market,
      sectorTr,
    });
  }

  for (const [focus, group] of Object.entries(BIST_SECTOR_PEERS)) {
    const focusD = normBist(focus);
    for (const p of group.peers) {
      add(focusD, normBist(p), 'bist', group.sectorTr);
    }
    for (let i = 0; i < group.peers.length; i++) {
      for (let j = i + 1; j < group.peers.length; j++) {
        add(normBist(group.peers[i]), normBist(group.peers[j]), 'bist', group.sectorTr);
      }
    }
  }

  const usPairs: [string, string][] = [
    ['NVDA', 'AMD'],
    ['AAPL', 'MSFT'],
    ['GOOGL', 'META'],
    ['AMZN', 'TSLA'],
    ['QQQ', 'SPY'],
    ['SMH', 'SOXX'],
    ['JPM', 'BAC'],
    ['XOM', 'CVX'],
    ['KO', 'PEP'],
    ['COST', 'WMT'],
  ];
  for (const [a, b] of usPairs) {
    if (SEO_US_TICKERS.includes(a) && SEO_US_TICKERS.includes(b)) {
      add(a, b, 'us');
    } else {
      add(a, b, 'us');
    }
  }

  return out;
}

export function parseCompareSlug(raw: string): { a: string; b: string } | null {
  const m = raw.trim().toLowerCase().match(/^([a-z0-9]+)-vs-([a-z0-9]+)$/);
  if (!m) return null;
  return { a: m[1].toUpperCase(), b: m[2].toUpperCase() };
}

export function compareHref(a: string, b: string) {
  return `/karsilastir/${pairSlug(a, b)}`;
}
