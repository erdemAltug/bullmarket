import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: {
    absolute: 'Bullsye - Canlı Borsa & AI Fırsat Radarı (Ücretsiz BİST Analizi)',
  },
  description:
    'BİST 100 ve Kripto varlıkları için 100 üzerinden canlı AI fırsat skorları, analist hedef fiyatları ve portföy risk taraması. Hemen ücretsiz terminale katılın.',
  keywords: [
    'canlı borsa',
    'bist 100',
    'ai fırsat skoru',
    'ücretsiz bist analizi',
    'hedef fiyatlar',
    'ai borsa sinyalleri',
    'kripto radar',
    'nasdaq hisseleri',
    'temettü karnesi',
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
    title: 'Bullsye - Canlı Borsa & AI Fırsat Radarı (Ücretsiz BİST Analizi)',
    description:
      'BİST 100 ve Kripto varlıkları için 100 üzerinden canlı AI fırsat skorları, analist hedef fiyatları ve portföy risk taraması. Hemen ücretsiz terminale katılın.',
    url: SITE_URL,
    siteName: 'Bullsye',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Bullsye — AI Fırsat Radarı ve canlı BİST terminali',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bullsye - Canlı Borsa & AI Fırsat Radarı (Ücretsiz BİST Analizi)',
    description:
      'BİST 100 ve Kripto için canlı AI fırsat skorları, analist hedefleri ve portföy risk taraması. Ücretsiz terminale katılın.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HomeLandingPage() {
  return <LandingPage />;
}
