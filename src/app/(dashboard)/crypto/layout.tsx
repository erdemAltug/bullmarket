import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Kripto Canlı Fiyat & Sinyal Radarı',
  description:
    'Bitcoin, Ethereum ve altcoin canlı fiyatları, emir defteri, RSI sinyalleri ve momentum karnesi. Crypto radar — Bullsye.',
  keywords: [
    'Bitcoin canlı',
    'kripto sinyal',
    'BTC ETH fiyat',
    'crypto signal radar',
    'canlı kripto',
  ],
  alternates: withLangAlternates('/crypto'),
  openGraph: {
    title: 'Kripto Radar | Bullsye',
    url: `${SITE_URL}/crypto`,
  },
};

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
