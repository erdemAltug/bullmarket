import 'server-only';
import {
  buildDailyVision,
  buildPotentialCards,
  type DailyVisionReport,
  type PotentialCard,
} from '@/lib/ai-opportunity';
import { getLiveMarketItems } from '@/lib/market-live';

export type DailyDigest = {
  asOf: string;
  vision: DailyVisionReport | null;
  /** Top BIST cards first; other markets fill only when BIST is thin. */
  cards: PotentialCard[];
};

/**
 * Server-side "günün kartları" — shared by the morning digest e-mail and the
 * daily share image so both always show the same symbols.
 */
export async function buildDailyDigest(limit = 5): Promise<DailyDigest> {
  const { items, updatedAt } = await getLiveMarketItems();
  const ranked = buildPotentialCards(items, 30);
  const bist = ranked.filter((c) => c.category === 'BIST');
  const rest = ranked.filter((c) => c.category !== 'BIST');
  const cards = [...bist, ...rest].slice(0, limit);

  return {
    asOf: updatedAt,
    vision: items.length ? buildDailyVision(items) : null,
    cards,
  };
}

export function formatDigestDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone: 'Europe/Istanbul',
  });
}
