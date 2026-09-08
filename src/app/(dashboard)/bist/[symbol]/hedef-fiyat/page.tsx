import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { AnalystTargetCard } from '@/components/asset/AnalystTargetCard';
import {
  BreadcrumbSchema,
  FaqSchema,
  FinancialSchema,
} from '@/components/seo/FinancialSchema';
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
    <article className="space-y-6">
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

      <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-zinc-700">/</span> : null}
              {i === crumbs.length - 1 ? (
                <span className="text-zinc-300">{c.name}</span>
              ) : (
                <Link href={c.path} className="hover:text-emerald-400">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
          Analist hedef fiyat · {year}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          {symbol} Hedef Fiyat
        </h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          {name} ({symbol}) 12 aylık kurum konsensüsü, Al/Tut/Sat dağılımı ve
          prim potansiyeli. Canlı fiyat ve grafik için{' '}
          <Link
            href={`/bist/${symbol}`}
            className="text-emerald-400 hover:underline"
          >
            {symbol} hisse sayfası
          </Link>
          .
        </p>
        {price > 0 ? (
          <p className="text-xl font-semibold tabular-nums text-zinc-100">
            Canlı ₺{price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}{' '}
            <span
              className={
                changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              ({changePercent >= 0 ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </span>
          </p>
        ) : null}
      </header>

      {analystCard ? (
        <AnalystTargetCard data={analystCard} />
      ) : (
        <p className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
          Bu sembol için şu an kurumsal hedef fiyat konsensüsü alınamadı.
          Genel liste:{' '}
          <Link href="/targets" className="text-emerald-400 hover:underline">
            /targets
          </Link>
          .
        </p>
      )}

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <h2 className="mb-2 text-base font-semibold text-zinc-100">
          {symbol} hedef fiyat nasıl yorumlanır?
        </h2>
        <p>
          Konsensüs hedef, birden fazla aracı kurumun 12 aylık tahmin
          ortalamasıdır. Prim potansiyeli canlı fiyata göredir ve getiri
          garantisi değildir. Bullsye yatırım tavsiyesi vermez; karar size
          aittir.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-100">
          Sıkça Sorulan Sorular
        </h2>
        <dl className="space-y-3">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="text-sm font-medium text-zinc-200">
                {item.question}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedSymbolRail symbol={symbol} kind="bist" />

      <p className="text-[11px] text-zinc-600">
        Kaynak: Yahoo Finance analist alanları · {SITE_URL}
        {path}
      </p>
    </article>
  );
}
