import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';
import {
  SEO_HUB_FEATURES_TR,
  TOP_BIST_FOR_HUB,
  TOP_CRYPTO_FOR_HUB,
} from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: {
    absolute:
      'Bullsye — Canlı BİST Hisse Analizi, Kripto Sinyal & Temettü Takvimi',
  },
  description:
    'Borsa İstanbul (BİST) canlı hisse fiyatı, temel analiz karnesi, analist hedef fiyatları, AI alım sinyalleri, kripto radar ve temettü takvimi. Ücretsiz finans analiz terminali.',
  keywords: [
    'BİST canlı',
    'Borsa İstanbul hisse analizi',
    'hisse fiyatı',
    'temel analiz karnesi',
    'analist hedef fiyat',
    'temettü takvimi',
    'THYAO canlı',
    'GARAN hisse',
    'Bitcoin canlı grafik',
    'kripto sinyal',
    'BİST 100',
    'finans analizi',
  ],
  alternates: {
    canonical: `${SITE_URL}/tr`,
    languages: rootHreflangLanguages(),
  },
  openGraph: {
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    title: 'Bullsye — Canlı BİST & Kripto Finans Analiz Terminali',
    description:
      'Hisse analizi, analist hedefleri, AI sinyaller ve temettü — tek yerde.',
    url: `${SITE_URL}/tr`,
    siteName: 'Bullsye',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/api/og?symbol=BULLSYE&price=B%C4%B0ST&change=LIVE&label=TR%20Terminal`,
        width: 1200,
        height: 630,
        alt: 'Bullsye Türkçe BİST Terminali',
      },
    ],
  },
};

const FAQ = [
  {
    q: 'Bullsye ile BİST hisse analizi nasıl yapılır?',
    a: 'Hisse sayfasında canlı fiyat, AI sağlık karnesi, F/K–PD/DD rasyoları, analist hedef fiyatları ve kurum raporlarını birlikte görürsünüz.',
  },
  {
    q: 'Temettü takvimi ücretsiz mi?',
    a: 'Evet. BİST temettü verimleri, ex-date ve ödeme tarihleri Temettü Karnesi sayfasında takip edilebilir.',
  },
  {
    q: 'Kripto sinyalleri gerçek zamanlı mı?',
    a: 'BTC, ETH ve diğer çiftler canlı Binance verisiyle güncellenir; RSI/SMA tabanlı AI sinyal kartları üretilir.',
  },
];

export default function TrLocaleLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Bullsye · Türkiye
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-50 sm:text-5xl">
        Canlı BİST Hisse Analizi & Finans Terminali
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
        Borsa İstanbul hisseleri, kripto radar, döviz/altın, analist hedef
        fiyatları ve temettü takvimini tek ekranda izleyin. Soğuk fiyat listesi
        değil — karara dönüşen analiz.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/?lang=tr"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Terminale Gir
        </Link>
        <Link
          href="/bist?lang=tr"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          BİST Canlı
        </Link>
        <Link
          href="/egitim"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          Eğitim Hub
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          Blog
        </Link>
        <Link
          href="/en"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          English
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-100">
          Popüler BİST Hisse Analizleri
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Canlı fiyat, grafik, sağlık karnesi ve analist konsensüsü
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOP_BIST_FOR_HUB.map((sym) => (
            <li key={sym}>
              <Link
                href={`/bist/${sym}?lang=tr`}
                className="inline-block rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-emerald-400 hover:border-emerald-500/40"
              >
                {sym} analizi
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-100">
          Kripto Canlı & Sinyal
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOP_CRYPTO_FOR_HUB.map((sym) => (
            <li key={sym}>
              <Link
                href={`/crypto/${sym}?lang=tr`}
                className="inline-block rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-emerald-400 hover:border-emerald-500/40"
              >
                {sym.replace('USDT', '')} canlı
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {SEO_HUB_FEATURES_TR.map((f) => (
          <Link
            key={f.href}
            href={`${f.href}?lang=tr`}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-emerald-500/30"
          >
            <h3 className="font-semibold text-zinc-100">{f.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{f.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-100">SSS</h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-zinc-200">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />
    </main>
  );
}
