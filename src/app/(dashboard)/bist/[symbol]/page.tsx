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
  const title = `${symbol} Canlı Fiyatı ${price} TL (${change}) | Grafik ve Yorumlar — Bullseye`;
  const description = `${name} (${symbol}) canlı hisse fiyatı, anlık grafiği, teknik analiz ve alarm kurulumu Bullseye'te. ${symbol} hisse yorum ve hedef fiyat takibi.`;
  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(symbol)}&price=${encodeURIComponent(`₺${price}`)}&change=${encodeURIComponent(change)}&label=${encodeURIComponent('BİST Canlı')}`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${symbol} canlı`,
      `${symbol} hisse fiyatı`,
      `${symbol} grafik`,
      `${symbol} analiz`,
      `${symbol} yorum`,
      `${symbol} hedef fiyat`,
    ],
    alternates: {
      canonical: `${SITE_URL}/bist/${symbol}`,
    },
    openGraph: {
      title: `${symbol} Canlı Fiyatı: ₺${price} (${change}) | Bullseye`,
      description: `Anlık ${symbol} grafik ve akıllı alım sinyallerini inceleyin.`,
      url: `${SITE_URL}/bist/${symbol}`,
      siteName: 'Bullseye',
      locale: 'tr_TR',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${symbol} Bullseye Analysis Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} ₺${price} ${change} | Bullseye`,
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
