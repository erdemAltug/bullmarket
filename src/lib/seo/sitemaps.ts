import type { MetadataRoute } from 'next';
import { BLOG_POSTS, EDUCATION_LESSONS } from '@/content/academy';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  SEO_CRYPTO_SYMBOLS,
  SEO_ETF_TICKERS,
  SEO_FX_PAIRS,
  SEO_TEFAS_CODES,
  SEO_US_TICKERS,
} from '@/lib/seo/symbols';

const now = () => new Date();

function entry(
  path: string,
  opts: {
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: now(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

/** Static marketing + tools — no redirecting legacy paths */
export function buildMainSitemap(): MetadataRoute.Sitemap {
  const staticPaths: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }[] = [
    { path: '', changeFrequency: 'always', priority: 1 },
    { path: '/terminal', changeFrequency: 'hourly', priority: 0.85 },
    { path: '/tr', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/en', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/bist', changeFrequency: 'always', priority: 1 },
    { path: '/bist/heatmap', changeFrequency: 'hourly', priority: 0.85 },
    { path: '/nasdaq', changeFrequency: 'hourly', priority: 0.95 },
    { path: '/kripto', changeFrequency: 'hourly', priority: 0.95 },
    { path: '/fon', changeFrequency: 'daily', priority: 0.8 },
    { path: '/firsatlar', changeFrequency: 'hourly', priority: 1 },
    { path: '/targets', changeFrequency: 'hourly', priority: 1 },
    { path: '/signals', changeFrequency: 'hourly', priority: 0.85 },
    { path: '/whales', changeFrequency: 'hourly', priority: 0.7 },
    { path: '/dividends', changeFrequency: 'daily', priority: 0.75 },
    { path: '/faiz', changeFrequency: 'hourly', priority: 0.9 },
    { path: '/egitim', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/fx/USD-TRY', changeFrequency: 'hourly', priority: 0.85 },
    { path: '/kvkk', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/gizlilik', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/kosullar', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/yatirim-uyarisi', changeFrequency: 'monthly', priority: 0.4 },
  ];

  const staticRoutes = staticPaths.map((p) =>
    entry(p.path, {
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })
  );

  const egitim = EDUCATION_LESSONS.map((l) =>
    entry(`/egitim/${l.category}/${l.slug}`, {
      changeFrequency: 'monthly',
      priority: 0.85,
    })
  );

  const blog = BLOG_POSTS.map((p) =>
    entry(`/blog/${p.slug}`, {
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  );

  const funds = [...SEO_TEFAS_CODES, ...SEO_ETF_TICKERS].map((code) =>
    entry(`/fon/${code}`, { changeFrequency: 'daily', priority: 0.8 })
  );

  const fx = SEO_FX_PAIRS.map((pair) =>
    entry(`/fx/${pair}`, { changeFrequency: 'hourly', priority: 0.8 })
  );

  return [...staticRoutes, ...egitim, ...blog, ...funds, ...fx];
}

export function buildBistSitemap(): MetadataRoute.Sitemap {
  const symbols = SEO_BIST_TICKERS.filter((s) => !s.startsWith('XU'));
  const detail = symbols.map((symbol) =>
    entry(`/bist/${symbol}`, { changeFrequency: 'hourly', priority: 0.9 })
  );
  const targets = symbols.map((symbol) =>
    entry(`/bist/${symbol}/hedef-fiyat`, {
      changeFrequency: 'daily',
      priority: 0.95,
    })
  );
  return [...detail, ...targets];
}

export function buildNasdaqSitemap(): MetadataRoute.Sitemap {
  return SEO_US_TICKERS.map((symbol) =>
    entry(`/nasdaq/${symbol}`, { changeFrequency: 'hourly', priority: 0.9 })
  );
}

export function buildCryptoSitemap(): MetadataRoute.Sitemap {
  return SEO_CRYPTO_SYMBOLS.map((symbol) =>
    entry(`/kripto/${symbol}`, { changeFrequency: 'hourly', priority: 0.9 })
  );
}

export function sitemapEntriesToXml(
  entries: MetadataRoute.Sitemap
): string {
  const urls = entries
    .map((e) => {
      const lastmod =
        e.lastModified instanceof Date
          ? e.lastModified.toISOString()
          : e.lastModified
            ? String(e.lastModified)
            : new Date().toISOString();
      return `  <url>
    <loc>${e.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changeFrequency ?? 'weekly'}</changefreq>
    <priority>${e.priority ?? 0.5}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function sitemapIndexXml(): string {
  const files = [
    'sitemap-main.xml',
    'sitemap-bist.xml',
    'sitemap-nasdaq.xml',
    'sitemap-crypto.xml',
  ];
  const lastmod = new Date().toISOString();
  const body = files
    .map(
      (f) => `  <sitemap>
    <loc>${SITE_URL}/${f}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}
