import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';

export const revalidate = 3600;

const path = '/kripto/balina-hareketleri-ve-trendler';

export const metadata: Metadata = {
  title: { absolute: 'Kripto Balina Hareketleri ve Trendler | Bullsye' },
  description:
    'Balina transferleri, BTC/ETH ve altcoin trend hub’ı. Canlı whale paneli ve kripto detay sayfalarına bağlantı.',
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: 'Balina Hareketleri ve Trendler',
  },
};

export default function BalinaTrendHubPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">
        Balina hareketleri ve trendler
      </h1>
      <p className="text-sm text-[var(--muted)]">
        Organik arama hub’ı — canlı whale paneli ve majör coin karneleri.
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/whales"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-medium hover:border-[var(--accent)]/40"
        >
          Canlı balina paneli
        </Link>
        <Link
          href="/kripto"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-medium hover:border-[var(--accent)]/40"
        >
          Kripto hub
        </Link>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'].map(
          (s) => (
            <li key={s}>
              <Link
                href={`/kripto/${s}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
              >
                {s.replace('USDT', '')} analiz
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
