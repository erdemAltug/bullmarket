import type { Metadata } from 'next';
import { withLangAlternates } from '@/lib/seo/hreflang';

/** Noindex legacy redirect surfaces — avoid sitemap/GSC indexing */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: withLangAlternates('/nasdaq'),
};

export default function UsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
