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
    'Yüksek arama niyetli genç / halka arz BİST şirketleri için analiz hub’ı: karne, bilanço ve skor taramasına köprü. Resmi KAP takvimi değildir.',
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: 'Halka Arz & Yeni Şirketler | Bullsye',
    description: 'Genç BİST isimleri için analiz giriş kapısı.',
  },
};

const SEEDS = [
  'ASTOR', 'SMRTG', 'REEDR', 'BINHO', 'GRTHO', 'KLSER', 'YEOTK', 'GENIL', 'PASEU',
  'OBAMS', 'KMPUR', 'QUAGR', 'MIATK', 'EUPWR', 'CWENE', 'BIOEN', 'CANTE', 'SDTTR',
  'PAPIL', 'KONTR', 'ALFAS', 'KFEIN', 'VRGYO',
];

export default function HalkaArzHubPage() {
  const list = SEEDS.filter((s) => SEO_BIST_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Halka arz takvimi & yeni şirketler
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Bu sayfa resmi KAP halka arz takvimi değildir. Arama niyeti yüksek,
          görece genç veya büyüme hikâyeli BİST sembollerine{' '}
          <strong className="font-medium text-[var(--foreground)]">
            analiz karnesi
          </strong>{' '}
          girişi sunar. Fiyat, skor ve temel rasyolar sembol sayfalarında canlıdır.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Yeni şirkette neye bakılır?
        </h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Likidite ve günlük hacim — ince defterlerde kayma riski yüksektir.</li>
          <li>
            Bilanço derinliği:{' '}
            <Link
              href="/blog/bilanco-nasil-okunur-bist"
              className="text-[var(--accent)]"
            >
              bilanço okuma rehberi
            </Link>
            .
          </li>
          <li>
            Kısa vadeli filtre:{' '}
            <Link href="/firsatlar" className="text-[var(--accent)]">
              skor taraması
            </Link>
            .
          </li>
          <li>Resmi duyurular için KAP / şirket KAP bildirimleri esas alınır.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">İzleme listesi</h2>
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
      </section>

      <p className="text-xs text-[var(--muted)]">
        Yatırım tavsiyesi değildir. Halka arz tahsis / talep süreçleri aracı
        kurum kanallarındadır.
      </p>
    </div>
  );
}
