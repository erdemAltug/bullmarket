import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AssetSeoShell } from '@/components/seo/AssetSeoShell';
import { fetchQuotes } from '@/lib/api/yahoo';
import {
  SITE_URL,
  SEO_BIST_TICKERS,
  canonicalSymbol,
  formatMetaChange,
  formatMetaPrice,
  toYahooSymbol,
} from '@/lib/seo/symbols';

export const revalidate = 60;

type Props = { params: Promise<{ symbol: string }> };

export async function generateStaticParams() {
  return SEO_BIST_TICKERS.map((symbol) => ({ symbol }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raw = (await params).symbol;
  const symbol = canonicalSymbol(raw);
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
  const canonicalUrl = `${SITE_URL}/bist/${symbol}`;
  const title = `${symbol} Canlı Hisse Fiyatı ${price} TL (${change}), Grafik & Analiz Karnesi`;
  const description = `${name} (${symbol}) Borsa İstanbul anlık fiyatı, 52 haftalık zirve/dip, F/K ve PD/DD değerleri, teknik sinyaller ve alım fırsatları Bullsye'da.`;
  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(symbol)}&price=${encodeURIComponent(`₺${price}`)}&change=${encodeURIComponent(change)}&label=${encodeURIComponent('BIST')}&type=BIST`;

  return {
    title,
    description,
    keywords: [
      `${symbol} canlı`,
      `${symbol} hisse fiyatı`,
      `${symbol} grafik`,
      `${symbol} analiz`,
      `${symbol} yorum`,
      `${symbol} hedef fiyat`,
      'BİST canlı',
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${symbol} Hisse Analizi & Canlı Grafik | Bullsye`,
      description: `${symbol} hisse senedi canlı veri ve akıllı alım sinyalleri.`,
      url: canonicalUrl,
      siteName: 'Bullsye',
      locale: 'tr_TR',
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

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <h2 className="mb-2 text-base font-semibold text-zinc-100">
          {symbol} hakkında
        </h2>
        <p>
          {quote.name} ({symbol}) Borsa İstanbul&apos;da işlem gören bir
          menkul kıymettir. Bu sayfada canlı fiyat, günlük değişim ve interaktif
          grafik yer alır. Alarm kurmak için fiyat kartına tıklayabilir veya
          Overview üzerinden watchlist&apos;inize ekleyebilirsiniz.
        </p>
      </section>
    </AssetSeoShell>
  );
}
