import Link from 'next/link';

const LINKS: { href: string; title: string; hint: string }[] = [
  { href: '/bist/en-yuksek-skorlu-hisseler', title: 'En yüksek skorlu BİST hisseleri', hint: 'Günlük sıralama' },
  { href: '/bist/en-cok-yukselen-hisseler', title: 'Bugün en çok yükselenler', hint: 'BİST' },
  { href: '/bist/en-cok-dusen-hisseler', title: 'Bugün en çok düşenler', hint: 'BİST' },
  { href: '/bist/sektorler', title: 'Sektör sektör BİST', hint: '14 sektör' },
  { href: '/nasdaq/en-yuksek-skorlu-hisseler', title: 'ABD’de en yüksek skorlar', hint: 'Nasdaq ve NYSE' },
  { href: '/kripto/en-yuksek-skorlu-coinler', title: 'Skoru en yüksek coinler', hint: 'Kripto' },
  { href: '/bist/2026-one-cikan-hisseler', title: '2026’da öne çıkan hisseler', hint: 'Yıllık görünüm' },
  { href: '/firsatlar', title: 'Tüm skor taraması', hint: 'Filtrele ve sırala' },
  { href: '/whales', title: 'Hacim ve balina takibi', hint: 'Olağandışı hacim' },
  { href: '/dividends', title: 'Temettü takvimi', hint: 'Verim ve tarihler' },
  { href: '/fon', title: 'Fon karşılaştırma', hint: 'Yatırım fonları' },
  { href: '/faiz', title: 'Faiz ve tahvil', hint: 'Getiriler' },
];

/** Shortcuts into the deeper pages, so a terminal visit keeps going. */
export function ExploreGrid() {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-3 text-base font-semibold">Keşfetmeye devam et</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-[var(--border)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--surface)]"
          >
            <p className="text-sm font-medium">{l.title}</p>
            <p className="text-[11px] text-[var(--muted)]">{l.hint}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
