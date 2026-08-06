import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity';
import { JsonLd } from '@/components/seo/JsonLd';
import { Providers } from './providers';
import { SITE_URL } from '@/lib/seo/symbols';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'Bullsye — Canlı BİST Hisse Analizi, Kripto Sinyal & Temettü Terminali',
    template: '%s | Bullsye',
  },
  description:
    'Borsa İstanbul canlı hisse fiyatı, temel analiz karnesi, analist hedef fiyatları, kripto sinyal radarı ve temettü takvimi. Türkiye ve global piyasalar için ücretsiz finans analiz terminali.',
  keywords: [
    'Bullsye',
    'BİST canlı',
    'Borsa İstanbul hisse analizi',
    'hisse fiyatı',
    'temel analiz',
    'analist hedef fiyat',
    'temettü takvimi',
    'kripto sinyal',
    'Bitcoin canlı',
    'BİST 100',
    'stock analysis',
    'price targets',
    'AI trading signals',
    'crypto radar',
    'financial terminal',
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
      'x-default': `${SITE_URL}/tr`,
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
    title: 'Bullsye — Canlı BİST, Kripto & Finans Analiz Terminali',
    description:
      'Hisse analizi, analist hedefleri, AI alım sinyalleri ve temettü takibi — tek terminalde.',
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
        alt: 'Bullsye Canlı BİST ve Kripto Analiz Terminali',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bullsyeapp',
    creator: '@bullsyeapp',
    title: 'Bullsye — BİST Hisse Analizi & Kripto Sinyaller',
    description:
      'Canlı BİST, analist hedef fiyatları, AI trading signals ve temettü takvimi.',
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
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/lira.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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
