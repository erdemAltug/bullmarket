import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Hacim ve Balina Takibi',
  description:
    'BİST kurumsal hacim ilgi proxy ve kripto balina işlemleri — Bullsye.',
  alternates: withLangAlternates('/whales'),
  openGraph: {
    title: 'Balina & Takas | Bullsye',
    url: `${SITE_URL}/whales`,
  },
  robots: { index: false, follow: true },
};

export default function SmartMoneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
