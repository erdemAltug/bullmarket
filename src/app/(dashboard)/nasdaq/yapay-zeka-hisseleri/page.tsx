import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { SEO_US_TICKERS } from '@/lib/seo/symbols';

export const revalidate = 86_400;

const path = '/nasdaq/yapay-zeka-hisseleri';

export const metadata: Metadata = {
  title: { absolute: 'Yapay Zeka Hisseleri (NASDAQ) | Bullsye' },
  description:
    'NVDA, AMD, AVGO, SMCI ve AI temalı ABD hisseleri / ETF’ler. Türk yatırımcı arama niyeti için programmatic hub.',
  alternates: withLangAlternates(path),
  openGraph: { url: absoluteCanonical(path), title: 'Yapay Zeka Hisseleri' },
};

const SEEDS = [
  'NVDA', 'AMD', 'AVGO', 'TSM', 'ASML', 'SMCI', 'ARM', 'PLTR', 'AI', 'SNOW',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'SMH', 'SOXX', 'QQQ',
];

export default function YapayZekaHubPage() {
  const list = SEEDS.filter((s) => SEO_US_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Yapay zeka hisseleri</h1>
      <p className="text-sm text-[var(--muted)]">
        AI çip / yazılım / ETF kümesi. Detay:{' '}
        <Link href="/nasdaq" className="text-[var(--accent)]">
          /nasdaq
        </Link>
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s}>
            <Link
              href={`/nasdaq/${s}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
            >
              {s} canlı analiz
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        Popüler kıyas:{' '}
        <Link href="/karsilastir/amd-vs-nvda" className="text-[var(--accent)]">
          NVDA vs AMD
        </Link>
      </p>
    </div>
  );
}
