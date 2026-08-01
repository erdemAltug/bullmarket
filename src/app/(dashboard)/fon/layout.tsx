import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: "TEFAS Fonlar & Küresel ETF'ler — Canlı Takip",
  description:
    "TEFAS yatırım fonları (AFT, YAY, TTE…) ve küresel ETF'ler (VOO, QQQ, SPY, SCHD) canlı pay değeri, günlük getiri ve portföy büyüklüğü — Bullsye.",
  keywords: [
    'TEFAS fon',
    'yatırım fonu',
    'AFT fon',
    'YAY fon',
    'VOO ETF',
    'QQQ',
    'SCHD',
    'küresel ETF',
    'fon getirisi',
  ],
  alternates: withLangAlternates('/fon'),
  openGraph: {
    title: "Fonlar & ETF'ler | Bullsye",
    description: 'TEFAS + ABD ETF canlı takip masası.',
    url: `${SITE_URL}/fon`,
  },
};

export default function FonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
