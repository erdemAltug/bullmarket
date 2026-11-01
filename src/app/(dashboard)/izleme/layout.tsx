import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İzleme listem',
  description: 'Takip ettiğin hisse, kripto ve fonlar — canlı fiyat ve alarm.',
  robots: { index: false, follow: false },
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
