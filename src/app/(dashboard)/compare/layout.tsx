import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: '1v1 Hisse & Kripto Kıyaslama',
  description:
    'İki hisse veya kriptoyu F/K, PD/DD, büyüme, beta ve temettü ile kafa kafaya karşılaştırın. Side-by-side benchmark motoru — Bullsye.',
  keywords: [
    'hisse karşılaştırma',
    'THYAO vs PGSUS',
    'stock comparison',
    'crypto compare',
    'F/K karşılaştırma',
  ],
  alternates: withLangAlternates('/compare'),
  openGraph: {
    title: '1v1 Varlık Kıyaslama | Bullsye',
    description: 'Temel ve teknik metriklerle yan yana benchmark.',
    url: `${SITE_URL}/compare`,
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
