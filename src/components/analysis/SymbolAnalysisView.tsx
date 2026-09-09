'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DividendSimModule } from '@/components/analysis/DividendSimModule';
import { HealthRadarModule } from '@/components/analysis/HealthRadarModule';
import { PeerCompareModule } from '@/components/analysis/PeerCompareModule';
import { RealReturnModule } from '@/components/analysis/RealReturnModule';
import { TargetGaugeModule } from '@/components/analysis/TargetGaugeModule';
import { TechLevelsModule } from '@/components/analysis/TechLevelsModule';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';
import { cn } from '@/lib/utils';

type TabId = 'reel' | 'radar' | 'peers' | 'temettu' | 'hedef' | 'teknik';

const TABS: { id: TabId; label: string }[] = [
  { id: 'reel', label: 'Reel getiri' },
  { id: 'radar', label: 'Sağlık' },
  { id: 'peers', label: 'Akranlar' },
  { id: 'temettu', label: 'Temettü' },
  { id: 'hedef', label: 'Hedef' },
  { id: 'teknik', label: 'Teknik' },
];

type Props = {
  symbol: string;
  yahooSymbol: string;
};

async function fetchAnalysis(yahooSymbol: string): Promise<SymbolAnalysisBundle> {
  const res = await fetch(
    `/api/analysis?symbol=${encodeURIComponent(yahooSymbol)}`
  );
  const json = (await res.json()) as {
    success: boolean;
    data?: SymbolAnalysisBundle;
    error?: string;
  };
  if (!json.success || !json.data) {
    throw new Error(json.error ?? 'Analiz yüklenemedi');
  }
  return json.data;
}

function Skeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
        />
      ))}
    </div>
  );
}

export function SymbolAnalysisView({ yahooSymbol }: Props) {
  const [tab, setTab] = useState<TabId>('reel');
  const q = useQuery({
    queryKey: ['analysis', yahooSymbol],
    queryFn: () => fetchAnalysis(yahooSymbol),
    staleTime: 3_600_000,
    refetchInterval: false,
  });

  if (q.isLoading) return <Skeleton />;
  if (q.isError || !q.data) {
    return (
      <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted)]">
        Gelişmiş analitik şu an yüklenemedi. Daha sonra yeniden deneyin.
      </p>
    );
  }

  const data = q.data;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Ücretsiz gelişmiş analitik
          </h2>
          <p className="text-xs text-[var(--muted)]">{data.sourceNote}</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 lg:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium',
              tab === t.id
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <RealReturnModule data={data} />
        <HealthRadarModule data={data} />
        <PeerCompareModule data={data} />
        <DividendSimModule data={data} />
        <TargetGaugeModule data={data} />
        <TechLevelsModule data={data} />
      </div>

      <div className="lg:hidden">
        {tab === 'reel' ? <RealReturnModule data={data} /> : null}
        {tab === 'radar' ? <HealthRadarModule data={data} /> : null}
        {tab === 'peers' ? <PeerCompareModule data={data} /> : null}
        {tab === 'temettu' ? <DividendSimModule data={data} /> : null}
        {tab === 'hedef' ? <TargetGaugeModule data={data} /> : null}
        {tab === 'teknik' ? <TechLevelsModule data={data} /> : null}
      </div>
    </section>
  );
}
