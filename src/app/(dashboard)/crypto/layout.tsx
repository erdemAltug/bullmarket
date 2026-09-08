import type { Metadata } from 'next';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: withLangAlternates('/kripto'),
};

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
