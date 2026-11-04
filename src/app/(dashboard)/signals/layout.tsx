import type { Metadata } from 'next';
import { hubOgImages } from '@/lib/seo/og';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'BİST ve Kripto Teknik Sinyaller: RSI, SMA, Momentum',
  description:
    'BİST ve kripto için canlı teknik göstergeler: RSI aşırı alım/satım, SMA kesişimleri, momentum ve destek/direnç. Ücretsiz, bilgilendirme amaçlı.',
  keywords: [
    'teknik analiz sinyali',
    'RSI aşırı satım',
    'crypto trading signals',
    'BİST sinyal',
  ],
  alternates: withLangAlternates('/signals'),
  openGraph: {
    title: 'BİST ve Kripto Teknik Sinyaller | Bullsye',
    description: 'Canlı BİST & kripto teknik sinyal radarı.',
    url: `${SITE_URL}/signals`,
    images: hubOgImages('BİST ve Kripto Teknik Sinyaller', 'RSI, SMA, momentum ve destek/direnç — canlı'),
  },
};

export default function SignalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
