'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Plus, Search, Star, Trash2 } from 'lucide-react';
import { AlertModal } from '@/components/alerts/AlertModal';
import { ProWaitlistCard } from '@/components/growth/ProWaitlistCard';
import { OPEN_COMMAND_EVENT } from '@/components/search/UniversalSearch';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/hooks/useAlerts';
import { useWatchlistRows, type WatchRow } from '@/hooks/useWatchlistRows';
import { trackEvent } from '@/lib/analytics';
import { cn, formatPercent } from '@/lib/utils';

/** One-tap starters for an empty list (keys match the scanner). */
const STARTERS = [
  { key: 'THYAO.IS', label: 'THYAO' },
  { key: 'ASELS.IS', label: 'ASELS' },
  { key: 'GARAN.IS', label: 'GARAN' },
  { key: 'BIMAS.IS', label: 'BIMAS' },
  { key: 'BTCUSDT', label: 'BTC' },
  { key: 'NVDA', label: 'NVDA' },
];

type SortKey = 'added' | 'gainers' | 'losers';

export default function WatchlistPage() {
  const router = useRouter();
  const { formatPrice } = usePreferences();
  const { rows, ready, loading, addSymbol, removeSymbol, hasSymbol } =
    useWatchlistRows();
  const { alerts } = useAlerts();
  const [sort, setSort] = useState<SortKey>('added');
  const [alertRow, setAlertRow] = useState<WatchRow | null>(null);

  const alertCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of alerts) {
      const k = a.displaySymbol.toUpperCase();
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [alerts]);

  const sorted = useMemo(() => {
    if (sort === 'added') return rows;
    const dir = sort === 'gainers' ? -1 : 1;
    return [...rows].sort(
      (a, b) => dir * ((a.changePercent ?? 0) - (b.changePercent ?? 0))
    );
  }, [rows, sort]);

  function addStarter(key: string) {
    addSymbol(key);
    trackEvent('watchlist_add', { symbol: key, source: 'watchlist_starter' });
  }

  const openSearch = () => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
  const starters = STARTERS.filter((s) => !hasSymbol(s.key));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Star className="size-6 fill-amber-300 text-amber-300" />
            İzleme listem
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Takip ettiklerin tek listede — canlı fiyat, günlük değişim, alarm.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="gap-1.5" onClick={openSearch}>
            <Search className="size-4" /> Sembol ara
          </Button>
          <Link
            href="/alerts"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--card)]"
          >
            <Bell className="size-4 text-orange-400" />
            Alarmlar{alerts.length ? ` · ${alerts.length}` : ''}
          </Link>
        </div>
      </header>

      {ready && rows.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-center sm:p-10">
          <Star className="mx-auto size-8 text-amber-300" />
          <h2 className="mt-3 text-lg font-semibold">Listen henüz boş</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-[var(--muted)]">
            Tek dokunuşla başla ya da herhangi bir hisse sayfasında
            <span className="mx-1 inline-flex items-center gap-1 rounded border border-[var(--border)] px-1.5 text-xs">
              <Star className="size-3" /> İzle
            </span>
            butonuna bas.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {STARTERS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => addStarter(s.key)}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:border-amber-500/40 hover:text-amber-300"
              >
                <Plus className="size-3.5" /> {s.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5 text-xs">
              {(
                [
                  ['added', 'Eklenme'],
                  ['gainers', 'En çok yükselen'],
                  ['losers', 'En çok düşen'],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSort(k)}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 font-medium',
                    sort === k
                      ? 'bg-[var(--card)] text-[var(--foreground)]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs text-[var(--muted)]">{rows.length} sembol</span>
          </div>

          <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            {sorted.map((r) => {
              const up = (r.changePercent ?? 0) >= 0;
              const nAlerts = alertCount.get(r.displaySymbol.toUpperCase()) ?? 0;
              return (
                <li key={r.symbol} className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => router.push(r.href)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="font-semibold">{r.displaySymbol}</p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {r.name || '—'}
                    </p>
                  </button>
                  <div className="text-right tabular-nums">
                    <p className="text-sm font-medium">
                      {r.price != null
                        ? formatPrice(r.price, r.currency)
                        : loading
                          ? '…'
                          : '—'}
                    </p>
                    {r.changePercent != null ? (
                      <p
                        className={cn(
                          'text-xs font-medium',
                          up ? 'text-[var(--up)]' : 'text-[var(--down)]'
                        )}
                      >
                        {formatPercent(r.changePercent)}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertRow(r)}
                    aria-label={`${r.displaySymbol} için alarm kur`}
                    title="Alarm kur"
                    className={cn(
                      'relative rounded-lg p-2 hover:bg-[var(--surface)]',
                      nAlerts ? 'text-orange-400' : 'text-[var(--muted)]'
                    )}
                  >
                    <Bell className="size-4" />
                    {nAlerts ? (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-black">
                        {nAlerts}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSymbol(r.symbol)}
                    aria-label={`${r.displaySymbol} listeden çıkar`}
                    title="Listeden çıkar"
                    className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-rose-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          {starters.length ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span>Hızlı ekle:</span>
              {starters.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => addStarter(s.key)}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 font-medium hover:border-amber-500/40 hover:text-amber-300"
                >
                  <Plus className="size-3" /> {s.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {rows.length >= 3 ? <ProWaitlistCard source="watchlist" /> : null}

      {alertRow ? (
        <AlertModal
          open
          onOpenChange={(o) => !o && setAlertRow(null)}
          symbol={alertRow.symbol}
          displaySymbol={alertRow.displaySymbol}
          currentPrice={alertRow.price ?? 0}
          changePercent={alertRow.changePercent ?? 0}
        />
      ) : null}
    </div>
  );
}
