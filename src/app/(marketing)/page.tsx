import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: {
    absolute: 'Bullsye — BİST, NASDAQ ve Kripto Terminali',
  },
  description:
    'Skor taraması, analist hedef fiyatları ve kişisel envanter. Ücretsiz terminal.',
  keywords: [
    'analist hedef fiyat',
    'canlı borsa',
    'bist 100',
    'analiz skoru',
    'ücretsiz bist analizi',
    'temettü',
    'kripto',
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      ...rootHreflangLanguages(),
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    title: 'Bullsye — BİST · NASDAQ · Kripto',
    description: 'Skor, hedef fiyat ve envanter — tek terminal.',
    url: SITE_URL,
    siteName: 'Bullsye',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Bullsye terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bullsye — BİST · NASDAQ · Kripto',
    description: 'Skor, hedef fiyat ve envanter — tek terminal.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HomeLandingPage() {
  return <LandingPage />;
}
