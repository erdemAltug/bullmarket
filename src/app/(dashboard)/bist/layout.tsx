import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'BİST Canlı Hisse Fiyatları & Analiz',
  description:
    'Borsa İstanbul canlı fiyatlar, grafikler, ısı haritası ve hisse analiz karneleri. THYAO, GARAN, ASELS ve daha fazlası — Bullsye.',
  keywords: [
    'BİST canlı',
    'Borsa İstanbul',
    'hisse fiyatı',
    'BİST 100',
    'canlı borsa',
  ],
  alternates: withLangAlternates('/bist'),
  openGraph: {
    title: 'BİST Canlı | Bullsye',
    url: `${SITE_URL}/bist`,
  },
};

export default function BistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
