import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo/symbols';
import { rootHreflangLanguages } from '@/lib/seo/hreflang';

export const metadata: Metadata = {
  title: {
    absolute:
      'Bullsye — Real-Time Stocks, Crypto Radar & AI Trading Signals',
  },
  description:
    'Live BIST & global markets, crypto signal radar, AI stock scorecards, dividend tracker and portfolio health. Nail every market move on Bullsye Terminal.',
  keywords: [
    'Real-time stock terminal',
    'Crypto signal radar',
    'AI trading signals',
    'Live market monitoring',
    'Stock scorecards',
    'BTC live chart',
    'Live dividend tracker',
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
      'Crypto signal radar, AI trading signals, live charts and portfolio monitoring.',
    url: `${SITE_URL}/en`,
    siteName: 'Bullsye',
    type: 'website',
  },
};

export default function EnLocaleLanding() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Bullsye · EN
      </p>
      <h1 className="text-4xl font-black tracking-tight text-zinc-50">
        Real-Time Stocks, Crypto Radar & AI Signals
      </h1>
      <p className="text-lg leading-relaxed text-zinc-400">
        Monitor BIST equities, crypto depth, FX and dividends in one terminal.
        AI scorecards and smart buy signals — hit the market with precision.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/?lang=en"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Open Terminal
        </Link>
        <Link
          href="/tr"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500"
        >
          Türkçe
        </Link>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-zinc-500">
        <li>
          <Link
            className="text-emerald-400 hover:underline"
            href="/crypto/BTCUSDT?lang=en"
          >
            BTC live chart
          </Link>
        </li>
        <li>
          <Link className="text-emerald-400 hover:underline" href="/crypto?lang=en">
            Crypto signal radar
          </Link>
        </li>
        <li>
          <Link
            className="text-emerald-400 hover:underline"
            href="/bist/THYAO?lang=en"
          >
            AI stock scorecard
          </Link>
        </li>
        <li>
          <Link
            className="text-emerald-400 hover:underline"
            href="/dividends?lang=en"
          >
            Live dividend tracker
          </Link>
        </li>
      </ul>
    </main>
  );
}
