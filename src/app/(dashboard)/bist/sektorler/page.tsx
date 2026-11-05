import type { Metadata } from 'next';
import Link from 'next/link';
import { SectorLeaders } from '@/components/seo/SectorLeaders';
import { absoluteCanonical } from '@/lib/seo/canonical';
import { withLangAlternates } from '@/lib/seo/hreflang';
import { hubOgImages } from '@/lib/seo/og';
import { YEAR } from '@/lib/seo/rankings';
import { BIST_SECTORS, US_SECTORS } from '@/lib/seo/sectors';

export const revalidate = 900;

const path = '/bist/sektorler';
const TITLE = `Sektörlere Göre BİST Hisseleri ${YEAR}: Banka, Enerji, Savunma ve Daha Fazlası`;
const DESCRIPTION =
  'Borsa İstanbul hisseleri sektörlere göre: banka, holding, enerji, demir-çelik, savunma, teknoloji, GYO ve daha fazlası. Her sektörün lideri ve canlı skor sıralaması.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLangAlternates(path),
  openGraph: {
    url: absoluteCanonical(path),
    title: TITLE,
    description: DESCRIPTION,
    images: hubOgImages('Sektörlere göre BİST', 'Her sektörün lideri, canlı skor sıralaması'),
  },
};

export default function SektorlerPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Sektörlere göre BİST hisseleri</h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Borsa İstanbul’daki hisseleri sektörlerine göre grupladık. Her sektörün şu anki lideri
          aşağıda; sektöre tıklayarak o sektördeki tüm hisselerin canlı skor sıralamasını
          görebilirsin. Aynı sektördeki şirketleri birbiriyle karşılaştırmak, değerlemeyi doğru
          okumanın en kolay yoludur.
        </p>
      </header>

      <SectorLeaders category="BIST" sectors={BIST_SECTORS} basePath="/bist/sektor" title="BİST sektör liderleri" />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tüm BİST sektörleri</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {BIST_SECTORS.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/bist/sektor/${s.slug}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 hover:border-[var(--accent)]"
              >
                <span className="text-sm font-semibold">En yüksek skorlu {s.noun}</span>
                <span className="mt-0.5 block line-clamp-2 text-xs text-[var(--muted)]">{s.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">ABD borsası sektörleri</h2>
        <ul className="flex flex-wrap gap-2">
          {US_SECTORS.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/nasdaq/sektor/${s.slug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {s.noun}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--muted)]">
        Sektör listeleri bilgi amaçlıdır, yatırım tavsiyesi değildir.{' '}
        <Link href="/metodoloji" className="text-[var(--accent)] hover:underline">
          Skor nasıl hesaplanır?
        </Link>
      </p>
    </div>
  );
}
