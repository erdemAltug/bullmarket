'use client';

import { HabitCue } from '@/components/dashboard/HabitCue';
import { OpportunityHunt } from '@/components/dashboard/OpportunityHunt';
import { ShareDailyRadar } from '@/components/dashboard/ShareDailyRadar';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { buildPotentialCards } from '@/lib/ai-opportunity';
import { useMemo } from 'react';

export function FirsatlarClient() {
  const scanner = useMarketScanner();
  const topCards = useMemo(
    () => buildPotentialCards(scanner.data ?? [], 5),
    [scanner.data]
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ShareDailyRadar cards={topCards} />
      </div>
      <HabitCue topCards={topCards} />
      <OpportunityHunt />
    </>
  );
}
