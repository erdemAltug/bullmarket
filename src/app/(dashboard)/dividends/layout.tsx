import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'BİST Temettü Takvimi & Verim Karnesi',
  description:
    'Borsa İstanbul temettü verimleri, ex-date, ödeme tarihleri ve temettü şampiyonları. Ücretsiz temettü takvimi — Bullsye.',
  keywords: [
    'temettü takvimi',
    'BİST temettü',
    'temettü verimi',
    'dividend calendar',
    'temettü hisseleri',
  ],
  alternates: withLangAlternates('/dividends'),
  openGraph: {
    title: 'Temettü Takvimi | Bullsye',
    description: 'BİST temettü verimleri ve yaklaşan ödemeler.',
    url: `${SITE_URL}/dividends`,
  },
};

export default function DividendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
