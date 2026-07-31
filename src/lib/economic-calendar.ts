import type { EconomicEvent } from '@/types';

/** Curated high-impact events near "today" — update periodically or replace with live feed. */
export function getEconomicCalendar(now = new Date()): EconomicEvent[] {
  const y = now.getFullYear();
  const m = now.getMonth();

  const atLocal = (monthOffset: number, day: number, hour: number, minute = 0) =>
    new Date(y, m + monthOffset, day, hour, minute, 0).toISOString();

  // Next Thursday-ish for TCMB-style decision window
  const daysUntilThu = (4 - now.getDay() + 7) % 7 || 7;
  const tcmb = new Date(now);
  tcmb.setDate(now.getDate() + daysUntilThu);
  tcmb.setHours(14, 0, 0, 0);

  const cpi = new Date(now);
  cpi.setDate(now.getDate() + 2);
  cpi.setHours(15, 30, 0, 0);

  return [
    {
      id: 'tcmb-rate',
      title: 'TCMB Faiz Kararı',
      region: 'TR' as const,
      impact: 'high' as const,
      at: tcmb.toISOString(),
    },
    {
      id: 'us-cpi',
      title: 'ABD Enflasyon (CPI)',
      region: 'US' as const,
      impact: 'high' as const,
      at: cpi.toISOString(),
    },
    {
      id: 'fed-fomc',
      title: 'Fed Faiz Kararı (FOMC)',
      region: 'US' as const,
      impact: 'high' as const,
      at: atLocal(1, 18, 21),
    },
    {
      id: 'us-nfp',
      title: 'ABD Tarım Dışı İstihdam (NFP)',
      region: 'US' as const,
      impact: 'high' as const,
      at: atLocal(1, 7, 15, 30),
    },
    {
      id: 'tr-inflation',
      title: 'Türkiye TÜFE Açıklaması',
      region: 'TR' as const,
      impact: 'high' as const,
      at: atLocal(1, 3, 10),
    },
    {
      id: 'ecb-rate',
      title: 'ECB Faiz Kararı',
      region: 'EU' as const,
      impact: 'medium' as const,
      at: atLocal(1, 12, 15, 15),
    },
    {
      id: 'us-gdp',
      title: 'ABD GSYİH (Ön)',
      region: 'US' as const,
      impact: 'medium' as const,
      at: atLocal(1, 25, 15, 30),
    },
  ].sort((a, b) => +new Date(a.at) - +new Date(b.at));
}

export function upcomingEvents(
  events: EconomicEvent[],
  withinHours = 48,
  now = new Date()
): EconomicEvent[] {
  const limit = now.getTime() + withinHours * 3600_000;
  return events.filter((e) => {
    const t = +new Date(e.at);
    return t >= now.getTime() - 30 * 60_000 && t <= limit;
  });
}

export function formatCountdown(targetIso: string, now = new Date()): string {
  const diff = +new Date(targetIso) - now.getTime();
  if (diff <= 0) return 'şimdi';
  const h = Math.floor(diff / 3600_000);
  const m = Math.floor((diff % 3600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}g ${h % 24}s`;
  }
  if (h > 0) return `${h}s ${m}dk`;
  return `${m}dk`;
}
