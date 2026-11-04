import { SITE_URL } from '@/lib/seo/symbols';

/** Share card for hub pages (title + one line), rendered by /api/og?type=hub. */
export function hubOgImages(title: string, subtitle: string) {
  const qs = new URLSearchParams({ type: 'hub', t: title, s: subtitle });
  return [
    {
      url: `${SITE_URL}/api/og?${qs.toString()}`,
      width: 1200,
      height: 630,
      alt: title,
    },
  ];
}
