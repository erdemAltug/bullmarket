'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DividendSimModule } from '@/components/analysis/DividendSimModule';
import { PeerCompareModule } from '@/components/analysis/PeerCompareModule';
import { RealReturnModule } from '@/components/analysis/RealReturnModule';
import { TechLevelsModule } from '@/components/analysis/TechLevelsModule';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';
import { cn } from '@/lib/utils';

type TabId = 'teknik' | 'reel' | 'peers' | 'temettu';

/**
 * One module at a time. Health radar and target gauge are left out on
 * purpose: the health scorecard and analyst card above already show them.
 */
const TABS: { id: TabId; label: string }[] = [
  { id: 'teknik', label: 'Teknik seviyeler' },
  { id: 'reel', label: 'Reel getiri' },
  { id: 'peers', label: 'Akranlar' },
  { id: 'temettu', label: 'Temettü' },
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
    <div className="h-80 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
  );
}

export function SymbolAnalysisView({ yahooSymbol }: Props) {
  const [tab, setTab] = useState<TabId>('teknik');
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
  const hasDividend =
    (data.dividend.trailingYieldPct ?? 0) > 0 ||
    data.dividend.years.some((y) => y.yieldPct > 0);
  const tabs = TABS.filter((t) => t.id !== 'temettu' || hasDividend);
  const active = tabs.some((t) => t.id === tab) ? tab : 'teknik';

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Detaylı analiz
        </h2>
        <div
          role="tablist"
          className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-[var(--border)] p-0.5 [scrollbar-width:none]"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium',
                active === t.id
                  ? 'bg-[var(--card)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {active === 'teknik' ? <TechLevelsModule data={data} /> : null}
      {active === 'reel' ? <RealReturnModule data={data} /> : null}
      {active === 'peers' ? <PeerCompareModule data={data} /> : null}
      {active === 'temettu' ? <DividendSimModule data={data} /> : null}
    </section>
  );
}
