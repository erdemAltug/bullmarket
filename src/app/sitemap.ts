import type { MetadataRoute } from 'next';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  SEO_CRYPTO_SYMBOLS,
  SEO_FX_PAIRS,
} from '@/lib/seo/symbols';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // High-priority core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/bist',
    '/bist/heatmap',
    '/crypto',
    '/portfolio',
    '/dividends',
    '/alerts',
    '/fx/USD-TRY',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency:
      path === '' || path === '/bist' || path === '/crypto'
        ? ('always' as const)
        : ('hourly' as const),
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Popular BİST & Crypto tickers — programmatic indexing
  const bist: MetadataRoute.Sitemap = SEO_BIST_TICKERS.map((symbol) => ({
    url: `${SITE_URL}/bist/${symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  const crypto: MetadataRoute.Sitemap = SEO_CRYPTO_SYMBOLS.map((symbol) => ({
    url: `${SITE_URL}/crypto/${symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  const fx: MetadataRoute.Sitemap = SEO_FX_PAIRS.map((pair) => ({
    url: `${SITE_URL}/fx/${pair}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...bist, ...crypto, ...fx];
}
