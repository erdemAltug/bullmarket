import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: {
    absolute: 'Bullsye — Canlı BİST, Kripto & Akıllı Alım Sinyalleri Terminali',
  },
  description:
    'Borsa İstanbul (BİST) canlı fiyat, hisse analiz karnesi, kripto sinyal radarı, temettü takvimi ve portföy takibi. Nokta atışı alım fırsatları Bullsye\'da.',
  keywords: [
    'BİST 100 canlı',
    'Borsa İstanbul alım fırsatları',
    'Hisse temel analiz karnesi',
    'Canlı borsa takip',
    'Temettü takvimi',
    'THYAO canlı fiyat',
  ],
  alternates: {
    canonical: `${SITE_URL}/tr`,
    languages: rootHreflangLanguages(),
  },
  openGraph: {
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    title: 'Bullsye — Canlı BİST & Kripto Terminali',
    description:
      'BİST 100, hisse grafikleri ve yapay zeka destekli alım sinyalleri.',
    url: `${SITE_URL}/tr`,
    siteName: 'Bullsye',
    type: 'website',
  },
};

export default function TrLocaleLanding() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Bullsye · TR
      </p>
      <h1 className="text-4xl font-black tracking-tight text-zinc-50">
        Canlı BİST, Kripto & Akıllı Alım Sinyalleri
      </h1>
      <p className="text-lg leading-relaxed text-zinc-400">
        Borsa İstanbul hisseleri, kripto radar, döviz/altın ve temettü takvimini
        tek terminalde takip edin. Nokta atışı teknik sinyaller ve portföy sağlık
        analizi.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/?lang=tr"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Terminale Gir
        </Link>
        <Link
          href="/en"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          English
        </Link>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-zinc-500">
        <li>
          <Link className="text-emerald-400 hover:underline" href="/bist/THYAO?lang=tr">
            THYAO canlı fiyat
          </Link>
        </li>
        <li>
          <Link className="text-emerald-400 hover:underline" href="/bist?lang=tr">
            BİST 100 grafiği
          </Link>
        </li>
        <li>
          <Link className="text-emerald-400 hover:underline" href="/crypto/BTCUSDT?lang=tr">
            Bitcoin canlı grafik
          </Link>
        </li>
        <li>
          <Link className="text-emerald-400 hover:underline" href="/dividends?lang=tr">
            Temettü takvimi
          </Link>
        </li>
      </ul>
    </main>
  );
}
