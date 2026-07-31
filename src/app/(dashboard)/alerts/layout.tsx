import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alarmlarım',
  description: 'Fiyat ve yüzde değişim alarmları.',
};

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
