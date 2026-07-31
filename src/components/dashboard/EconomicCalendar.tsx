'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useCalendar } from '@/hooks/useIntelligence';
import {
  formatCountdown,
  upcomingEvents,
} from '@/lib/economic-calendar';
import { ListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const REGION: Record<string, string> = {
  TR: 'TR',
  US: 'US',
  EU: 'EU',
  GLOBAL: 'GL',
};

export function EconomicCalendar() {
  const { data, isLoading } = useCalendar();
  const events = data?.events ?? [];
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="size-4 text-zinc-400" />
        <h2 className="text-sm font-medium text-zinc-300">Ekonomik Takvim</h2>
      </div>

      {isLoading && !events.length ? (
        <ListSkeleton rows={4} />
      ) : !events.length ? (
        <EmptyState
          icon={CalendarClock}
          title="Canlı takvim yok"
          description="Ekonomik olay feed’i henüz bağlanmadı — uydurma tarihler göstermiyoruz."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2">
          {events.slice(0, 6).map((e) => {
            const soon = upcomingEvents([e], 48).length > 0;
            const when = new Date(e.at);
            return (
              <li
                key={e.id}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-lg border px-3 py-2',
                  soon
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900/40'
                )}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">{e.title}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    <span className="mr-2 rounded bg-zinc-800 px-1 py-0.5">
                      {REGION[e.region]}
                    </span>
                    {when.toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase',
                      e.impact === 'high' ? 'text-red-400' : 'text-zinc-500'
                    )}
                  >
                    {e.impact}
                  </span>
                  {soon ? (
                    <p className="mt-1 text-xs font-medium tabular-nums text-amber-300">
                      {formatCountdown(e.at)}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Compact banner for ticker row when an event is within 48h. */
export function CalendarTickerBanner() {
  const { data } = useCalendar();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const soon = upcomingEvents(data?.events ?? [], 48, now);
  if (!soon.length) return null;

  const next = soon[0];

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-200">
      <span className="font-semibold">⚠ Ekonomik uyarı</span>
      <span className="mx-2 text-amber-500/60">·</span>
      {next.title}
      <span className="mx-2 text-amber-500/60">·</span>
      <span className="tabular-nums font-medium">
        {formatCountdown(next.at, now)}
      </span>
    </div>
  );
}
