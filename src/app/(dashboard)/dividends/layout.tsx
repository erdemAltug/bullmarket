import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Temettü Takvimi',
  description: 'BİST temettü verimleri ve yaklaşan ödeme tarihleri.',
};

export default function DividendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
