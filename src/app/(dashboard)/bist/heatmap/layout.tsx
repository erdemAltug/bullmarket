import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Isı Haritası',
  description: 'BİST sektör ısı haritası — günlük performans treemap.',
};

export default function HeatmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
