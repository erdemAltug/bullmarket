import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { SymbolAnalysisIsland } from '@/components/analysis/SymbolAnalysisIsland';
import { AnalystTargetCard } from '@/components/asset/AnalystTargetCard';
import { AssetFundamentalsStrip } from '@/components/asset/AssetFundamentalsStrip';
import { BistHealthScorecard } from '@/components/dashboard/AssetHealthScorecard';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AssetSeoShell } from '@/components/seo/AssetSeoShell';
import { fetchFundamentals, fetchQuotes } from '@/lib/api/yahoo';
import { fromLiveFundamentals } from '@/lib/analystData';
import { resolveSeoLang, withLangAlternates } from '@/lib/seo/hreflang';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  canonicalSymbol,
  formatMetaChange,
  formatMetaPrice,
  isIndexedBistSymbol,
  toYahooSymbol,
} from '@/lib/seo/symbols';
import { absoluteCanonical } from '@/lib/seo/canonical';

export const revalidate = 300;
export const dynamicParams = true;

type Props = {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.filter((s) => !s.startsWith('XU'))
    .slice(0, 100)
    .map((symbol) => ({ symbol }));
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
  const hasLiveQuote = priceNum > 0;
  const path = `/bist/${symbol}`;
  const canonicalUrl = absoluteCanonical(path, { upperSymbol: true });

  const year = new Date().getFullYear();
  const title = isTr
    ? `${symbol} Analiz Skoru, Canlı Fiyat ve Grafik ${year} | Bullsye`
    : `${symbol} Analysis Score, Live Price & Chart ${year} | Bullsye`;

  const description = isTr
    ? `${name} (${symbol}) canlı fiyat, Bullsye analiz skoru (0–100), temel rasyolar ve grafik.${hasLiveQuote ? ` Şimdi: ₺${price} (${change}).` : ''} Yatırım tavsiyesi değildir.`
    : `Live ${name} (${symbol}) BIST quote, Bullsye score (0–100), fundamentals and chart.${hasLiveQuote ? ` Now ₺${price} (${change}).` : ''}`;

  const ogImage = `${SITE_URL}/api/og/bist/${encodeURIComponent(symbol)}`;

  return {
    title: { absolute: title },
    description,
    keywords: isTr
      ? [
          `${symbol} canlı`,
          `${symbol} hisse fiyatı`,
          `${symbol} grafik`,
          `${symbol} analiz skoru`,
          `${symbol} analiz`,
          'BİST canlı',
        ]
      : [
          `${symbol} live price`,
          `${symbol} chart`,
          `${symbol} stock analysis`,
          'BIST live',
          'stock scorecard',
        ],
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
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
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BistSymbolPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);

  if (!symbol || symbol === 'HEATMAP' || !isIndexedBistSymbol(symbol)) {
    notFound();
  }
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

  let fundamentals = null;
  let analystCard = null;
  try {
    fundamentals = await fetchFundamentals(yahoo);
    analystCard = fromLiveFundamentals(fundamentals);
  } catch {
    fundamentals = null;
    analystCard = null;
  }

  const currencySymbol = quote.currency === 'USD' ? '$' : '₺';

  return (
    <AssetSeoShell
      symbol={symbol}
      name={quote.name}
      price={quote.price}
      changePercent={quote.changePercent}
      currency={quote.currency}
      currencySymbol={currencySymbol}
      kind="bist"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <ChartPanel
          title={`${symbol} · Canlı grafik`}
          symbol={yahoo}
          source="yahoo"
          isPositive={quote.changePercent >= 0}
          currencySymbol={currencySymbol}
          defaultTimeframe="1M"
          height={400}
          detailed
        />
        <MetricCard
          title={quote.name}
          value={quote.price}
          changePercent={quote.changePercent}
          currency={quote.currency}
          subtitle="Borsa İstanbul"
        />
      </div>

      {fundamentals ? (
        <AssetFundamentalsStrip
          data={fundamentals}
          currencySymbol={currencySymbol}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <BistHealthScorecard
          yahooSymbol={yahoo}
          displaySymbol={symbol}
          changePercent={quote.changePercent}
        />
        {analystCard ? <AnalystTargetCard data={analystCard} /> : null}
      </div>

      <SymbolAnalysisIsland symbol={symbol} yahooSymbol={yahoo} />
    </AssetSeoShell>
  );
}
