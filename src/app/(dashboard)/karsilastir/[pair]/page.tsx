import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  BreadcrumbSchema,
  FaqSchema,
} from '@/components/seo/FinancialSchema';
import { ShareScorecardButton } from '@/components/seo/ShareScorecardButton';
import { fetchFundamentals } from '@/lib/api/yahoo';
import { absoluteCanonical } from '@/lib/seo/canonical';
import {
  buildComparePairs,
  parseCompareSlug,
} from '@/lib/seo/compare-pairs';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { ISR_STATIC_TOP_N } from '@/lib/seo/matrix';
import { SITE_URL, toYahooSymbol } from '@/lib/seo/symbols';
import type { CompareMetrics } from '@/types';

export const revalidate = 86400;
export const dynamicParams = true;

type Props = { params: Promise<{ pair: string }> };

const ALL_PAIRS = buildComparePairs();

export async function generateStaticParams() {
  return ALL_PAIRS.slice(0, ISR_STATIC_TOP_N).map((p) => ({ pair: p.slug }));
}

async function loadSide(
  ticker: string,
  market: 'bist' | 'us'
): Promise<CompareMetrics> {
  const yahoo = market === 'bist' ? toYahooSymbol(ticker) : ticker;
  const f = await fetchFundamentals(yahoo);
  return {
    symbol: ticker,
    name: f.name,
    price: f.price,
    trailingPE: f.trailingPE,
    priceToBook: f.priceToBook,
    yearReturn: f.yearReturn,
    earningsGrowth: f.earningsGrowth,
    beta: f.beta,
    dividendYield: f.dividendYield,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raw = (await params).pair;
  const parsed = parseCompareSlug(raw);
  if (!parsed) return { title: 'Karşılaştırma' };
  const { a, b } = parsed;
  const path = `/karsilastir/${a.toLowerCase()}-vs-${b.toLowerCase()}`;
  const title = `${a} vs ${b} Karşılaştırma: F/K, Getiri, Temettü | Bullsye`;
  const description = `${a} ve ${b} yan yana: F/K, PD/DD, 1 yıllık getiri ve temettü verimi. Ücretsiz programmatic kıyas — yatırım tavsiyesi değildir.`;
  const og = `${SITE_URL}/api/og?symbol=${a}-vs-${b}&label=Karşılaştırma&type=BIST`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${a} vs ${b}`,
      `${a} ${b} karşılaştırma`,
      `${a} mi ${b} mi`,
    ],
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: absoluteCanonical(path),
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  };
}

function MetricRow({
  label,
  a,
  b,
  fmt,
}: {
  label: string;
  a: number | null;
  b: number | null;
  fmt: (n: number) => string;
}) {
  return (
    <tr className="border-b border-[var(--border)]">
      <td className="py-2 pr-3 text-sm text-[var(--muted)]">{label}</td>
      <td className="py-2 text-right text-sm font-medium tabular-nums">
        {a == null ? '—' : fmt(a)}
      </td>
      <td className="py-2 text-right text-sm font-medium tabular-nums">
        {b == null ? '—' : fmt(b)}
      </td>
    </tr>
  );
}

export default async function KarsilastirPairPage({ params }: Props) {
  const raw = (await params).pair.toLowerCase();
  const parsed = parseCompareSlug(raw);
  if (!parsed) notFound();

  const known = ALL_PAIRS.find((p) => p.slug === raw);
  const market = known?.market ?? 'bist';
  const { a, b } = parsed;
  const canonicalSlug = `${a.toLowerCase()}-vs-${b.toLowerCase()}`;
  // Stable sort for URL: parseCompareSlug already uppercases; slug uses alpha order in builder
  const sortedSlug = [a, b]
    .map((s) => s.toLowerCase())
    .sort()
    .join('-vs-');
  if (raw !== sortedSlug) permanentRedirect(`/karsilastir/${sortedSlug}`);

  let left: CompareMetrics | null = null;
  let right: CompareMetrics | null = null;
  try {
    [left, right] = await Promise.all([
      loadSide(a, market),
      loadSide(b, market),
    ]);
  } catch {
    /* shell */
  }

  const path = `/karsilastir/${sortedSlug}`;
  const faqs = [
    {
      question: `${a} mı ${b} mi?`,
      answer:
        'Tek metrikle karar vermeyin. F/K ucuz görünebilir ama büyüme/risk farklıdır. Bu tablo kamuya açık çarpan özetidir; yatırım tavsiyesi değildir.',
    },
    {
      question: 'Veriler nereden geliyor?',
      answer:
        'Yahoo Finance temel alanları. BİST için .IS sembolleri kullanılır.',
    },
  ];

  const hub =
    market === 'bist'
      ? { a: `/bist/${a}`, b: `/bist/${b}` }
      : { a: `/nasdaq/${a}`, b: `/nasdaq/${b}` };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <FaqSchema items={faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Bullsye', path: '/' },
          { name: 'Karşılaştır', path: '/karsilastir' },
          { name: `${a} vs ${b}`, path },
        ]}
      />

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
          Programmatic kıyas{known?.sectorTr ? ` · ${known.sectorTr}` : ''}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {a} vs {b}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          F/K, PD/DD, getiri ve temettü yan yana.{' '}
          <Link href={hub.a} className="text-[var(--accent)] hover:underline">
            {a}
          </Link>
          {' · '}
          <Link href={hub.b} className="text-[var(--accent)] hover:underline">
            {b}
          </Link>
        </p>
        <ShareScorecardButton
          symbol={`${a} vs ${b}`}
          path={path}
          scoreHint="kıyas"
        />
      </header>

      {left && right ? (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="text-left text-xs text-[var(--muted)]">
                <th className="pb-2">Metrik</th>
                <th className="pb-2 text-right">{a}</th>
                <th className="pb-2 text-right">{b}</th>
              </tr>
            </thead>
            <tbody>
              <MetricRow
                label="Fiyat"
                a={left.price}
                b={right.price}
                fmt={(n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
              />
              <MetricRow
                label="F/K"
                a={left.trailingPE}
                b={right.trailingPE}
                fmt={(n) => n.toFixed(1)}
              />
              <MetricRow
                label="PD/DD"
                a={left.priceToBook}
                b={right.priceToBook}
                fmt={(n) => n.toFixed(2)}
              />
              <MetricRow
                label="1Y getiri %"
                a={left.yearReturn}
                b={right.yearReturn}
                fmt={(n) => n.toFixed(1)}
              />
              <MetricRow
                label="Kazanç büyümesi"
                a={left.earningsGrowth}
                b={right.earningsGrowth}
                fmt={(n) => `${(n * 100).toFixed(1)}%`}
              />
              <MetricRow
                label="Temettü"
                a={left.dividendYield}
                b={right.dividendYield}
                fmt={(n) =>
                  `${(n < 1 ? n * 100 : n).toFixed(2)}%`
                }
              />
              <MetricRow
                label="Beta"
                a={left.beta}
                b={right.beta}
                fmt={(n) => n.toFixed(2)}
              />
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Kıyas verisi alınamadı. İnteraktif araç:{' '}
          <Link href={`/compare?a=${a}&b=${b}`} className="text-[var(--accent)]">
            /compare
          </Link>
        </p>
      )}

      <RelatedPairs current={sortedSlug} />
    </article>
  );
}

function RelatedPairs({ current }: { current: string }) {
  const related = ALL_PAIRS.filter((p) => p.slug !== current).slice(0, 8);
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">Diğer kıyaslar</h2>
      <ul className="flex flex-wrap gap-2 text-sm">
        {related.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/karsilastir/${p.slug}`}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-[var(--accent)] hover:bg-[var(--surface)]"
            >
              {p.a} vs {p.b}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
