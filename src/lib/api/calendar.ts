import axios from 'axios';
import { appCache } from '@/lib/cache';
import type { EconomicEvent } from '@/types';

interface FfEvent {
  title?: string;
  country?: string;
  date?: string;
  impact?: string;
  forecast?: string;
  previous?: string;
}

const FF_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

const COUNTRY_REGION: Record<string, EconomicEvent['region']> = {
  TRY: 'TR',
  TR: 'TR',
  USD: 'US',
  US: 'US',
  EUR: 'EU',
  EU: 'EU',
  GBP: 'GLOBAL',
  JPY: 'GLOBAL',
  AUD: 'GLOBAL',
  CAD: 'GLOBAL',
  NZD: 'GLOBAL',
  CNY: 'GLOBAL',
  CHF: 'GLOBAL',
};

const HIGH_KEYWORDS =
  /interest rate|faiz|cpi|enflasyon|non-farm|nfp|gdp|gsyih|fomc|tcmb|employment|istihdam|pmi|retail sales/i;

function mapImpact(raw?: string, title?: string): EconomicEvent['impact'] {
  const i = (raw || '').toLowerCase();
  if (i === 'high') return 'high';
  if (i === 'medium' || i === 'low') {
    return title && HIGH_KEYWORDS.test(title) ? 'high' : 'medium';
  }
  if (title && HIGH_KEYWORDS.test(title)) return 'high';
  return 'medium';
}

function mapRegion(country?: string): EconomicEvent['region'] {
  if (!country) return 'GLOBAL';
  const c = country.toUpperCase();
  return COUNTRY_REGION[c] ?? 'GLOBAL';
}

/**
 * Live economic calendar from Forex Factory weekly JSON (free).
 * Prefer TR / US / EU + high-impact events.
 */
export async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
  const cacheKey = 'calendar:ff:v1';
  const hit = appCache.get<EconomicEvent[]>(cacheKey);
  if (hit) return hit;

  const { data } = await axios.get<FfEvent[]>(FF_URL, {
    timeout: 12_000,
    headers: { 'User-Agent': 'Bullsye/1.0 (economic calendar)', Accept: 'application/json' },
  });

  const now = Date.now();
  const events = (Array.isArray(data) ? data : [])
    .filter((e) => e.title && e.date && e.impact !== 'Holiday')
    .map((e, idx) => {
      const at = new Date(e.date as string).toISOString();
      const region = mapRegion(e.country);
      const impact = mapImpact(e.impact, e.title);
      const bits = [e.title];
      if (e.previous) bits.push(`önceki: ${e.previous}`);
      if (e.forecast) bits.push(`beklenen: ${e.forecast}`);
      return {
        id: `ff-${idx}-${Buffer.from(`${e.title}-${e.date}`).toString('base64url').slice(0, 18)}`,
        title: bits[0] as string,
        region,
        impact,
        at,
        detail: bits.slice(1).join(' · ') || undefined,
      } satisfies EconomicEvent & { detail?: string };
    })
    .filter((e) => {
      const t = +new Date(e.at);
      // Keep from 6h ago through next 10 days
      return t >= now - 6 * 3600_000 && t <= now + 10 * 86400_000;
    })
    .filter(
      (e) =>
        e.region === 'TR' ||
        e.region === 'US' ||
        e.region === 'EU' ||
        e.impact === 'high'
    )
    .sort((a, b) => +new Date(a.at) - +new Date(b.at))
    .slice(0, 40);

  appCache.set(cacheKey, events, 900);
  return events;
}

export {
  upcomingEvents,
  formatCountdown,
} from '@/lib/economic-calendar';
