import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Analist Hedef Fiyatları & Konsensüs',
  description:
    'BİST hisseleri için aracı kurum hedef fiyatları, potansiyel prim ve AL/TUT/SAT konsensüsü. TipRanks tarzı analist radar — Bullsye.',
  keywords: [
    'analist hedef fiyat',
    'hisse hedef fiyat',
    'kurum konsensüsü',
    'price targets',
    'stock analyst ratings',
  ],
  alternates: withLangAlternates('/targets'),
  openGraph: {
    title: 'Analist Hedef Fiyatları | Bullsye',
    description: 'Kurum hedefleri ve potansiyel prim oranları.',
    url: `${SITE_URL}/targets`,
  },
};

export default function TargetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
