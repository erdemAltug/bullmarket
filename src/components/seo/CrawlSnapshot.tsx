import Link from 'next/link';
import type { SeoSnapshot } from '@/lib/seo/live-snapshot';

function fmt(n: number) {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

export function CrawlSnapshot({
  snap,
  variant = 'full',
}: {
  snap: SeoSnapshot;
  variant?: 'full' | 'compact';
}) {
  const chg = snap.xu100Change;
  const chgLabel =
    chg == null
      ? null
      : `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <p className="text-sm text-[var(--foreground)]">
        <span className="font-semibold">BİST 100 canlı: </span>
        {snap.xu100Price != null ? (
          <>
            {fmt(snap.xu100Price)}{' '}
            {chgLabel ? (
              <span
                className={
                  (chg ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }
              >
                {chgLabel}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-[var(--muted)]">seans verisi bekleniyor</span>
        )}
      </p>
      {variant === 'full' && snap.top.length ? (
        <>
          <h2 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Bugünün fırsat skoru (top 5)
          </h2>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
            {snap.top.map((row) => (
              <li key={row.symbol}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className="text-emerald-400 hover:underline"
                  >
                    {row.symbol}
                  </Link>
                ) : (
                  row.symbol
                )}{' '}
                <span className="tabular-nums text-[var(--muted)]">
                  skor {row.score}/100 · {row.changePercent >= 0 ? '+' : ''}
                  {row.changePercent.toFixed(1)}%
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            Metodoloji:{' '}
            <Link
              href="/egitim/teknik-analiz/ai-firsat-skoru-nasil-okunur"
              className="text-emerald-400 hover:underline"
            >
              fırsat skoru nasıl okunur
            </Link>
            {' · '}
            <Link href="/targets" className="text-emerald-400 hover:underline">
              analist hedef fiyatları
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          Kaynak tarama:{' '}
          <Link href="/bist" className="text-emerald-400 hover:underline">
            BİST
          </Link>
          {' · '}
          <Link href="/firsatlar" className="text-emerald-400 hover:underline">
            fırsat masası
          </Link>
          {' · '}
          <Link href="/targets" className="text-emerald-400 hover:underline">
            hedef fiyat
          </Link>
        </p>
      )}
    </section>
  );
}
