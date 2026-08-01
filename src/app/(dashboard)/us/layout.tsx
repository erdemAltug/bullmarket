import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'NASDAQ & ABD Hisse Fiyatları | Bullsye',
  description:
    'NASDAQ ve NYSE canlı fiyatlar: AAPL, NVDA, TSLA, MSFT. Analist hedefi, grafik ve sağlık karnesi — Bullsye.',
  keywords: [
    'NASDAQ canlı',
    'ABD hisseleri',
    'AAPL fiyat',
    'NVDA canlı',
    'TSLA grafik',
    'US stocks',
  ],
  alternates: withLangAlternates('/us'),
  openGraph: {
    title: 'NASDAQ & ABD | Bullsye',
    url: `${SITE_URL}/us`,
  },
};

export default function UsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
