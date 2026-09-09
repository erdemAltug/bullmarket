import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { AnalystTargetCard } from '@/components/asset/AnalystTargetCard';
import {
  BreadcrumbSchema,
  FaqSchema,
  FinancialSchema,
} from '@/components/seo/FinancialSchema';
import { BistMatrixShell } from '@/components/seo/BistMatrixShell';
import { RelatedSymbolRail } from '@/components/seo/RelatedSymbolRail';
import { fetchFundamentals, fetchQuotes } from '@/lib/api/yahoo';
import { fromLiveFundamentals } from '@/lib/analystData';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { absoluteCanonical } from '@/lib/seo/canonical';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  canonicalSymbol,
  formatMetaPrice,
  isIndexedBistSymbol,
  toYahooSymbol,
} from '@/lib/seo/symbols';

export const revalidate = 300;
export const dynamicParams = true;

type Props = {
  params: Promise<{ symbol: string }>;
};

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.filter((s) => !s.startsWith('XU'))
    .slice(0, 100)
    .map((symbol) => ({ symbol }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);
  const yahoo = toYahooSymbol(symbol);

  let name = symbol;
  let priceNum = 0;
  let mean: number | null = null;
  let upside: number | null = null;
  try {
    const [q, f] = await Promise.all([
      fetchQuotes([yahoo]).then((r) => r[0]),
      fetchFundamentals(yahoo).catch(() => null),
    ]);
    if (q) {
      name = q.name || symbol;
      priceNum = q.price;
    }
    mean = f?.analyst?.targetMean ?? null;
    if (mean != null && priceNum > 0) {
      upside = ((mean - priceNum) / priceNum) * 100;
    }
  } catch {
    /* metadata shell */
  }

  const path = `/bist/${symbol}/hedef-fiyat`;
  const canonicalUrl = absoluteCanonical(path, { upperSymbol: true });
  const year = new Date().getFullYear();
  const price = priceNum > 0 ? formatMetaPrice(priceNum, 'TRY') : null;
  const meanStr =
    mean != null ? formatMetaPrice(mean, 'TRY') : null;

  const title = `${symbol} Hedef Fiyat ${year}, AI Skoru ve Canlı Analiz | Bullsye`;
  const description = `${name} (${symbol}) için aracı kurumların 12 aylık konsensüs hedef fiyatı${meanStr ? ` (ort. ₺${meanStr})` : ''}${upside != null ? `, prim potansiyeli %${upside.toFixed(1)}` : ''} ve Bullsye AI fırsat skorunu anlık inceleyin.${price ? ` Canlı: ₺${price}.` : ''}`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${symbol} hedef fiyat`,
      `${symbol} analist tavsiyesi`,
      `${symbol} konsensüs`,
      'hedef fiyat 2026',
      'BİST analist hedefi',
    ],
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Bullsye',
      locale: 'tr_TR',
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/api/og/bist/${symbol}?page=hedef-fiyat`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/api/og/bist/${symbol}?page=hedef-fiyat`],
    },
  };
}

export default async function BistTargetPricePage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);

  if (!symbol || symbol === 'HEATMAP' || !isIndexedBistSymbol(symbol)) {
    notFound();
  }
  if (raw !== symbol) permanentRedirect(`/bist/${symbol}/hedef-fiyat`);

  const yahoo = toYahooSymbol(symbol);
  let name = symbol;
  let price = 0;
  let changePercent = 0;
  let analystCard = null;

  try {
    const [q, f] = await Promise.all([
      fetchQuotes([yahoo]).then((r) => r[0]),
      fetchFundamentals(yahoo),
    ]);
    if (q) {
      name = q.name || symbol;
      price = q.price;
      changePercent = q.changePercent;
    }
    analystCard = fromLiveFundamentals(f);
  } catch {
    /* shell */
  }

  const path = `/bist/${symbol}/hedef-fiyat`;
  const mean = analystCard?.targetPriceMean;
  const upside = analystCard?.upsidePotential;
  const year = new Date().getFullYear();

  const faqs = [
    {
      question: `${symbol} için 12 aylık analist hedefi nedir?`,
      answer:
        mean != null
          ? `${name} (${symbol}) için 12 aylık konsensüs hedef fiyatı yaklaşık ₺${mean.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} seviyesindedir${upside != null ? ` (prim potansiyeli %${upside.toFixed(1)})` : ''}. Bu yatırım tavsiyesi değildir.`
          : `${name} (${symbol}) için güncel kurumsal hedef fiyat konsensüsü bu sayfada gösterilir. Veri yoksa kurum raporları henüz yayımlanmamış olabilir.`,
    },
    {
      question: 'Bullsye AI fırsat skoru nasıl hesaplanır?',
      answer:
        'AI fırsat skoru F/K, hacim ivmesi, RSI/hareketli ortalamalar ve gün içi bant konumunun ağırlıklı bileşimiyle 0–100 arası üretilir.',
    },
    {
      question: `${symbol} hedef fiyatı nasıl okunur?`,
      answer:
        'Ortalama hedef kurum tahminlerinin konsensüsüdür; yüksek/düşük uçlar aralığı gösterir. Al/Tut/Sat dağılımı oyların özetidir — emir değildir.',
    },
  ];

  const crumbs = [
    { name: 'Bullsye', path: '/' },
    { name: 'BİST', path: '/bist' },
    { name: symbol, path: `/bist/${symbol}` },
    { name: 'Hedef Fiyat', path },
  ];

  return (
    <div className="space-y-6">
      <FinancialSchema
        symbol={symbol}
        name={name}
        price={price}
        currency="TRY"
        kind="bist"
        path={path}
      />
      <FaqSchema items={faqs} />
      <BreadcrumbSchema items={crumbs} />

      <BistMatrixShell
        symbol={symbol}
        name={name}
        price={price}
        changePercent={changePercent}
        active="hedef-fiyat"
        path={path}
        title={`${symbol} Hedef Fiyat ${year}`}
        subtitle={`${name} 12 aylık kurum konsensüsü, Al/Tut/Sat dağılımı ve prim potansiyeli.`}
        scoreHint={
          upside != null ? `prim %${upside.toFixed(1)}` : undefined
        }
      >
        {analystCard ? (
          <AnalystTargetCard data={analystCard} />
        ) : (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
            Bu sembol için kurumsal hedef fiyat konsensüsü alınamadı. Genel
            liste:{' '}
            <Link href="/targets" className="text-[var(--accent)] hover:underline">
              /targets
            </Link>
            .
          </p>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">
            {symbol} hedef fiyat nasıl yorumlanır?
          </h2>
          <p>
            Konsensüs hedef, birden fazla aracı kurumun 12 aylık tahmin
            ortalamasıdır. Prim potansiyeli canlı fiyata göredir ve getiri
            garantisi değildir. Bullsye yatırım tavsiyesi vermez.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">
            Sıkça Sorulan Sorular
          </h2>
          <dl className="space-y-3">
            {faqs.map((item) => (
              <div key={item.question}>
                <dt className="text-sm font-medium text-[var(--foreground)]">
                  {item.question}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedSymbolRail symbol={symbol} kind="bist" />
        <p className="text-[11px] text-[var(--muted)]">
          Kaynak: Yahoo Finance · {SITE_URL}
          {path}
        </p>
      </BistMatrixShell>
    </div>
  );
}
