import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { sitemapShardFiles } from '@/lib/seo/sitemaps';

/**
 * Public market/SEO surfaces must stay crawlable.
 * Private account + auth API only are blocked.
 */
export default function robots(): MetadataRoute.Robots {
  const shardAllows = sitemapShardFiles().map((f) => `/${f}`);
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/bist',
          '/bist/',
          '/nasdaq',
          '/nasdaq/',
          '/kripto',
          '/kripto/',
          '/karsilastir',
          '/karsilastir/',
          '/targets',
          '/firsatlar',
          '/signals',
          '/terminal',
          '/faiz',
          '/fon',
          '/blog',
          '/egitim',
          '/sitemap.xml',
          ...shardAllows,
        ],
        disallow: [
          '/api/',
          '/api/auth/',
          '/admin/',
          '/settings',
          '/settings/',
          '/portfolio',
          '/portfolio/',
          '/alerts',
          '/alerts/',
          '/portfolio-audit',
          '/portfolio-audit/',
          '/smart-money',
          '/smart-money/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings',
          '/portfolio',
          '/alerts',
          '/portfolio-audit',
          '/smart-money',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings',
          '/portfolio',
          '/alerts',
          '/portfolio-audit',
          '/smart-money',
        ],
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      ...sitemapShardFiles().map((f) => `${SITE_URL}/${f}`),
    ],
    host: SITE_URL,
  };
}
