import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BİST Isı Haritası — Sektör Performansı',
  description:
    'BİST sektör ısı haritası: günlük performans treemap. Ücretsiz canlı görünüm.',
};

export default function HeatmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
