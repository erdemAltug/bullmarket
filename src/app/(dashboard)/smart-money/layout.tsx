import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Balina & Smart Money Takas Akışı',
  description:
    'BİST hisse net takas ve smart money hareketleri. Kurumsal alım/satım izleri — Bullsye.',
  keywords: ['smart money', 'net takas', 'balina hareketi', 'kurumsal alım'],
  alternates: withLangAlternates('/smart-money'),
  openGraph: {
    title: 'Smart Money | Bullsye',
    url: `${SITE_URL}/smart-money`,
  },
};

export default function SmartMoneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
