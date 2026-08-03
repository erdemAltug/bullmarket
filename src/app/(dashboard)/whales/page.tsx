import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { WhalesTerminal } from '@/components/dashboard/WhalesTerminal';

export const metadata: Metadata = {
  title: 'Balina & Takas Analizi',
  description:
    'BİST kurumsal hacim ilgi proxy ve kripto büyük işlem (balina) akışı — Bullsye.',
  keywords: [
    'balina analizi',
    'takas değişimi',
    'kurumsal alım',
    'kripto balina',
    'BİST hacim',
  ],
  alternates: withLangAlternates('/whales'),
  openGraph: {
    title: 'Balina & Takas | Bullsye',
    url: `${SITE_URL}/whales`,
  },
};

export default function WhalesPage() {
  return <WhalesTerminal />;
}
