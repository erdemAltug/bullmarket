import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity';
import { JsonLd } from '@/components/seo/JsonLd';
import { Providers } from './providers';
import { SITE_URL } from '@/lib/seo/symbols';
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'Bullsye — Canlı BİST, Kripto & Akıllı Alım Sinyalleri | Real-Time Market Terminal',
    template: '%s | Bullsye Terminal',
  },
  description:
    'Borsa İstanbul (BİST), Global Stocks, Crypto, and FX in real-time. Yapay zeka destekli alım fırsatları, canlı grafikler ve portföy sağlığı takibi.',
  keywords: [
    'Bullsye',
    'Bullsye App',
    'BİST 100 canlı',
    'Borsa İstanbul alım fırsatları',
    'Hisse temel analiz karnesi',
    'Canlı borsa takip',
    'Temettü takvimi',
    'Real-time stock terminal',
    'Crypto signal radar',
    'AI trading signals',
    'Live market monitoring',
    'Stock scorecards',
  ],
  authors: [{ name: 'Bullsye Team', url: SITE_URL }],
  creator: 'Bullsye',
  publisher: 'Bullsye',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'tr-TR': `${SITE_URL}/tr`,
      'en-US': `${SITE_URL}/en`,
      'x-default': `${SITE_URL}/en`,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Bullsye — Global & BİST Financial Intelligence Terminal',
    description:
      'Nailing every market move. Real-time BİST & Crypto monitoring with AI trading signals.',
    url: SITE_URL,
    siteName: 'Bullsye',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/api/og?symbol=BULLSYE&price=Terminal&change=LIVE&label=Financial%20Terminal`,
        width: 1200,
        height: 630,
        alt: 'Bullsye Financial Terminal Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bullsye Terminal — TR/EN Market Intelligence',
    description: 'Canlı BİST, Crypto Radar & AI Trading Signals',
    creator: '@bullsyeapp',
    images: [
      `${SITE_URL}/api/og?symbol=BULLSYE&price=Terminal&change=LIVE&label=Financial%20Terminal`,
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bullsye_theme')||(document.cookie.match(/(?:^|; )bullsye_theme=([^;]*)/)||[])[1]||'dark';if(t==='light'||t==='terminal'||t==='dark'){document.documentElement.classList.add(t);}var l=localStorage.getItem('bullsye_lang')||(document.cookie.match(/(?:^|; )bullsye_lang=([^;]*)/)||[])[1];if(l)document.documentElement.lang=l;}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}
      >
        <MicrosoftClarity />
        <JsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
