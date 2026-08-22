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
  SEO_BIST_TICKERS,
  canonicalSymbol,
  formatMetaChange,
  formatMetaPrice,
  isIndexedBistSymbol,
  toYahooSymbol,
} from '@/lib/seo/symbols';

export const revalidate = 60;

type Props = {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.slice(0, 48).map((symbol) => ({ symbol }));
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
  const canonicalUrl = `${SITE_URL}${path}`;

  const title = isTr
    ? hasLiveQuote
      ? `${symbol} Hisse Fiyatı ${price} TL (${change}) — Hedef Fiyat ve Analiz`
      : `${symbol} Hisse Analizi, Hedef Fiyat, Grafik ve Yorum`
    : hasLiveQuote
      ? `${symbol} Live Price ${price} TRY (${change}) — Chart & Targets`
      : `${symbol} Stock Analysis, Live Chart & Price Targets`;

  const description = isTr
    ? `${name} (${symbol}) Borsa İstanbul anlık fiyatı, 52 haftalık zirve/dip, F/K ve PD/DD değerleri, teknik sinyaller ve alım fırsatları Bullsye'da.`
    : `Real-time ${name} (${symbol}) BIST price chart, technical indicators, analyst targets, and AI signal breakdown on Bullsye Terminal.`;

  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(symbol)}&price=${encodeURIComponent(hasLiveQuote ? `₺${price}` : 'Canlı Analiz')}&change=${encodeURIComponent(hasLiveQuote ? change : 'BİST')}&label=${encodeURIComponent(isTr ? 'BIST' : 'BIST Live')}&type=BIST&lang=${lang}`;

  return {
    title,
    description,
    keywords: isTr
      ? [
          `${symbol} canlı`,
          `${symbol} hisse fiyatı`,
          `${symbol} grafik`,
          `${symbol} analiz`,
          `${symbol} hedef fiyat`,
          `${symbol} analist tavsiyesi`,
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
      title: hasLiveQuote
        ? `${symbol} ₺${price} ${change} | Bullsye`
        : `${symbol} Hisse Analizi | Bullsye`,
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

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">
          {symbol} detaylı analiz
        </h2>
        <p>
          {quote.name} ({symbol}) Borsa İstanbul&apos;da işlem görür. Bu
          sayfada canlı grafik (SMA 20/50 + hacim), F/K–PD/DD çarpanları, 52
          haftalık aralık, AI sağlık karnesi ve 12 aylık analist hedef
          konsensüsü bulunur. Alarm için fiyat kartına tıklayın; kıyas için{' '}
          <a href="/compare" className="text-[var(--accent)] hover:underline">
            1v1 Kıyasla
          </a>
          .
        </p>
      </section>
    </AssetSeoShell>
  );
}
