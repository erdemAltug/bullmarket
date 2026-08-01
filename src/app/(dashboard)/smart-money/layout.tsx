import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Hacim & Momentum Liderleri',
  description:
    'BİST ve kripto canlı hacim × momentum liderleri — Bullsye.',
  keywords: [
    'hacim liderleri',
    'momentum',
    'BİST hacim',
    'kripto volume',
  ],
  alternates: withLangAlternates('/smart-money'),
  openGraph: {
    title: 'Hacim & Momentum | Bullsye',
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
