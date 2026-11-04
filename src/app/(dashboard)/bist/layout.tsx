import type { Metadata } from 'next';
import { hubOgImages } from '@/lib/seo/og';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'BİST 100 Canlı Hisse Fiyatları ve Tarama',
  description:
    'BİST 100 canlı hisse fiyatları, tarama ve ısı haritası. Ücretsiz Borsa İstanbul kotasyonları ve hisse karnesi — Bullsye.',
  keywords: [
    'BİST canlı',
    'Borsa İstanbul',
    'hisse fiyatı',
    'BİST 100',
    'canlı borsa',
  ],
  alternates: withLangAlternates('/bist'),
  openGraph: {
    title: 'BİST 100 Canlı Hisse Fiyatları | Bullsye',
    url: `${SITE_URL}/bist`,
    images: hubOgImages('BİST 100 Canlı Hisse Fiyatları', 'Her hisseye 0–100 analiz skoru, tarama ve alarm'),
  },
};

export default function BistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
