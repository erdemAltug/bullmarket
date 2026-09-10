import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { DividendSimModule } from '@/components/analysis/DividendSimModule';
import {
  BreadcrumbSchema,
  FaqSchema,
  FinancialSchema,
} from '@/components/seo/FinancialSchema';
import { BistMatrixShell } from '@/components/seo/BistMatrixShell';
import { RelatedSymbolRail } from '@/components/seo/RelatedSymbolRail';
import { fetchDividendSnapshot, fetchFundamentals, fetchQuotes } from '@/lib/api/yahoo';
import { buildSymbolAnalysisBundle } from '@/lib/analysis/build-bundle';
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

export const revalidate = 86400;
export const dynamicParams = true;

type Props = { params: Promise<{ symbol: string }> };

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.filter((s) => !s.startsWith('XU'))
    .slice(0, ISR_STATIC_TOP_N)
    .map((symbol) => ({ symbol }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symbol = canonicalSymbol((await params).symbol);
  const yahoo = toYahooSymbol(symbol);
  let name = symbol;
  let yieldPct: number | null = null;
  let price = 0;
  try {
    const [q, d] = await Promise.all([
      fetchQuotes([yahoo]).then((r) => r[0]),
      fetchDividendSnapshot(yahoo),
    ]);
    if (q) {
      name = q.name || symbol;
      price = q.price;
    }
    yieldPct = d?.dividendYield ?? null;
  } catch {
    /* shell */
  }
  const year = new Date().getFullYear();
  const path = `/bist/${symbol}/temettu`;
  const title = `${symbol} Temettü Verimi ${year}, Tarihi ve DRIP Simülasyonu | Bullsye`;
  const description = `${name} (${symbol}) temettü verecek mi? Trailing verim${yieldPct != null ? ` %${yieldPct.toFixed(2)}` : ''}, hisse başı tutar ve 5 yıllık DRIP simülasyonu.${price > 0 ? ` Canlı ₺${formatMetaPrice(price, 'TRY')}.` : ''}`;
  const og = `${SITE_URL}/api/og/bist/${symbol}?page=temettu`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${symbol} temettü`,
      `${symbol} temettü verimi`,
      `${symbol} temettü tarihi`,
      `${symbol} temettü verecek mi`,
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

export default async function BistTemettuPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);
  if (!symbol || !isIndexedBistSymbol(symbol)) notFound();
  if (raw !== symbol) permanentRedirect(`/bist/${symbol}/temettu`);

  const yahoo = toYahooSymbol(symbol);
  let name = symbol;
  let price = 0;
  let changePercent = 0;
  let yieldPct: number | null = null;
  let rate: number | null = null;
  let exDate: string | null = null;
  let bundle = null;

  try {
    const [q, d, f] = await Promise.all([
      fetchQuotes([yahoo]).then((r) => r[0]),
      fetchDividendSnapshot(yahoo),
      fetchFundamentals(yahoo).catch(() => null),
    ]);
    if (q) {
      name = q.name || f?.name || symbol;
      price = q.price;
      changePercent = q.changePercent;
    }
    yieldPct = d?.dividendYield ?? (f?.dividendYield != null ? (f.dividendYield < 1 ? f.dividendYield * 100 : f.dividendYield) : null);
    rate = d?.trailingAnnualDividendRate ?? d?.dividendRate ?? null;
    exDate = d?.exDividendDate ?? null;
    bundle = await buildSymbolAnalysisBundle(yahoo).catch(() => null);
  } catch {
    /* shell */
  }

  const path = `/bist/${symbol}/temettu`;
  const faqs = [
    {
      question: `${symbol} temettü verecek mi?`,
      answer:
        yieldPct != null && yieldPct > 0
          ? `${name} için trailing temettü verimi yaklaşık %${yieldPct.toFixed(2)}. Gelecek dağıtım yönetim / KAP kararına bağlıdır; bu sayfa geçmiş ve trailing veriyi gösterir.`
          : `${name} için şu an anlamlı trailing temettü verimi görünmüyor veya veri yok. KAP bildirimlerini takip edin.`,
    },
    {
      question: `${symbol} temettü verimi nasıl hesaplanır?`,
      answer:
        'Temettü verimi ≈ yıllık temettü / güncel fiyat. Bullsye Yahoo trailing alanlarını kullanır; yatırım tavsiyesi değildir.',
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
          { name: 'Temettü', path },
        ]}
      />

      <BistMatrixShell
        symbol={symbol}
        name={name}
        price={price}
        changePercent={changePercent}
        active="temettu"
        path={path}
        title={`${symbol} Temettü`}
        scoreHint={yieldPct != null ? `verim %${yieldPct.toFixed(1)}` : undefined}
      >
        <dl className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <dt className="text-xs text-[var(--muted)]">Trailing verim</dt>
            <dd className="text-lg font-semibold">
              {yieldPct != null ? `%${yieldPct.toFixed(2)}` : '—'}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <dt className="text-xs text-[var(--muted)]">Yıllık / hisse</dt>
            <dd className="text-lg font-semibold">
              {rate != null ? `₺${rate.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}` : '—'}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <dt className="text-xs text-[var(--muted)]">Ex-temettü</dt>
            <dd className="text-lg font-semibold">{exDate ?? '—'}</dd>
          </div>
        </dl>

        {bundle ? (
          <DividendSimModule data={bundle} />
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Simülasyon verisi yüklenemedi. Genel liste:{' '}
            <Link href="/dividends" className="text-[var(--accent)] hover:underline">
              /dividends
            </Link>
          </p>
        )}

        <RelatedSymbolRail symbol={symbol} kind="bist" />
      </BistMatrixShell>
    </div>
  );
}
