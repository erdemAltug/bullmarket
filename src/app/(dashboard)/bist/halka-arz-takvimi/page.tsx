import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { SEO_BIST_TICKERS } from '@/lib/seo/symbols';

export const revalidate = 86_400;

const path = '/bist/halka-arz-takvimi';

export const metadata: Metadata = {
  title: { absolute: 'BİST Halka Arz Takvimi & Yeni Şirketler | Bullsye' },
  description:
    'Son dönemde ilgi gören halka arz / genç BİST şirketleri için analiz hub’ı. Canlı karne ve bilanço sayfalarına tek tık.',
  alternates: withLangAlternates(path),
  openGraph: { url: absoluteCanonical(path), title: 'Halka Arz Takvimi' },
};

/** Recent / high-search IPO & growth names (static seed; KAP calendar later) */
const SEEDS = [
  'ASTOR', 'SMRTG', 'REEDR', 'BINHO', 'GRTHO', 'KLSER', 'YEOTK', 'GENIL', 'PASEU',
  'OBAMS', 'KMPUR', 'QUAGR', 'MIATK', 'EUPWR', 'CWENE', 'BIOEN', 'CANTE', 'SDTTR',
  'PAPIL', 'KONTR', 'ALFAS', 'KFEIN', 'VRGYO',
];

export default function HalkaArzHubPage() {
  const list = SEEDS.filter((s) => SEO_BIST_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Halka arz takvimi & yeni şirketler</h1>
      <p className="text-sm text-[var(--muted)]">
        Resmi KAP halka arz takvimi değildir; yüksek arama niyetli genç
        şirketler için analiz giriş kapısıdır.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((s) => (
          <li key={s}>
            <Link
              href={`/bist/${s}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
            >
              {s} analiz karnesi
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
