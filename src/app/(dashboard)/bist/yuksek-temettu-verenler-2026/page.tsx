import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { SEO_BIST_TICKERS } from '@/lib/seo/symbols';

export const revalidate = 86_400;

const path = '/bist/yuksek-temettu-verenler-2026';
const year = 2026;

export const metadata: Metadata = {
  title: { absolute: `Yüksek Temettü Veren BİST Hisseleri ${year} | Bullsye` },
  description: `${year} temettü verimi arayanlar için BİST koleksiyonu. Trailing verim ve DRIP simülasyonu sembol temettü sayfalarında.`,
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: `Yüksek Temettü ${year}`,
  },
};

const SEEDS = [
  'ISCTR', 'AKBNK', 'GARAN', 'YKBNK', 'TCELL', 'TTKOM', 'EREGL', 'KRDMD', 'TUPRS',
  'SISE', 'KCHOL', 'SAHOL', 'BIMAS', 'AEFES', 'CCOLA', 'DOAS', 'FROTO', 'TOASO',
  'ENJSA', 'AKSEN', 'ISGYO', 'EKGYO', 'PETKM', 'ULKER',
];

export default function YuksekTemettuHubPage() {
  const list = SEEDS.filter((s) => SEO_BIST_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">
        Yüksek temettü verenler {year}
      </h1>
      <p className="text-sm text-[var(--muted)]">
        Temettü niyeti hub’ı. Verim ve tarih için sembol sayfalarına gidin ·{' '}
        <Link href="/dividends" className="text-[var(--accent)]">
          /dividends
        </Link>
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s}>
            <Link
              href={`/bist/${s}/temettu`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
            >
              {s} temettü {year}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
