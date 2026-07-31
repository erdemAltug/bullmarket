import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portföyüm',
  description: 'Portföy değeri, P&L ve sağlık kontrolü.',
  robots: { index: false, follow: false },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
