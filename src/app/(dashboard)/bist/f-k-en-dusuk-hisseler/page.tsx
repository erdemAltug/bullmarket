import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { SEO_BIST_TICKERS } from '@/lib/seo/symbols';

export const revalidate = 86_400;

const path = '/bist/f-k-en-dusuk-hisseler';

export const metadata: Metadata = {
  title: { absolute: 'F/K En Düşük BİST Hisseleri | Bullsye' },
  description:
    'Borsa İstanbul’da düşük F/K arayanlar için rehber hub: F/K nasıl okunur, sektör tuzağı ve bilanço sayfalarına canlı linkler.',
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: 'F/K En Düşük Hisseler | Bullsye',
    description:
      'Düşük F/K listesi ve bilanço karnelerine geçiş. Yatırım tavsiyesi değildir.',
  },
};

const SEEDS = [
  'EREGL', 'KRDMD', 'THYAO', 'PGSUS', 'TUPRS', 'PETKM', 'SISE', 'KCHOL', 'SAHOL',
  'BIMAS', 'MGROS', 'TCELL', 'TTKOM', 'FROTO', 'TOASO', 'ASELS', 'GARAN', 'AKBNK',
  'YKBNK', 'ISCTR', 'HALKB', 'VAKBN', 'ENKAI', 'TKFEN', 'KOZAL', 'KOZAA',
];

export default function FkEnDusukHubPage() {
  const list = SEEDS.filter((s) => SEO_BIST_TICKERS.includes(s));
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          F/K en düşük BİST hisseleri
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Fiyat/kazanç (F/K) oranı, hisse fiyatını hisse başı kâra böler. Düşük
          F/K tek başına “ucuz” demek değildir: büyüme, borç ve sektör medyanı
          olmadan yorum eksik kalır. Bu sayfa likit BİST isimlerinden{' '}
          <strong className="font-medium text-[var(--foreground)]">
            bilanço &amp; F/K
          </strong>{' '}
          karnelerine köprüdür.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Düşük F/K nasıl okunur?
        </h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Önce aynı sektör peer’larıyla kıyaslayın (banka↔banka).</li>
          <li>Tek seferlik kâr F/K’yı geçici olarak düşürebilir.</li>
          <li>Negatif kârda F/K anlamsızdır; PD/DD veya EV/FAVÖK bakın.</li>
          <li>
            Derin okuma:{' '}
            <Link href="/blog/fk-orani-nedir-bist" className="text-[var(--accent)]">
              F/K oranı rehberi
            </Link>{' '}
            ·{' '}
            <Link
              href="/blog/bilanco-nasil-okunur-bist"
              className="text-[var(--accent)]"
            >
              bilanço nasıl okunur
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Likit tarama listesi</h2>
        <p className="text-xs text-[var(--muted)]">
          Canlı F/K her sembolün bilanço sayfasında güncellenir. Sıralama sabit
          seed’dir; anlık “en düşük” sıralaması değildir.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {list.map((s) => (
            <li key={s}>
              <Link
                href={`/bist/${s}/bilanco`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium hover:border-[var(--accent)]/40"
              >
                {s} bilanço & F/K
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--muted)]">
        Yatırım tavsiyesi değildir. Peer kıyas için{' '}
        <Link href="/karsilastir" className="text-[var(--accent)]">
          /karsilastir
        </Link>
        .
      </p>
    </div>
  );
}
