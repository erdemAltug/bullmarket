import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { SEO_BIST_TICKERS } from '@/lib/seo/symbols';

export const revalidate = 86_400;

const path = '/bist/yuksek-temettu-verenler-2026';
const year = 2026;

export const metadata: Metadata = {
  title: { absolute: `Yüksek Temettü Veren BİST Hisseleri ${year} | Bullsye` },
  description: `${year} temettü verimi arayanlar için BİST rehberi: verim nasıl okunur, yüksek verim tuzağı ve sembol temettü sayfalarına linkler.`,
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: `Yüksek Temettü Verenler ${year} | Bullsye`,
    description: 'Trailing verim ve DRIP simülasyonu sembol sayfalarında.',
  },
};

const SEEDS = [
  'ISCTR', 'AKBNK', 'GARAN', 'YKBNK', 'TCELL', 'TTKOM', 'EREGL', 'KRDMD', 'TUPRS',
  'SISE', 'KCHOL', 'SAHOL', 'BIMAS', 'AEFES', 'CCOLA', 'DOAS', 'FROTO', 'TOASO',
  'ENJSA', 'AKSEN', 'ISGYO', 'EKGYO', 'PETKM', 'ULKER',
];

export default function YuksekTemettuHubPage() {
  const list = SEEDS.filter((s) => SEO_BIST_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Yüksek temettü veren BİST hisseleri {year}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Temettü verimi ≈ yıllık dağıtım / fiyat. Yüksek verim cazip görünebilir;
          fiyat düşüşü veya tek seferlik özel temettü oranı şişirebilir. Bu hub,
          sık aranan likit isimlerden{' '}
          <strong className="font-medium text-[var(--foreground)]">
            temettü &amp; DRIP
          </strong>{' '}
          sayfalarına geçiş kapısıdır — canlı sıralama tablosu değildir.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Verimi yorumlama
        </h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Sektör ortalamasına göre uç değerleri ayrı tutun.</li>
          <li>Trailing verim geçmiş dağıtıma dayanır; gelecek vaat etmez.</li>
          <li>
            Bilanço ile birlikte bakın:{' '}
            <Link href="/egitim/borsa-temelleri/temettu-verimi-nasil-yorumlanir" className="text-[var(--accent)]">
              temettü verimi dersi
            </Link>
            .
          </li>
          <li>
            Takvim özeti:{' '}
            <Link href="/dividends" className="text-[var(--accent)]">
              /dividends
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">İzleme listesi ({year})</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {list.map((s) => (
            <li key={s}>
              <Link
                href={`/bist/${s}/temettu`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
              >
                {s} temettü {year}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--muted)]">
        Yatırım tavsiyesi değildir. KAP / şirket duyuruları esas kaynaktır.
      </p>
    </div>
  );
}
