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

/** Common Forex Factory titles → Turkish. Unknown words pass through. */
const EVENT_TERMS: [RegExp, string][] = [
  [/\bFOMC\b/g, 'Fed (FOMC)'],
  [/\bBOC\b/g, 'Kanada MB'],
  [/\bBOE\b/g, 'İngiltere MB'],
  [/\bBOJ\b/g, 'Japonya MB'],
  [/\bECB\b/g, 'ECB'],
  [/Press Conference/gi, 'basın toplantısı'],
  [/Interest Rate Decision|Federal Funds Rate|Cash Rate|Official Bank Rate|Main Refinancing Rate|Overnight Rate/gi, 'faiz kararı'],
  [/Statement/gi, 'açıklaması'],
  [/Core CPI/gi, 'Çekirdek TÜFE'],
  [/\bCPI\b/g, 'TÜFE'],
  [/\bPPI\b/g, 'ÜFE'],
  [/Non-Farm Employment Change|Non-Farm Payrolls/gi, 'Tarım dışı istihdam'],
  [/Unemployment Rate/gi, 'İşsizlik oranı'],
  [/Unemployment Claims/gi, 'İşsizlik başvuruları'],
  [/Retail Sales/gi, 'Perakende satışlar'],
  [/\bGDP\b/g, 'GSYİH'],
  [/Speaks/gi, 'konuşuyor'],
  [/\bm\/m\b/g, '(aylık)'],
  [/\by\/y\b/g, '(yıllık)'],
  [/\bq\/q\b/g, '(çeyreklik)'],
];

export function localizeEventTitle(title: string): string {
  return EVENT_TERMS.reduce((t, [re, tr]) => t.replace(re, tr), title);
}
