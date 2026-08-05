'use client';

import { HabitCue } from '@/components/dashboard/HabitCue';
import { OpportunityHunt } from '@/components/dashboard/OpportunityHunt';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { buildPotentialCards } from '@/lib/ai-opportunity';
import { useMemo } from 'react';

export default function FirsatlarPage() {
  const scanner = useMarketScanner();
  const topCards = useMemo(
    () => buildPotentialCards(scanner.data ?? [], 6),
    [scanner.data]
  );

  return (
    <>
      <HabitCue topCards={topCards} />
      <OpportunityHunt />
    </>
  );
}
