import type { Metadata } from 'next';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';

const path = '/bist/heatmap';

export const metadata: Metadata = {
  title: { absolute: 'BİST Isı Haritası — Sektör Performansı | Bullsye' },
  description:
    'BİST sektör ısı haritası: günlük performans treemap. Ücretsiz canlı görünüm.',
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: 'BİST Isı Haritası | Bullsye',
    description: 'Sektör performansını tek bakışta görün.',
  },
};

export default function HeatmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
