import type { Metadata } from 'next';
import { permanentRedirect, notFound } from 'next/navigation';
import { AnalystTargetCard } from '@/components/asset/AnalystTargetCard';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { CryptoHealthScorecard } from '@/components/dashboard/AssetHealthScorecard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { OrderBookDepth } from '@/components/dashboard/OrderBookDepth';
import { AssetSeoShell } from '@/components/seo/AssetSeoShell';
import { fetchOrderBook, fetchTickers } from '@/lib/api/binance';
import { fromLiveCryptoBand } from '@/lib/analystData';
import { resolveSeoLang, withLangAlternates } from '@/lib/seo/hreflang';
import { absoluteCanonical } from '@/lib/seo/canonical';
import {
  SEO_CRYPTO_SYMBOLS,
  formatMetaChange,
  formatMetaPrice,
  isIndexedCryptoSymbol,
} from '@/lib/seo/symbols';

export const revalidate = 300;

type Props = {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function normalizeCrypto(raw: string): string {
  let s = raw.trim().toUpperCase();
  if (!s.endsWith('USDT') && !s.endsWith('USD')) s = `${s}USDT`;
  return s;
}

export async function generateStaticParams() {
  return SEO_CRYPTO_SYMBOLS.slice(0, 100).map((symbol) => ({ symbol }));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const symbol = normalizeCrypto((await params).symbol);
  const display = symbol.replace('USDT', '');
  const lang = resolveSeoLang((await searchParams).lang);
  const isTr = lang === 'tr';

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
  const hasLiveQuote = priceNum > 0;
  const path = `/kripto/${symbol}`;
  const canonicalUrl = absoluteCanonical(path, { upperSymbol: true });
  const year = new Date().getFullYear();

  const title = isTr
    ? `${display} Hedef Fiyat ${year}, Analiz Skoru ve Canlı Grafik | Bullsye`
    : `${display} Price Target ${year}, Score & Live Chart | Bullsye`;

  const description = isTr
    ? `${display} (${symbol}) için canlı fiyat, prim potansiyeli ve Bullsye analiz skorunu inceleyin.${hasLiveQuote ? ` Canlı: $${price} (${change}).` : ''}`
    : `Live ${display} (${symbol}) quote, depth and Bullsye score.${hasLiveQuote ? ` Now $${price} (${change}).` : ''}`;

  return {
    title: { absolute: title },
    description,
    keywords: isTr
      ? [`${display} canlı`, `${display} fiyat`, `${symbol} grafik`, 'kripto sinyal']
      : [`${display} live price`, `${display} chart`, 'crypto signal radar'],
    alternates: withLangAlternates(path),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Bullsye',
      locale: isTr ? 'tr_TR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function KriptoSymbolPage({ params }: Props) {
  const raw = (await params).symbol;
  const symbol = normalizeCrypto(raw);
  if (!isIndexedCryptoSymbol(symbol)) notFound();
  if (raw.toUpperCase() !== symbol) permanentRedirect(`/kripto/${symbol}`);

  const display = symbol.replace('USDT', '');
  let price = 0;
  let changePercent = 0;
  let high24h = 0;
  let low24h = 0;
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
      high24h = t.high24h;
      low24h = t.low24h;
    }
    orderbook = book;
  } catch {
    /* empty */
  }

  const analystCard =
    price > 0
      ? fromLiveCryptoBand({
          symbol,
          price,
          high24h: high24h || price * 1.02,
          low24h: low24h || price * 0.98,
          changePercent,
        })
      : null;

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
      <CryptoHealthScorecard
        symbol={symbol}
        changePercent={changePercent}
        price={price}
        displaySymbol={display}
      />
      {analystCard ? <AnalystTargetCard data={analystCard} /> : null}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
        <h2 className="mb-2 text-base font-semibold text-zinc-100">
          {display} hakkında
        </h2>
        <p>
          {display} için canlı USDT çifti fiyatı, 24 saatlik değişim, grafik,
          momentum karnesi ve emir defteri bu sayfada toplanır.
        </p>
      </section>
    </AssetSeoShell>
  );
}
