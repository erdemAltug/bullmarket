import type { MetadataRoute } from 'next';
import { BLOG_POSTS, EDUCATION_LESSONS } from '@/content/academy';
import { sitemapLanguageAlternates } from '@/lib/seo/hreflang';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  SEO_CRYPTO_SYMBOLS,
  SEO_FX_PAIRS,
} from '@/lib/seo/symbols';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    '',
    '/tr',
    '/en',
    '/bist',
    '/bist/heatmap',
    '/crypto',
    '/compare',
    '/signals',
    '/targets',
    '/smart-money',
    '/dividends',
    '/egitim',
    '/blog',
    '/fx/USD-TRY',
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency:
      path === '' || path === '/bist' || path === '/crypto' || path === '/tr' || path === '/en'
        ? ('always' as const)
        : path === '/egitim' || path === '/blog'
          ? ('weekly' as const)
          : ('hourly' as const),
    priority:
      path === '' || path === '/tr' || path === '/en'
        ? 1.0
        : path === '/egitim' || path === '/blog'
          ? 0.9
          : 0.8,
    alternates: sitemapLanguageAlternates(
      path === '/tr' || path === '/en' ? '' : path
    ),
  }));

  const egitim: MetadataRoute.Sitemap = EDUCATION_LESSONS.map((l) => ({
    url: `${SITE_URL}/egitim/${l.category}/${l.slug}`,
    lastModified: new Date(l.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
    alternates: sitemapLanguageAlternates(
      `/egitim/${l.category}/${l.slug}`
    ),
  }));

  const blog: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
    alternates: sitemapLanguageAlternates(`/blog/${p.slug}`),
  }));

  const bist: MetadataRoute.Sitemap = SEO_BIST_TICKERS.map((symbol) => ({
    url: `${SITE_URL}/bist/${symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
    alternates: sitemapLanguageAlternates(`/bist/${symbol}`),
  }));

  const crypto: MetadataRoute.Sitemap = SEO_CRYPTO_SYMBOLS.map((symbol) => ({
    url: `${SITE_URL}/crypto/${symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
    alternates: sitemapLanguageAlternates(`/crypto/${symbol}`),
  }));

  const fx: MetadataRoute.Sitemap = SEO_FX_PAIRS.map((pair) => ({
    url: `${SITE_URL}/fx/${pair}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.85,
    alternates: sitemapLanguageAlternates(`/fx/${pair}`),
  }));

  return [...staticRoutes, ...egitim, ...blog, ...bist, ...crypto, ...fx];
}
