import type { Metadata } from 'next';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';

const path = '/bist/heatmap';

export const metadata: Metadata = {
  title: { absolute: 'BİST Isı Haritası — Sektör Performansı | Bullsye' },
  description:
    'Canlı BİST ısı haritası: sektörlere göre günlük yükselen ve düşen hisseler tek ekranda. Hisseye tıkla, analiz skoru ve hedef fiyatı aç. Ücretsiz.',
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: 'BİST Isı Haritası | Bullsye',
    description: 'Sektör performansını tek bakışta görün.',
    images: hubOgImages('Canlı BİST Isı Haritası', 'Sektörlere göre günlük performans tek bakışta'),
  },
};

export default function HeatmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
