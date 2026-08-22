import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finans Envanteri',
  description:
    'Hisse, nakit, mevduat ve alarm — senin bilançon. İndekslenmez.',
  robots: { index: false, follow: false },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
