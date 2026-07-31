import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'AI Alım Sinyalleri & Teknik Radar',
  description:
    'BİST ve kripto için canlı AI trading sinyalleri: RSI, SMA, momentum ve destek/direnç kartları. Ücretsiz sinyal radarı — Bullsye.',
  keywords: [
    'AI alım sinyali',
    'teknik analiz sinyali',
    'RSI aşırı satım',
    'crypto trading signals',
    'BİST alım fırsatı',
  ],
  alternates: withLangAlternates('/signals'),
  openGraph: {
    title: 'AI Alım Sinyalleri | Bullsye',
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
