import type { Metadata } from 'next';
import Link from 'next/link';
import { buildComparePairs } from '@/lib/seo/compare-pairs';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const revalidate = 86_400;

export const metadata: Metadata = {
  title: { absolute: 'Hisse Karşılaştırma Motoru | Bullsye' },
  description:
    'THYAO vs PGSUS, AKBNK vs ISCTR, NVDA vs AMD — sektörel programmatic kıyas sayfaları. F/K, getiri, temettü yan yana.',
  alternates: withLangAlternates('/karsilastir'),
  openGraph: {
    title: 'Hisse Karşılaştırma Motoru | Bullsye',
    url: absoluteCanonical('/karsilastir'),
  },
};

export default function KarsilastirIndexPage() {
  const pairs = buildComparePairs();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Karşılaştırma motoru</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sektör içi yüksek niyetli X vs Y sayfaları. İnteraktif araç:{' '}
          <Link href="/compare" className="text-[var(--accent)] hover:underline">
            /compare
          </Link>
        </p>
      </header>
      <ul className="grid gap-2 sm:grid-cols-2">
        {pairs.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/karsilastir/${p.slug}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
            >
              {p.a} vs {p.b}
              {p.sectorTr ? (
                <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">
                  {p.sectorTr}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
