'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Market = { id: string; label: string; tz: string; open: number; close: number };

/** Regular sessions in local exchange time (minutes after midnight), Mon–Fri. */
const MARKETS: Market[] = [
  { id: 'bist', label: 'BİST', tz: 'Europe/Istanbul', open: 10 * 60, close: 18 * 60 },
  { id: 'us', label: 'ABD', tz: 'America/New_York', open: 9 * 60 + 30, close: 16 * 60 },
];

function localParts(tz: string, now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    weekday: get('weekday'),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

function status(m: Market, now: Date) {
  const { weekday, minutes } = localParts(m.tz, now);
  const weekend = weekday === 'Sat' || weekday === 'Sun';
  const open = !weekend && minutes >= m.open && minutes < m.close;
  let mins = 0;
  if (open) mins = m.close - minutes;
  else if (!weekend && minutes < m.open) mins = m.open - minutes;
  return { open, mins, sameDay: !weekend && minutes < m.open };
}

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

/** Holidays are not modelled; the pill is a guide, not an exchange calendar. */
export function MarketStatus({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {MARKETS.map((m) => {
        const s = status(m, now);
        const hint = s.open
          ? `kapanışa ${fmt(s.mins)}`
          : s.sameDay
            ? `açılışa ${fmt(s.mins)}`
            : 'kapalı';
        return (
          <span
            key={m.id}
            title={`${m.label} ${s.open ? 'açık' : 'kapalı'} · ${hint}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)]"
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                s.open ? 'animate-pulse bg-[var(--up)]' : 'bg-[var(--muted)]/50'
              )}
            />
            <span className="text-[var(--foreground)]">{m.label}</span>
            <span className="hidden xl:inline">{hint}</span>
          </span>
        );
      })}
    </div>
  );
}
