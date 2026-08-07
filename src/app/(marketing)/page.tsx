import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: {
    absolute: 'Bullsye - Canlı Borsa, Kripto & Yapay Zeka Analiz Terminali',
  },
  description:
    'BİST 100, NASDAQ ve Kripto piyasalarında yapay zeka sinyalleri, analist hedef fiyatları ve canlı borsa verileri. Ücretsiz canlı terminale hemen katılın.',
  keywords: [
    'canlı borsa',
    'bist 100',
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
    title: 'Bullsye - Hit The Market | AI Finansal Analiz Terminali',
    description:
      'BİST, NASDAQ ve Kripto varlıkları için canlı AI skorlaması ve analist konsensüsleri.',
    url: SITE_URL,
    siteName: 'Bullsye',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Bullsye — AI finansal analiz terminali',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bullsye - Hit The Market | AI Finansal Analiz Terminali',
    description:
      'BİST, NASDAQ ve Kripto varlıkları için canlı AI skorlaması ve analist konsensüsleri.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HomeLandingPage() {
  return <LandingPage />;
}
