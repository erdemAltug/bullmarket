import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Balina & Takas Analizi',
  description:
    'Kurumsal hacim ilgi proxy ve kripto balina işlemleri — Bullsye.',
};

export default function WhalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
