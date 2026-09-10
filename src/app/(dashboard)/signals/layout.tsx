import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Alım Sinyalleri & Teknik Radar',
  description:
    'BİST ve kripto için canlı trading sinyalleri: RSI, SMA, momentum ve destek/direnç kartları. Ücretsiz sinyal radarı — Bullsye.',
  keywords: [
    'alım sinyali',
    'teknik analiz sinyali',
    'RSI aşırı satım',
    'crypto trading signals',
    'BİST sinyal',
  ],
  alternates: withLangAlternates('/signals'),
  openGraph: {
    title: 'Alım Sinyalleri | Bullsye',
    description: 'Canlı BİST & kripto teknik sinyal radarı.',
    url: `${SITE_URL}/signals`,
  },
};

export default function SignalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
