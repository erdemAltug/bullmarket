import type { Metadata } from 'next';
import Link from 'next/link';
import { TerminalCtaButton } from '@/components/landing/TerminalCtaButton';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';
import {
  SEO_HUB_FEATURES_EN,
  TOP_BIST_FOR_HUB,
  TOP_CRYPTO_FOR_HUB,
  TOP_US_FOR_HUB,
} from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: {
    absolute:
      'Bullsye — Live Stock Analysis, Crypto Signals & Price Targets',
  },
  description:
    'Real-time BIST & global market analysis, AI trading signals, analyst price targets, crypto radar and dividend calendar. Free financial intelligence terminal.',
  keywords: [
    'stock analysis',
    'live stock prices',
    'analyst price targets',
    'AI trading signals',
    'crypto signal radar',
    'BTC live chart',
    'BIST live',
    'dividend calendar',
    'financial terminal',
    'market intelligence',
  ],
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: rootHreflangLanguages(),
  },
  openGraph: {
    locale: 'en_US',
    alternateLocale: ['tr_TR'],
    title: 'Bullsye — Real-Time Market Intelligence Terminal',
    description:
      'Stock analysis, analyst targets, AI signals and crypto radar in one place.',
    url: `${SITE_URL}/en`,
    siteName: 'Bullsye',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/api/og?symbol=BULLSYE&price=LIVE&change=AI&label=EN%20Terminal`,
        width: 1200,
        height: 630,
        alt: 'Bullsye English Market Terminal',
      },
    ],
  },
};

const FAQ = [
  {
    q: 'What can I analyze on Bullsye?',
    a: 'Live BIST equities, crypto pairs, FX, AI buy/sell signals, analyst price targets, health scorecards and dividend calendars.',
  },
  {
    q: 'Does Bullsye show broker price targets?',
    a: 'Yes. Asset pages include 12-month consensus targets, buy/hold/sell mix and recent broker notes.',
  },
  {
    q: 'Is the crypto signal radar real-time?',
    a: 'Prices stream from live market data; RSI/SMA-based signal cards update with the market.',
  },
];

export default function EnLocaleLanding() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Bullsye · Global
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-50 sm:text-5xl">
        Live Stock Analysis, Crypto Signals & Price Targets
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
        Monitor BIST equities, crypto depth, FX and dividends in one terminal.
        Turn raw prices into decisions with AI scorecards and analyst consensus.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <TerminalCtaButton>Open Terminal</TerminalCtaButton>
        <Link
          href="/signals?lang=en"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          AI Signals
        </Link>
        <Link
          href="/us?lang=en"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          NASDAQ / US
        </Link>
        <Link
          href="/egitim"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          Academy
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          Blog
        </Link>
        <Link
          href="/tr"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          Türkçe
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-100">
          Top BIST Stock Analysis Pages
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOP_BIST_FOR_HUB.map((sym) => (
            <li key={sym}>
              <Link
                href={`/bist/${sym}?lang=en`}
                className="inline-block rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-emerald-400 hover:border-emerald-500/40"
              >
                {sym} analysis
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-100">
          Top NASDAQ / US Stock Pages
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOP_US_FOR_HUB.map((sym) => (
            <li key={sym}>
              <Link
                href={`/us/${sym}?lang=en`}
                className="inline-block rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-sky-400 hover:border-sky-500/40"
              >
                {sym} analysis
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-100">
          Crypto Live Charts
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOP_CRYPTO_FOR_HUB.map((sym) => (
            <li key={sym}>
              <Link
                href={`/crypto/${sym}?lang=en`}
                className="inline-block rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-emerald-400 hover:border-emerald-500/40"
              >
                {sym.replace('USDT', '')} live
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {SEO_HUB_FEATURES_EN.map((f) => (
          <Link
            key={f.href}
            href={`${f.href}?lang=en`}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-emerald-500/30"
          >
            <h3 className="font-semibold text-zinc-100">{f.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{f.desc}</p>
          </Link>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-100">FAQ</h2>
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

      <footer className="mt-16 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-600">
        <p className="mx-auto mb-4 max-w-xl text-[11px] leading-relaxed text-amber-200/80">
          Not investment advice. Capital markets involve risk of loss.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/kvkk" className="hover:text-emerald-400">
            KVKK
          </Link>
          <Link href="/gizlilik" className="hover:text-emerald-400">
            Privacy
          </Link>
          <Link href="/kosullar" className="hover:text-emerald-400">
            Terms
          </Link>
          <Link href="/yatirim-uyarisi" className="hover:text-emerald-400">
            Risk notice
          </Link>
        </div>
      </footer>
    </main>
  );
}
