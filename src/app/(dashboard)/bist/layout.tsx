import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BİST',
  description: 'Borsa İstanbul canlı fiyatlar, grafikler ve watchlist.',
};

export default function BistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
