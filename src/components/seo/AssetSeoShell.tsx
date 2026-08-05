import Link from 'next/link';
import { AssetReturnLoop } from '@/components/asset/AssetReturnLoop';
import {
  BreadcrumbSchema,
  FinancialSchema,
  FaqSchema,
} from '@/components/seo/FinancialSchema';
import { assetDetailHref } from '@/lib/seo/internal-links';
import { peersFor } from '@/lib/sector-peers';
import { toYahooSymbol } from '@/lib/seo/symbols';

interface SeoShellProps {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: 'TRY' | 'USD';
  currencySymbol: string;
  kind: 'bist' | 'crypto' | 'fx' | 'us';
  children: React.ReactNode;
  faqs?: { question: string; answer: string }[];
}

export function AssetSeoShell({
  symbol,
  name,
  price,
  changePercent,
  currency,
  currencySymbol,
  kind,
  children,
  faqs,
}: SeoShellProps) {
  const positive = changePercent >= 0;
  const kindLabel =
    kind === 'bist'
      ? 'Hisse'
      : kind === 'crypto'
        ? 'Kripto'
        : kind === 'us'
          ? 'ABD Hisse'
          : 'Döviz';
  const hubPath =
    kind === 'bist'
      ? '/bist'
      : kind === 'crypto'
        ? '/crypto'
        : kind === 'us'
          ? '/us'
          : '/fx/USD-TRY';
  const hubLabel =
    kind === 'bist'
      ? 'BİST'
      : kind === 'crypto'
        ? 'Kripto'
        : kind === 'us'
          ? 'NASDAQ'
          : 'Döviz';
  const selfPath =
    kind === 'bist'
      ? `/bist/${symbol}`
      : kind === 'crypto'
        ? `/crypto/${symbol.endsWith('USDT') ? symbol : `${symbol}USDT`}`
        : kind === 'us'
          ? `/us/${symbol}`
          : `/fx/${symbol}`;

  const defaultFaqs = [
    {
      question: `${symbol} canlı fiyatı nedir?`,
      answer: `${name} (${symbol}) güncel fiyatı ${currencySymbol}${price.toLocaleString('tr-TR')} seviyesindedir. Günlük değişim %${changePercent.toFixed(2)}. Bullsye üzerinde anlık takip edilir.`,
    },
    {
      question: `${symbol} hisse / varlık analizi nasıl yapılır?`,
      answer: `${symbol} için Bullsye'da temel analiz karnesi, analist hedef fiyat konsensüsü, AI özet yorumu, teknik grafik ve alarm kurulumu bir arada sunulur.`,
    },
    {
      question: `${symbol} analist hedef fiyatı nerede?`,
      answer: `${symbol} sayfasındaki Analist Konsensüs bölümünde 12 aylık ortalama, en yüksek/en düşük hedef ve kurum raporları yer alır. Ayrıca /targets sayfasında karşılaştırabilirsiniz.`,
    },
    {
      question: `${symbol} için alarm nasıl kurulur?`,
      answer: `Bullsye üzerinde ${symbol} için fiyat üstü/altı, yüzde hareket ve RSI kırılım alarmları oluşturabilirsiniz.`,
    },
  ];

  const faqItems = faqs ?? defaultFaqs;

  const peerLinks =
    kind === 'bist'
      ? (peersFor(toYahooSymbol(symbol))?.peers ?? [])
          .map((p) => p.replace('.IS', ''))
          .slice(0, 4)
      : kind === 'crypto'
        ? ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'].filter(
            (s) => !symbol.includes(s.replace('USDT', ''))
          )
        : kind === 'us'
          ? ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META']
              .filter((s) => s !== symbol)
              .slice(0, 4)
          : ['USD-TRY', 'EUR-TRY', 'XAU-TRY'];

  const crumbs = [
    { name: 'Bullsye', path: '/' },
    { name: hubLabel, path: hubPath },
    { name: symbol, path: selfPath },
  ];

  return (
    <article className="space-y-6">
      <FinancialSchema
        symbol={symbol}
        name={name}
        price={price}
        currency={currency}
        changePercent={changePercent}
        kind={kind}
      />
      <FaqSchema items={faqItems} />
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
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {kindLabel} · Canlı Analiz
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          {symbol}{' '}
          <span className="text-lg font-normal text-zinc-400">· {name}</span>
        </h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          {symbol} canlı fiyat, grafik, temel analiz karnesi, analist hedef
          fiyatları ve AI yorum — Bullsye finans terminali.
        </p>
        <p
          className={`text-2xl font-semibold tabular-nums ${
            positive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {currencySymbol}
          {price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}{' '}
          <span className="text-base font-medium">
            ({positive ? '+' : ''}
            {changePercent.toFixed(2)}%)
          </span>
        </p>
      </header>

      {children}

      <AssetReturnLoop symbol={symbol} name={name} href={selfPath} />

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-100">
          Sıkça Sorulan Sorular
        </h2>
        <dl className="space-y-3">
          {faqItems.map((item) => (
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

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-100">
          İlgili Analizler
        </h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {peerLinks.map((p) => {
            const href =
              kind === 'fx'
                ? `/fx/${p}`
                : assetDetailHref(
                    p,
                    kind === 'crypto'
                      ? 'CRYPTO'
                      : kind === 'us'
                        ? 'US'
                        : 'BIST'
                  );
            if (!href) return null;
            return (
              <li key={p}>
                <Link
                  href={href}
                  className="rounded-lg border border-zinc-700 px-2.5 py-1 text-emerald-400 hover:border-emerald-500/40"
                >
                  {p.replace('USDT', '')} analizi
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/targets"
              className="rounded-lg border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-emerald-500/40"
            >
              Hedef fiyatlar
            </Link>
          </li>
          <li>
            <Link
              href="/compare"
              className="rounded-lg border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-emerald-500/40"
            >
              1v1 kıyasla
            </Link>
          </li>
          {kind === 'bist' ? (
            <li>
              <Link
                href="/dividends"
                className="rounded-lg border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-emerald-500/40"
              >
                Temettü takvimi
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
    </article>
  );
}
