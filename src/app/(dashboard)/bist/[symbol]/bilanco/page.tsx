import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { AssetFundamentalsStrip } from '@/components/asset/AssetFundamentalsStrip';
import {
  BreadcrumbSchema,
  FaqSchema,
  FinancialSchema,
} from '@/components/seo/FinancialSchema';
import { BistMatrixShell } from '@/components/seo/BistMatrixShell';
import { RelatedSymbolRail } from '@/components/seo/RelatedSymbolRail';
import { fetchFundamentals, fetchQuotes } from '@/lib/api/yahoo';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { ISR_STATIC_TOP_N } from '@/lib/seo/matrix';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  canonicalSymbol,
  formatMetaPrice,
  isIndexedBistSymbol,
  toYahooSymbol,
} from '@/lib/seo/symbols';
import type { StockFundamentals } from '@/types';

export const revalidate = 86400;
export const dynamicParams = true;

type Props = { params: Promise<{ symbol: string }> };

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.filter((s) => !s.startsWith('XU'))
    .slice(0, ISR_STATIC_TOP_N)
    .map((symbol) => ({ symbol }));
}

function fmtPct(n: number | null, mult = 100) {
  if (n == null) return '—';
  return `%${(n * mult).toFixed(1)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symbol = canonicalSymbol((await params).symbol);
  const yahoo = toYahooSymbol(symbol);
  let name = symbol;
  let pe: number | null = null;
  let price = 0;
  try {
    const [q, f] = await Promise.all([
      fetchQuotes([yahoo]).then((r) => r[0]),
      fetchFundamentals(yahoo).catch(() => null),
    ]);
    if (q) {
      name = q.name || symbol;
      price = q.price;
    }
    pe = f?.trailingPE ?? null;
  } catch {
    /* shell */
  }
  const path = `/bist/${symbol}/bilanco`;
  const title = `${symbol} Bilanço Analizi, F/K ve Kârlılık Karnesi | Bullsye`;
  const description = `${name} (${symbol}) bilanço analizi: F/K${pe != null ? ` ${pe.toFixed(1)}` : ''}, PD/DD, ROE ve büyüme rasyoları. Yatırım tavsiyesi değildir.${price > 0 ? ` Canlı ₺${formatMetaPrice(price, 'TRY')}.` : ''}`;
  const og = `${SITE_URL}/api/og/bist/${symbol}?page=bilanco`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${symbol} bilanço`,
      `${symbol} bilanço analizi`,
      `${symbol} F/K`,
      `${symbol} ROE`,
      `${symbol} kârlılık`,
    ],
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: absoluteCanonical(path, { upperSymbol: true }),
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  };
}

function RatioCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default async function BistBilancoPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);
  if (!symbol || !isIndexedBistSymbol(symbol)) notFound();
  if (raw !== symbol) permanentRedirect(`/bist/${symbol}/bilanco`);

  const yahoo = toYahooSymbol(symbol);
  let name = symbol;
  let price = 0;
  let changePercent = 0;
  let f: StockFundamentals | null = null;

  try {
    const [q, fund] = await Promise.all([
      fetchQuotes([yahoo]).then((r) => r[0]),
      fetchFundamentals(yahoo),
    ]);
    if (q) {
      name = q.name || fund.name || symbol;
      price = q.price;
      changePercent = q.changePercent;
    }
    f = fund;
  } catch {
    /* shell */
  }

  const path = `/bist/${symbol}/bilanco`;
  const faqs = [
    {
      question: `${symbol} F/K oranı nedir?`,
      answer:
        f?.trailingPE != null
          ? `${name} trailing F/K yaklaşık ${f.trailingPE.toFixed(1)}. Sektör karşılaştırması olmadan tek başına karar vermeyin.`
          : `${name} için F/K şu an hesaplanamıyor (zarar veya veri eksik olabilir).`,
    },
    {
      question: 'Bilanço karnesi neye bakar?',
      answer:
        'F/K, PD/DD, ROE, beta, temettü verimi ve yıllık getiri gibi kamuya açık çarpanlar. KAP dipnotları ve tam bilanço tabloları yerine geçerli değildir.',
    },
  ];

  return (
    <div className="space-y-6">
      <FinancialSchema symbol={symbol} name={name} price={price} currency="TRY" kind="bist" path={path} />
      <FaqSchema items={faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Bullsye', path: '/' },
          { name: 'BİST', path: '/bist' },
          { name: symbol, path: `/bist/${symbol}` },
          { name: 'Bilanço', path },
        ]}
      />

      <BistMatrixShell
        symbol={symbol}
        name={name}
        price={price}
        changePercent={changePercent}
        active="bilanco"
        path={path}
        title={`${symbol} Bilanço`}
        scoreHint={f?.trailingPE != null ? `F/K ${f.trailingPE.toFixed(1)}` : undefined}
      >
        {f ? (
          <>
            <AssetFundamentalsStrip data={f} currencySymbol="₺" />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <RatioCard
                label="F/K (trailing)"
                value={f.trailingPE != null ? f.trailingPE.toFixed(1) : '—'}
              />
              <RatioCard
                label="PD/DD"
                value={f.priceToBook != null ? f.priceToBook.toFixed(2) : '—'}
              />
              <RatioCard label="ROE" value={fmtPct(f.returnOnEquity)} />
              <RatioCard
                label="Kazanç büyümesi"
                value={fmtPct(f.earningsGrowth)}
              />
              <RatioCard
                label="Beta"
                value={f.beta != null ? f.beta.toFixed(2) : '—'}
              />
              <RatioCard
                label="1Y getiri"
                value={
                  f.yearReturn != null
                    ? `%${f.yearReturn.toFixed(1)}`
                    : '—'
                }
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Temel rasyolar alınamadı. Ana sayfa:{' '}
            <Link href={`/bist/${symbol}`} className="text-[var(--accent)] hover:underline">
              /bist/{symbol}
            </Link>
          </p>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
          <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">
            {symbol} bilanço analizi nasıl okunur?
          </h2>
          <p>
            Bu karne Yahoo Finance özet alanlarından türetilir. Tam KAP
            bilanço dipnotları, nakit akışı ve kalem bazlı analiz için şirket
            KAP dosyalarına bakın. Bullsye yatırım tavsiyesi vermez.
          </p>
        </section>

        <RelatedSymbolRail symbol={symbol} kind="bist" />
      </BistMatrixShell>
    </div>
  );
}
