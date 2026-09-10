import Link from 'next/link';
import { AssetReturnLoop } from '@/components/asset/AssetReturnLoop';
import {
  BreadcrumbSchema,
  FinancialSchema,
  FaqSchema,
} from '@/components/seo/FinancialSchema';
import { RelatedSymbolRail } from '@/components/seo/RelatedSymbolRail';
import { ShareScorecardButton } from '@/components/seo/ShareScorecardButton';
import { SymbolMatrixNav } from '@/components/seo/SymbolMatrixNav';
import { SymbolSocialProof } from '@/components/seo/SymbolSocialProof';
import { StickyInventoryWidget } from '@/components/seo/StickyInventoryWidget';
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
        ? '/kripto'
        : kind === 'us'
          ? '/nasdaq'
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
        ? `/kripto/${symbol.endsWith('USDT') ? symbol : `${symbol}USDT`}`
        : kind === 'us'
          ? `/nasdaq/${symbol}`
          : `/fx/${symbol}`;

  const defaultFaqs = [
    {
      question: `${symbol} için 12 aylık analist hedefi nedir?`,
      answer: `${name} (${symbol}) sayfasındaki Analist Konsensüs bölümünde 12 aylık ortalama, en yüksek/en düşük hedef ve kurum dağılımı yer alır. Yatırım tavsiyesi değildir.`,
    },
    {
      question: 'Bullsye analiz skoru nasıl hesaplanır?',
      answer:
        'Analiz skoru F/K, hacim ivmesi, RSI/hareketli ortalamalar ve gün içi bant konumunun ağırlıklı bileşimiyle 0–100 arası üretilir. Sinyal veya emir değildir.',
    },
    {
      question: `${symbol} canlı fiyatı nedir?`,
      answer: `${name} (${symbol}) güncel fiyatı ${currencySymbol}${price.toLocaleString('tr-TR')} seviyesindedir. Günlük değişim %${changePercent.toFixed(2)}. Bullsye üzerinde anlık takip edilir.`,
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
        path={selfPath}
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

      <div
        className={
          kind === 'bist'
            ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]'
            : undefined
        }
      >
        <div className="space-y-4">
          {kind === 'bist' ? (
            <>
              <SymbolMatrixNav symbol={symbol} active="" />
              <SymbolSocialProof symbol={symbol} />
            </>
          ) : null}

          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {kindLabel}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              {symbol}{' '}
              <span className="text-lg font-normal text-zinc-400">· {name}</span>
            </h1>
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
            {kind === 'bist' ? (
              <ShareScorecardButton symbol={symbol} path={selfPath} />
            ) : null}
          </header>

          {children}
        </div>
        {kind === 'bist' ? (
          <StickyInventoryWidget
            symbol={symbol}
            name={name}
            price={price}
          />
        ) : null}
      </div>

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

      {kind === 'fx' ? (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <h2 className="mb-3 text-base font-semibold text-zinc-100">
            İlgili Analizler
          </h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {peerLinks.map((p) => (
              <li key={p}>
                <Link
                  href={`/fx/${p}`}
                  className="rounded-lg border border-zinc-700 px-2.5 py-1 text-emerald-400 hover:border-emerald-500/40"
                >
                  {p} analizi
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <RelatedSymbolRail
          symbol={symbol}
          kind={kind === 'us' ? 'us' : kind === 'crypto' ? 'crypto' : 'bist'}
        />
      )}

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="mb-3 text-base font-semibold text-zinc-100">
          İlgili araçlar
        </h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link
              href="/firsatlar"
              className="rounded-lg border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-emerald-500/40"
            >
              Skor taraması
            </Link>
          </li>
          <li>
            <Link
              href="/targets"
              className="rounded-lg border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-emerald-500/40"
            >
              Hedef fiyatlar
            </Link>
          </li>
          {kind === 'bist' ? (
            <li>
              <Link
                href={`/bist/${symbol}/hedef-fiyat`}
                className="rounded-lg border border-zinc-700 px-2.5 py-1 text-amber-300 hover:border-amber-500/40"
              >
                {symbol} hedef fiyat
              </Link>
            </li>
          ) : null}
          {peerLinks.slice(0, 2).map((p) => {
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
        </ul>
      </section>
    </article>
  );
}
