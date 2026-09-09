import type { MetadataRoute } from 'next';
import { BLOG_POSTS, EDUCATION_LESSONS } from '@/content/academy';
import { buildComparePairs } from '@/lib/seo/compare-pairs';
import { SITEMAP_CHUNK_SIZE } from '@/lib/seo/matrix';
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

export function chunkEntries(
  entries: MetadataRoute.Sitemap,
  size = SITEMAP_CHUNK_SIZE
): MetadataRoute.Sitemap[] {
  if (entries.length === 0) return [[]];
  const chunks: MetadataRoute.Sitemap[] = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(entries.slice(i, i + size));
  }
  return chunks;
}

/** Static marketing + thematic hubs + tools */
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
    { path: '/bist/f-k-en-dusuk-hisseler', changeFrequency: 'daily', priority: 0.9 },
    {
      path: '/bist/yuksek-temettu-verenler-2026',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    { path: '/bist/halka-arz-takvimi', changeFrequency: 'daily', priority: 0.85 },
    { path: '/nasdaq', changeFrequency: 'hourly', priority: 0.95 },
    {
      path: '/nasdaq/yapay-zeka-hisseleri',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    { path: '/kripto', changeFrequency: 'hourly', priority: 0.95 },
    {
      path: '/kripto/balina-hareketleri-ve-trendler',
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    { path: '/karsilastir', changeFrequency: 'daily', priority: 0.9 },
    { path: '/compare', changeFrequency: 'weekly', priority: 0.7 },
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

/** 1 symbol × 4 matrix pages */
export function buildBistMatrixEntries(): MetadataRoute.Sitemap {
  const symbols = SEO_BIST_TICKERS.filter((s) => !s.startsWith('XU'));
  const out: MetadataRoute.Sitemap = [];
  for (const symbol of symbols) {
    out.push(
      entry(`/bist/${symbol}`, { changeFrequency: 'hourly', priority: 0.9 })
    );
    out.push(
      entry(`/bist/${symbol}/hedef-fiyat`, {
        changeFrequency: 'daily',
        priority: 0.95,
      })
    );
    out.push(
      entry(`/bist/${symbol}/temettu`, {
        changeFrequency: 'daily',
        priority: 0.88,
      })
    );
    out.push(
      entry(`/bist/${symbol}/bilanco`, {
        changeFrequency: 'daily',
        priority: 0.88,
      })
    );
  }
  return out;
}

/** @deprecated use shards — kept for backward URL */
export function buildBistSitemap(): MetadataRoute.Sitemap {
  return buildBistMatrixEntries();
}

export function buildBistSitemapChunks(): MetadataRoute.Sitemap[] {
  return chunkEntries(buildBistMatrixEntries());
}

export function buildNasdaqSitemap(): MetadataRoute.Sitemap {
  return SEO_US_TICKERS.map((symbol) =>
    entry(`/nasdaq/${symbol}`, { changeFrequency: 'hourly', priority: 0.9 })
  );
}

export function buildNasdaqSitemapChunks(): MetadataRoute.Sitemap[] {
  return chunkEntries(buildNasdaqSitemap());
}

export function buildCryptoSitemap(): MetadataRoute.Sitemap {
  return SEO_CRYPTO_SYMBOLS.map((symbol) =>
    entry(`/kripto/${symbol}`, { changeFrequency: 'hourly', priority: 0.9 })
  );
}

export function buildCompareSitemap(): MetadataRoute.Sitemap {
  return buildComparePairs().map((p) =>
    entry(`/karsilastir/${p.slug}`, {
      changeFrequency: 'weekly',
      priority: 0.82,
    })
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

export function sitemapShardFiles(): string[] {
  const bistN = Math.min(3, Math.max(1, buildBistSitemapChunks().length));
  const nasdaqN = Math.min(1, Math.max(1, buildNasdaqSitemapChunks().length));
  const files = ['sitemap-main.xml'];
  for (let i = 1; i <= bistN; i++) files.push(`sitemap-bist-${i}.xml`);
  for (let i = 1; i <= nasdaqN; i++) files.push(`sitemap-nasdaq-${i}.xml`);
  files.push('sitemap-crypto.xml', 'sitemap-karsilastir.xml');
  files.push('sitemap-bist.xml', 'sitemap-nasdaq.xml');
  return files;
}

export function sitemapIndexXml(): string {
  const lastmod = new Date().toISOString();
  const body = sitemapShardFiles()
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
