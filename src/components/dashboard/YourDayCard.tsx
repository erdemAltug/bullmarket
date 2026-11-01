'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Bell, Newspaper, Star } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useNews } from '@/hooks/useIntelligence';
import { useWatchlistRows } from '@/hooks/useWatchlistRows';
import { cn, formatPercent } from '@/lib/utils';

/**
 * "Senin günün" — the personal part of the morning check in one card:
 * biggest movers in the watchlist, alarms, and headlines on those names.
 */
export function YourDayCard() {
  const { rows, ready } = useWatchlistRows();
  const { alerts } = useAlerts();
  const news = useNews();

  const movers = useMemo(
    () =>
      rows
        .filter((r) => r.changePercent != null)
        .sort((a, b) => Math.abs(b.changePercent!) - Math.abs(a.changePercent!))
        .slice(0, 4),
    [rows]
  );
  const triggered = alerts.filter((a) => a.triggered);

  const myNews = useMemo(() => {
    const names = rows.map((r) => r.displaySymbol.toUpperCase()).filter((s) => s.length >= 3);
    if (!names.length) return [];
    return (news.data?.items ?? [])
      .filter((n) => {
        const t = n.ticker?.toUpperCase();
        if (t && names.includes(t)) return true;
        const title = n.title.toUpperCase();
        return names.some((s) => new RegExp(`\\b${s}\\b`).test(title));
      })
      .slice(0, 3);
  }, [rows, news.data?.items]);

  if (!ready) return null;

  // Nothing tracked yet: one clear next step instead of an empty card.
  if (!rows.length && !alerts.length) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Senin günün</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Takip ettiğin hisseleri ekle; her sabah burada hareketlerini, alarmlarını ve
            haberlerini gör.
          </p>
        </div>
        <Link
          href="/izleme"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#042f2e] hover:brightness-110"
        >
          <Star className="size-4" /> İzleme listesi oluştur
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-label="Senin günün"
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
    >
      <h2 className="text-base font-semibold">Senin günün</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <div>
          <Link
            href="/izleme"
            className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 text-amber-300" /> İzlediklerin
            </span>
            <span>{rows.length} →</span>
          </Link>
          <ul className="mt-2 space-y-1.5">
            {movers.length ? (
              movers.map((r) => (
                <li key={r.symbol}>
                  <Link
                    href={r.href}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--surface)]"
                  >
                    <span className="font-medium">{r.displaySymbol}</span>
                    <span
                      className={cn(
                        'tabular-nums text-xs font-semibold',
                        r.changePercent! >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                      )}
                    >
                      {formatPercent(r.changePercent!)}
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-2 py-1.5 text-xs text-[var(--muted)]">
                {rows.length ? 'Fiyatlar yükleniyor…' : 'Henüz sembol yok'}
              </li>
            )}
          </ul>
        </div>

        <div>
          <Link
            href="/alerts"
            className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Bell className="size-3.5 text-orange-400" /> Alarmların
            </span>
            <span>{alerts.length} →</span>
          </Link>
          {triggered.length ? (
            <ul className="mt-2 space-y-1.5">
              {triggered.slice(0, 3).map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1.5 text-xs text-orange-200"
                >
                  <span className="font-semibold">{a.displaySymbol}</span> eşiği aştı
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 px-2 py-1.5 text-xs text-[var(--muted)]">
              {alerts.length
                ? `${alerts.length} alarm bekliyor · tetiklenen yok`
                : 'Alarm yok — hisse sayfasında "Alarm kur"'}
            </p>
          )}
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            <Newspaper className="size-3.5 text-sky-300" /> Senin hisselerinde haber
          </p>
          {myNews.length ? (
            <ul className="mt-2 space-y-1.5">
              {myNews.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 rounded-lg px-2 py-1.5 text-xs leading-snug hover:bg-[var(--surface)]"
                  >
                    {n.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 px-2 py-1.5 text-xs text-[var(--muted)]">
              Bugün izlediklerinle ilgili başlık yok.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
