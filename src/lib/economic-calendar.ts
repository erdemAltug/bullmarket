import type { EconomicEvent } from '@/types';

/** @deprecated Prefer fetchEconomicCalendar from lib/api/calendar — kept for helpers only */

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
