import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: 'Faiz & Kredi — TCMB, Fed, Mevduat | Bullsye',
  description:
    'Türkiye ve dünya faiz çerçevesi: tahvil getirileri, USD/TRY, TCMB ve Fed haberleri. Kredi ve mevduat okuryazarlığı — tavsiye değildir.',
  keywords: [
    'TCMB faiz',
    'politika faizi',
    'kredi faizi',
    'mevduat faizi',
    'Fed faiz',
    'tahvil getirisi',
  ],
  alternates: withLangAlternates('/faiz'),
  openGraph: {
    title: 'Faiz & Kredi | Bullsye',
    url: `${SITE_URL}/faiz`,
  },
};

export default function RatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
