import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kripto',
  description: 'Binance canlı kripto fiyatları, order book ve grafikler.',
};

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
