import type { MetadataRoute } from 'next';
import { BLOG_POSTS, EDUCATION_LESSONS } from '@/content/academy';
import { sitemapLanguageAlternates } from '@/lib/seo/hreflang';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  SEO_CRYPTO_SYMBOLS,
  SEO_ETF_TICKERS,
  SEO_FX_PAIRS,
  SEO_TEFAS_CODES,
  SEO_US_TICKERS,
} from '@/lib/seo/symbols';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths = [
    '',
    '/tr',
    '/en',
    '/bist',
    '/bist/heatmap',
    '/us',
    '/fon',
    '/crypto',
    '/compare',
    '/signals',
    '/firsatlar',
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

  const us: MetadataRoute.Sitemap = SEO_US_TICKERS.map((symbol) => ({
    url: `${SITE_URL}/us/${symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
    alternates: sitemapLanguageAlternates(`/us/${symbol}`),
  }));

  const crypto: MetadataRoute.Sitemap = SEO_CRYPTO_SYMBOLS.map((symbol) => ({
    url: `${SITE_URL}/crypto/${symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
    alternates: sitemapLanguageAlternates(`/crypto/${symbol}`),
  }));

  const funds: MetadataRoute.Sitemap = [
    ...SEO_TEFAS_CODES,
    ...SEO_ETF_TICKERS,
  ].map((code) => ({
    url: `${SITE_URL}/fon/${code}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.88,
    alternates: sitemapLanguageAlternates(`/fon/${code}`),
  }));

  const fx: MetadataRoute.Sitemap = SEO_FX_PAIRS.map((pair) => ({
    url: `${SITE_URL}/fx/${pair}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.85,
    alternates: sitemapLanguageAlternates(`/fx/${pair}`),
  }));

  return [
    ...staticRoutes,
    ...egitim,
    ...blog,
    ...bist,
    ...us,
    ...crypto,
    ...funds,
    ...fx,
  ];
}
