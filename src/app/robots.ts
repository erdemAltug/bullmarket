import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/auth/',
          '/api/auth/*',
          '/settings',
          '/settings/',
          '/portfolio',
          '/portfolio/',
          '/alerts',
          '/alerts/',
          '/portfolio-audit',
          '/portfolio-audit/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/auth/',
          '/portfolio',
          '/alerts',
          '/portfolio-audit',
          '/settings',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/auth/',
          '/portfolio',
          '/alerts',
          '/portfolio-audit',
          '/settings',
        ],
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
