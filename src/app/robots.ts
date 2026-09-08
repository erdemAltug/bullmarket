import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';

/**
 * Public market/SEO surfaces must stay crawlable.
 * Private account + auth API only are blocked.
 */
export default function robots(): MetadataRoute.Robots {
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
          '/targets',
          '/firsatlar',
          '/signals',
          '/terminal',
          '/faiz',
          '/fon',
          '/blog',
          '/egitim',
          '/sitemap.xml',
          '/sitemap-main.xml',
          '/sitemap-bist.xml',
          '/sitemap-nasdaq.xml',
          '/sitemap-crypto.xml',
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
      `${SITE_URL}/sitemap-main.xml`,
      `${SITE_URL}/sitemap-bist.xml`,
      `${SITE_URL}/sitemap-nasdaq.xml`,
      `${SITE_URL}/sitemap-crypto.xml`,
    ],
    host: SITE_URL,
  };
}
