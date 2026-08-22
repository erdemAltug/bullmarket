import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity';
import { JsonLd } from '@/components/seo/JsonLd';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { Providers } from './providers';
import { PREF_KEYS, type AppTheme, type Language } from '@/lib/preferences';
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
      'Bullsye — BİST Canlı, Fırsat Skoru ve Analist Hedef Fiyatları',
    template: '%s | Bullsye',
  },
  description:
    'Analist tavsiyeleri ve hedef fiyatları, BİST 100 canlı tarama, finansal okuryazarlık. Kişisel envanter — kayıt senkron içindir.',
  keywords: [
    'Bullsye',
    'BİST canlı',
    'AI fırsat skoru',
    'ücretsiz BİST analizi',
    'Borsa İstanbul hisse analizi',
    'hisse fiyatı',
    'temel analiz',
    'analist hedef fiyat',
    'finansal okuryazarlık',
    'finansal özgürlük',
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
      'x-default': SITE_URL,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Bullsye — BİST Canlı, Fırsat Skoru ve Analist Hedef Fiyatları',
    description:
      'Analist tavsiyeleri ve hedef fiyatları, BİST 100 canlı tarama ve fırsat skoru. Ücretsiz.',
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
    title: 'Bullsye — BİST Canlı, Fırsat Skoru ve Analist Hedef Fiyatları',
    description:
      'Analist tavsiyeleri ve hedef fiyatları ile BİST fırsat skoru. Ücretsiz tarama.',
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

function themeFromCookie(raw: string | undefined): AppTheme {
  if (raw === 'light' || raw === 'terminal' || raw === 'dark') return raw;
  return 'dark';
}

function langFromCookie(raw: string | undefined): Language {
  if (raw === 'en' || raw === 'de' || raw === 'es' || raw === 'tr') return raw;
  return 'tr';
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const theme = themeFromCookie(jar.get(PREF_KEYS.theme)?.value);
  const lang = langFromCookie(jar.get(PREF_KEYS.lang)?.value);

  return (
    <html lang={lang} className={theme} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/lira.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}
      >
        <MicrosoftClarity />
        <JsonLd />
        <SchemaMarkup />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
