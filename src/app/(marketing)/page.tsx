import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: {
    absolute:
      'Bullsye — BİST Canlı, AI Fırsat Skoru ve Analist Hedef Fiyatları (Ücretsiz)',
  },
  description:
    'Analist tavsiyeleri ve hedef fiyatları, BİST 100 canlı tarama, finansal okuryazarlık ve kişisel envanter. Ücretsiz — kayıt zorunlu değil.',
  keywords: [
    'analist tavsiyeleri ve hedef fiyatları',
    'analist hedef fiyat',
    'canlı borsa',
    'bist 100',
    'ai fırsat skoru',
    'ücretsiz bist analizi',
    'finansal okuryazarlık',
    'finansal özgürlük',
    'ai borsa sinyalleri',
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
    title: 'Bullsye — BİST Canlı, Fırsat Skoru ve Analist Hedef Fiyatları',
    description:
      'Analist tavsiyeleri ve hedef fiyatları, finansal okuryazarlık ve kişisel envanter. Ücretsiz — kayıt zorunlu değil.',
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
    title: 'Bullsye — BİST Canlı, Fırsat Skoru ve Analist Hedef Fiyatları',
    description:
      'Analist tavsiyeleri ve hedef fiyatları ile BİST fırsat skoru. Ücretsiz terminale katılın.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function HomeLandingPage() {
  return <LandingPage />;
}
