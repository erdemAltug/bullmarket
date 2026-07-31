import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { OrderBookDepth } from '@/components/dashboard/OrderBookDepth';
import { AssetSeoShell } from '@/components/seo/AssetSeoShell';
import { fetchOrderBook, fetchTickers } from '@/lib/api/binance';
import {
  SITE_URL,
  SEO_CRYPTO_SYMBOLS,
  formatMetaChange,
  formatMetaPrice,
} from '@/lib/seo/symbols';

export const revalidate = 60;

type Props = { params: Promise<{ symbol: string }> };

function normalizeCrypto(raw: string): string {
  let s = raw.trim().toUpperCase();
  if (!s.endsWith('USDT') && !s.endsWith('USD')) s = `${s}USDT`;
  return s;
}

export async function generateStaticParams() {
  return SEO_CRYPTO_SYMBOLS.map((symbol) => ({ symbol }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symbol = normalizeCrypto((await params).symbol);
  const display = symbol.replace('USDT', '');

  let priceNum = 0;
  let changeNum = 0;
  try {
    const [t] = await fetchTickers([symbol]);
    if (t) {
      priceNum = t.price;
      changeNum = t.changePercent;
    }
  } catch {
    /* ignore */
  }

  const price = formatMetaPrice(priceNum, 'USD');
  const change = formatMetaChange(changeNum);
  const canonicalUrl = `${SITE_URL}/crypto/${symbol}`;
  const title = `${display} Canlı Fiyatı $${price} (${change}), Grafiği & Sinyal Radarı`;
  const description = `${display} (${symbol}) 24 saatlik canlı fiyat değişimi, hacim derinliği (Order Book), RSI kırılım sinyalleri ve canlı grafik takibi Bullsye Terminal'de.`;
  const ogImage = `${SITE_URL}/api/og?symbol=${encodeURIComponent(display)}&price=${encodeURIComponent(`$${price}`)}&change=${encodeURIComponent(change)}&label=${encodeURIComponent('CRYPTO')}&type=CRYPTO`;

  return {
    title,
    description,
    keywords: [
      `${display} canlı`,
      `${display} fiyat`,
      `${symbol} grafik`,
      `${display} USDT`,
      'kripto grafik',
      'kripto sinyal',
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${display} Canlı Kripto Analizi | Bullsye`,
      description: `Anlık ${display} grafik, hacim ve sinyal radarı.`,
      url: canonicalUrl,
      siteName: 'Bullsye',
      images: [{ url: ogImage, width: 1200, height: 630, alt: display }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${display} $${price} ${change} | Bullsye`,
      images: [ogImage],
    },
  };
}

export default async function CryptoSymbolPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = normalizeCrypto(raw);
  if (raw.toUpperCase() !== symbol) permanentRedirect(`/crypto/${symbol}`);

  const display = symbol.replace('USDT', '');
  let price = 0;
  let changePercent = 0;
  let orderbook = null;

  try {
    const [tickers, book] = await Promise.all([
      fetchTickers([symbol]),
      fetchOrderBook(symbol, 12).catch(() => null),
    ]);
    const t = tickers[0];
    if (t) {
      price = t.price;
      changePercent = t.changePercent;
    }
    orderbook = book;
  } catch {
    /* empty */
  }

  return (
    <AssetSeoShell
      symbol={display}
      name={symbol}
      price={price}
      changePercent={changePercent}
      currency="USD"
      currencySymbol="$"
      kind="crypto"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricCard
          title={display}
          value={price}
          changePercent={changePercent}
          currency="USD"
        />
        <ChartPanel
          title={display}
          symbol={symbol}
          source="binance"
          isPositive={changePercent >= 0}
          currencySymbol="$"
          defaultTimeframe="1D"
        />
      </div>
      {orderbook ? <OrderBookDepth orderbook={orderbook} /> : null}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <h2 className="mb-2 text-base font-semibold text-zinc-100">
          {display} hakkında
        </h2>
        <p>
          {display} için canlı USDT çifti fiyatı, 24 saatlik değişim, grafik ve
          emir defteri bu sayfada toplanır. Teknik takip ve fiyat alarmı
          Bullsye üzerinden yönetilebilir.
        </p>
      </section>
    </AssetSeoShell>
  );
}
