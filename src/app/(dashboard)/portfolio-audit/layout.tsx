import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Portföy Doktoru',
  description:
    'Portföy çeşitlendirme skoru, sektör riski, yıllık getiri projeksiyonu ve kur riski ölçeri.',
  robots: { index: false, follow: false },
};

export default function PortfolioAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
