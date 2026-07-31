import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const SITE_URL = 'https://bullmarket.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BullMarket — BİST, Kripto & Finansal Analiz Terminali',
    template: '%s | BullMarket Terminal',
  },
  description:
    'Borsa İstanbul (BİST), Kripto paralar, Döviz ve Altın piyasalarını canlı takip edin. Yapay zeka destekli alım fırsatları ve portföy analiz platformu.',
  keywords: [
    'BİST 100',
    'Borsa İstanbul',
    'Kripto Takip',
    'Canlı Borsa',
    'Temel Analiz',
    'Portföy Takibi',
    'BullMarket',
  ],
  authors: [{ name: 'BullMarket Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'BullMarket — Canlı Borsa & Finansal Analiz Terminali',
    description:
      'BİST, Kripto ve FX piyasalarını anlık grafikler ve akıllı alım sinyalleriyle takip edin.',
    url: SITE_URL,
    siteName: 'BullMarket',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BullMarket Terminal',
    description: 'Canlı Finansal Veri ve Portföy Takip Platformu',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
