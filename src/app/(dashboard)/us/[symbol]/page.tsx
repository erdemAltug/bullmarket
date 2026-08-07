import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
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
  SEO_US_TICKERS,
  formatMetaChange,
  formatMetaPrice,
  isIndexedUsSymbol,
} from '@/lib/seo/symbols';

export const revalidate = 60;

type Props = {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function canonicalUsSymbol(raw: string): string {
  return raw.trim().toUpperCase();
}

export function generateStaticParams() {
  return SEO_US_TICKERS.slice(0, 48).map((symbol) => ({ symbol }));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const raw = (await params).symbol;
  const symbol = canonicalUsSymbol(raw);
  const lang = resolveSeoLang((await searchParams).lang);
  const isTr = lang === 'tr';

  let priceNum = 0;
  let changeNum = 0;
  let name = symbol;
  try {
    const [q] = await fetchQuotes([symbol]);
    if (q) {
      priceNum = q.price;
      changeNum = q.changePercent;
      name = q.name || symbol;
    }
  } catch {
    /* metadata still renders */
  }

  const price = formatMetaPrice(priceNum, 'USD');
  const change = formatMetaChange(changeNum);
  const hasLiveQuote = priceNum > 0;
  const path = `/us/${symbol}`;
  const canonicalUrl = `${SITE_URL}${path}`;

  const title = isTr
    ? hasLiveQuote
      ? `${symbol} Canlı ABD Hisse Fiyatı $${price} (${change}) | NASDAQ`
      : `${symbol} Hisse Analizi, Canlı Grafik ve Hedef Fiyat | NASDAQ`
    : hasLiveQuote
      ? `${symbol} Live US Stock $${price} (${change}) — NASDAQ Chart`
      : `${symbol} Stock Analysis, Live Chart & Price Targets`;

  const description = isTr
    ? `${name} (${symbol}) NASDAQ/NYSE anlık fiyat, F/K, analist hedef ve grafik — Bullsye.`
    : `Real-time ${name} (${symbol}) US equity chart, PE, analyst targets on Bullsye.`;

  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(symbol)}&price=${encodeURIComponent(hasLiveQuote ? `$${price}` : 'Stock Analysis')}&change=${encodeURIComponent(hasLiveQuote ? change : 'NASDAQ')}&label=${encodeURIComponent('NASDAQ')}&type=US&lang=${lang}`;

  return {
    title,
    description,
    keywords: isTr
      ? [
          `${symbol} canlı`,
          `${symbol} hisse`,
          `${symbol} NASDAQ`,
          'ABD hisseleri',
          'NASDAQ canlı',
        ]
      : [
          `${symbol} live price`,
          `${symbol} NASDAQ`,
          `${symbol} stock chart`,
          'US stocks',
        ],
    alternates: withLangAlternates(path),
    openGraph: {
      title: isTr
        ? `${symbol} ABD Hisse Analizi | Bullsye`
        : `${symbol} US Stock Analysis | Bullsye`,
      description,
      url: canonicalUrl,
      siteName: 'Bullsye',
      locale: isTr ? 'tr_TR' : 'en_US',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: symbol }],
    },
    twitter: {
      card: 'summary_large_image',
      title: hasLiveQuote
        ? `${symbol} $${price} ${change} | Bullsye`
        : `${symbol} Stock Analysis | Bullsye`,
      description,
      images: [ogImage],
    },
  };
}

export default async function UsSymbolPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = canonicalUsSymbol(raw);

  if (!symbol || !isIndexedUsSymbol(symbol)) notFound();
  if (raw !== symbol) permanentRedirect(`/us/${symbol}`);

  let quote: {
    name: string;
    price: number;
    changePercent: number;
    currency: 'TRY' | 'USD';
  } = {
    name: symbol,
    price: 0,
    changePercent: 0,
    currency: 'USD',
  };

  try {
    const [q] = await fetchQuotes([symbol]);
    if (q) {
      quote = {
        name: q.name || symbol,
        price: q.price,
        changePercent: q.changePercent,
        currency: 'USD',
      };
    }
  } catch {
    /* show page shell anyway */
  }

  let fundamentals = null;
  let analystCard = null;
  try {
    fundamentals = await fetchFundamentals(symbol);
    analystCard = fromLiveFundamentals(fundamentals);
  } catch {
    fundamentals = null;
    analystCard = null;
  }

  return (
    <AssetSeoShell
      symbol={symbol}
      name={quote.name}
      price={quote.price}
      changePercent={quote.changePercent}
      currency="USD"
      currencySymbol="$"
      kind="us"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <ChartPanel
          title={`${symbol} · Live chart`}
          symbol={symbol}
          source="yahoo"
          isPositive={quote.changePercent >= 0}
          currencySymbol="$"
          defaultTimeframe="1M"
          height={400}
          detailed
        />
        <MetricCard
          title={quote.name}
          value={quote.price}
          changePercent={quote.changePercent}
          currency="USD"
          subtitle="NASDAQ / NYSE"
        />
      </div>

      {fundamentals ? (
        <AssetFundamentalsStrip data={fundamentals} currencySymbol="$" />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <BistHealthScorecard
          yahooSymbol={symbol}
          displaySymbol={symbol}
          changePercent={quote.changePercent}
        />
        {analystCard ? <AnalystTargetCard data={analystCard} /> : null}
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">
          {symbol} detailed analysis
        </h2>
        <p>
          {quote.name} ({symbol}) ABD piyasalarında işlem görür. Canlı grafik
          (SMA 20/50 + hacim), çarpanlar, AI sağlık karnesi ve analist hedef
          konsensüsü bu sayfada bir arada. Kıyas için{' '}
          <a href="/compare" className="text-[var(--accent)] hover:underline">
            1v1 Compare
          </a>
          .
        </p>
      </section>
    </AssetSeoShell>
  );
}
