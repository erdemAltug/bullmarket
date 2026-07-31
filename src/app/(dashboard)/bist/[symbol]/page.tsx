import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { AnalystTargetCard } from '@/components/asset/AnalystTargetCard';
import { BistHealthScorecard } from '@/components/dashboard/AssetHealthScorecard';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AssetSeoShell } from '@/components/seo/AssetSeoShell';
import { fetchQuotes } from '@/lib/api/yahoo';
import { getAssetAnalystDetails } from '@/lib/analystData';
import { resolveSeoLang, withLangAlternates } from '@/lib/seo/hreflang';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  canonicalSymbol,
  formatMetaChange,
  formatMetaPrice,
  toYahooSymbol,
} from '@/lib/seo/symbols';

export const revalidate = 60;

type Props = {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.map((symbol) => ({ symbol }));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);
  const lang = resolveSeoLang((await searchParams).lang);
  const isTr = lang === 'tr';
  const yahoo = toYahooSymbol(symbol);

  let priceNum = 0;
  let changeNum = 0;
  let name = symbol;
  try {
    const [q] = await fetchQuotes([yahoo]);
    if (q) {
      priceNum = q.price;
      changeNum = q.changePercent;
      name = q.name || symbol;
    }
  } catch {
    /* metadata still renders */
  }

  const price = formatMetaPrice(priceNum, 'TRY');
  const change = formatMetaChange(changeNum);
  const path = `/bist/${symbol}`;
  const canonicalUrl = `${SITE_URL}${path}`;

  const title = isTr
    ? `${symbol} Canlı Hisse Fiyatı ${price} TL (${change}), Grafik & Analiz Karnesi`
    : `${symbol} Live Price ${price} TRY (${change}) — Chart & AI Scorecard`;

  const description = isTr
    ? `${name} (${symbol}) Borsa İstanbul anlık fiyatı, 52 haftalık zirve/dip, F/K ve PD/DD değerleri, teknik sinyaller ve alım fırsatları Bullsye'da.`
    : `Real-time ${name} (${symbol}) BIST price chart, technical indicators, analyst targets, and AI signal breakdown on Bullsye Terminal.`;

  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(symbol)}&price=${encodeURIComponent(`₺${price}`)}&change=${encodeURIComponent(change)}&label=${encodeURIComponent(isTr ? 'BIST' : 'BIST Live')}&type=BIST&lang=${lang}`;

  return {
    title,
    description,
    keywords: isTr
      ? [
          `${symbol} canlı`,
          `${symbol} hisse fiyatı`,
          `${symbol} grafik`,
          `${symbol} analiz`,
          `${symbol} yorum`,
          'BİST canlı',
        ]
      : [
          `${symbol} live price`,
          `${symbol} chart`,
          `${symbol} stock analysis`,
          'BIST live',
          'AI stock scorecard',
        ],
    alternates: withLangAlternates(path),
    openGraph: {
      title: isTr
        ? `${symbol} Hisse Analizi & Canlı Grafik | Bullsye`
        : `${symbol} Live Chart & AI Signals | Bullsye`,
      description: isTr
        ? `${symbol} hisse senedi canlı veri ve akıllı alım sinyalleri.`
        : `Live ${symbol} quotes, charts and smart buy signals.`,
      url: canonicalUrl,
      siteName: 'Bullsye',
      locale: isTr ? 'tr_TR' : 'en_US',
      alternateLocale: [isTr ? 'en_US' : 'tr_TR'],
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${symbol} Bullsye Analysis Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} ₺${price} ${change} | Bullsye`,
      description,
      images: [ogImage],
    },
  };
}

export default async function BistSymbolPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);

  if (!symbol || symbol === 'HEATMAP') notFound();
  if (raw !== symbol) permanentRedirect(`/bist/${symbol}`);

  const yahoo = toYahooSymbol(symbol);
  let quote: {
    name: string;
    price: number;
    changePercent: number;
    currency: 'TRY' | 'USD';
  } = {
    name: symbol,
    price: 0,
    changePercent: 0,
    currency: 'TRY',
  };

  try {
    const [q] = await fetchQuotes([yahoo]);
    if (q) {
      quote = {
        name: q.name || symbol,
        price: q.price,
        changePercent: q.changePercent,
        currency: q.currency === 'USD' ? 'USD' : 'TRY',
      };
    }
  } catch {
    /* show page shell anyway */
  }

  return (
    <AssetSeoShell
      symbol={symbol}
      name={quote.name}
      price={quote.price}
      changePercent={quote.changePercent}
      currency={quote.currency}
      currencySymbol={quote.currency === 'USD' ? '$' : '₺'}
      kind="bist"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricCard
          title={quote.name}
          value={quote.price}
          changePercent={quote.changePercent}
          currency={quote.currency}
        />
        <ChartPanel
          title={symbol}
          symbol={yahoo}
          source="yahoo"
          isPositive={quote.changePercent >= 0}
          defaultTimeframe="5D"
        />
      </div>

      <BistHealthScorecard yahooSymbol={yahoo} />

      <AnalystTargetCard
        data={getAssetAnalystDetails(symbol, quote.price, 'BIST')}
      />

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <h2 className="mb-2 text-base font-semibold text-zinc-100">
          {symbol} hakkında
        </h2>
        <p>
          {quote.name} ({symbol}) Borsa İstanbul&apos;da işlem gören bir
          menkul kıymettir. Bu sayfada canlı fiyat, AI sağlık karnesi, 12 aylık
          analist hedef fiyat konsensüsü, kurum raporları ve interaktif grafik
          yer alır. Alarm kurmak için fiyat kartına tıklayabilir veya Overview
          üzerinden watchlist&apos;inize ekleyebilirsiniz.
        </p>
      </section>
    </AssetSeoShell>
  );
}
