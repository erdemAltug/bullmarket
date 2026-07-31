import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Döviz Kurları',
  description: 'USD, EUR, GBP ve altın canlı kurları.',
};

export default function FxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
