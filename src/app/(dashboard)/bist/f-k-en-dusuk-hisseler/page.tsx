import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { SEO_BIST_TICKERS } from '@/lib/seo/symbols';

export const revalidate = 86_400;

const path = '/bist/f-k-en-dusuk-hisseler';

export const metadata: Metadata = {
  title: { absolute: 'F/K En Düşük BİST Hisseleri | Bullsye' },
  description:
    'Borsa İstanbul’da düşük F/K arayanlar için programmatic koleksiyon. Detaylı rasyo karneleri Bullsye bilanço sayfalarında.',
  alternates: withLangAlternates(path),
  openGraph: { url: absoluteCanonical(path), title: 'F/K En Düşük Hisseler' },
};

/** Curated liquid names often screened for value — live PE on detail pages */
const SEEDS = [
  'EREGL', 'KRDMD', 'THYAO', 'PGSUS', 'TUPRS', 'PETKM', 'SISE', 'KCHOL', 'SAHOL',
  'BIMAS', 'MGROS', 'TCELL', 'TTKOM', 'FROTO', 'TOASO', 'ASELS', 'GARAN', 'AKBNK',
  'YKBNK', 'ISCTR', 'HALKB', 'VAKBN', 'ENKAI', 'TKFEN', 'KOZAL', 'KOZAA',
];

export default function FkEnDusukHubPage() {
  const list = SEEDS.filter((s) => SEO_BIST_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">F/K en düşük hisseler</h1>
      <p className="text-sm text-[var(--muted)]">
        Değerleme taraması niyeti için hub. Canlı F/K her hissenin{' '}
        <strong className="font-medium text-[var(--foreground)]">bilanço</strong>{' '}
        sayfasında.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s}>
            <Link
              href={`/bist/${s}/bilanco`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
            >
              {s} bilanço & F/K
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
