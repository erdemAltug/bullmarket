import type { Metadata } from 'next';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Balina & Takas Analizi',
  description:
    'Kurumsal hacim ilgi proxy ve kripto balina işlemleri — Bullsye.',
  alternates: withLangAlternates('/whales'),
};

export default function WhalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
