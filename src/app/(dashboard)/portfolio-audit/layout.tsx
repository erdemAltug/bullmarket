import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portföy Sağlık Tarama',
  description: 'Portföy risk ve çeşitlendirme analizi.',
  robots: { index: false, follow: false },
};

export default function PortfolioAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
