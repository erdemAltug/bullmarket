import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { getLiveMarketItems } from '@/lib/market-live';
import {
  ETF_META,
  SCANNER_ETF_SYMBOLS,
  SCANNER_TEFAS_CODES,
  SCANNER_TEFAS_FUNDS,
  formatVolumeDisplay,
} from '@/lib/scanner-universe';
import { SITE_URL, SEO_ETF_TICKERS, SEO_TEFAS_CODES } from '@/lib/seo/symbols';
import { withLangAlternates } from '@/lib/seo/hreflang';
import Link from 'next/link';
import { fetchTefasFund } from '@/lib/api/tefas';
import { yahooSymbolExists } from '@/lib/market/long-tail';
import { NOINDEX_FOLLOW } from '@/lib/seo/index-policy';

const FUND_CODE_RE = /^[A-Z0-9]{2,6}$/;



export const revalidate = 120;

type Props = { params: Promise<{ code: string }> };

const DETAIL_CODE_SET = new Set<string>([
  ...SEO_TEFAS_CODES,
  ...SEO_ETF_TICKERS,
  ...SCANNER_TEFAS_CODES,
  ...SCANNER_ETF_SYMBOLS,
]);

export function generateStaticParams() {
  return [...DETAIL_CODE_SET].map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const sym = code.toUpperCase();
  const tefas = SCANNER_TEFAS_FUNDS.find((f) => f.code === sym);
  const etf = ETF_META[sym as keyof typeof ETF_META];
  const title = tefas
    ? `${sym} TEFAS Fon — ${tefas.style}`
    : etf
      ? `${sym} ETF — ${etf.style}`
      : `${sym} Fon / ETF`;
  return {
    title,
    description: `${sym} canlı fiyat ve getiri takibi — Bullsye fon masası.`,
    alternates: withLangAlternates(`/fon/${sym}`),
    ...(DETAIL_CODE_SET.has(sym) ? {} : { robots: NOINDEX_FOLLOW }),
    openGraph: {
      title: `${sym} | Bullsye`,
      url: `${SITE_URL}/fon/${sym}`,
    },
  };
}

export default async function FonDetailPage({ params }: Props) {
  const { code } = await params;
  const sym = code.toUpperCase();
  if (!FUND_CODE_RE.test(sym)) notFound();
  const curated = DETAIL_CODE_SET.has(sym);

  const { items } = await getLiveMarketItems();
  const scannerItem =
    items.find(
      (i) =>
        (i.category === 'FON' || i.category === 'ETF') &&
        i.displaySymbol === sym
    ) ?? null;

  // Long tail only (never at build time for curated codes): any TEFAS fund
  // code, or any ETF Yahoo knows. One small, time-boxed request each.
  const tefasRow = !scannerItem && !curated ? await fetchTefasFund(sym) : null;
  const yahooEtf =
    !scannerItem && !tefasRow && !curated ? await yahooSymbolExists(sym) : false;
  if (!curated && !scannerItem && !tefasRow && !yahooEtf) notFound();

  const item = scannerItem
    ? scannerItem
    : tefasRow
      ? {
          name: tefasRow.name,
          price: tefasRow.price,
          changePercent: tefasRow.changePercent,
          currency: 'TRY' as const,
          category: 'FON' as const,
          volume: null as string | null,
          portfolioSize: tefasRow.portfolioSize,
          investorCount: tefasRow.investorCount,
          fundStyle: null as string | null,
        }
      : null;

  const tefasMeta = SCANNER_TEFAS_FUNDS.find((f) => f.code === sym);
  const etfMeta = ETF_META[sym as keyof typeof ETF_META];
  const isEtf = Boolean(etfMeta) || item?.category === 'ETF' || yahooEtf;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {isEtf ? 'Küresel ETF' : 'TEFAS Yatırım Fonu'}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{sym}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {item?.name ??
            (tefasMeta
              ? `${tefasMeta.founder} · ${tefasMeta.style}`
              : etfMeta?.style)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] uppercase text-[var(--muted)]">Pay değeri</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {item
              ? `${item.currency === 'USD' ? '$' : '₺'}${item.price.toLocaleString(
                  'tr-TR',
                  { maximumFractionDigits: item.price >= 100 ? 2 : 4 }
                )}`
              : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] uppercase text-[var(--muted)]">
            Günlük getiri
          </p>
          <p
            className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
              (item?.changePercent ?? 0) >= 0
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {item
              ? `${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`
              : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] uppercase text-[var(--muted)]">
            {isEtf ? 'Hacim' : 'Portföy'}
          </p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {item?.volume ??
              formatVolumeDisplay(item?.portfolioSize ?? undefined, 'TRY')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-relaxed text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)]">
          {item?.fundStyle ?? tefasMeta?.style ?? etfMeta?.style ?? 'Fon'}
        </p>
        {!isEtf && item?.investorCount != null ? (
          <p className="mt-2">
            TEFAS yatırımcı sayısı:{' '}
            <strong className="text-[var(--foreground)]">
              {item.investorCount.toLocaleString('tr-TR')}
            </strong>
          </p>
        ) : null}
        <p className="mt-2 text-xs">
          Bu bir yatırım tavsiyesi değildir. TEFAS pay değerleri seans
          güncellemesiyle gelir; ETF fiyatları canlı borsa kotasyonudur.
        </p>
      </div>

      <ChartPanel
        title={`${sym} · ${isEtf ? 'fiyat' : 'pay değeri'}`}
        symbol={sym}
        source={isEtf ? 'yahoo' : 'tefas'}
        isPositive={(item?.changePercent ?? 0) >= 0}
        currencySymbol={isEtf ? '$' : '₺'}
        defaultTimeframe={isEtf ? '6M' : '1Y'}
      />

      <div className="flex flex-wrap gap-3 text-xs">
        <Link href="/fon" className="text-emerald-400 hover:underline">
          ← Fon masası
        </Link>
        <Link
          href={`/compare?a=${encodeURIComponent(isEtf ? sym : `TEFAS:${sym}`)}`}
          className="text-emerald-400 hover:underline"
        >
          1v1 kıyasla
        </Link>
      </div>
    </div>
  );
}
