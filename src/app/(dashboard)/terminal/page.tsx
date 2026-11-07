'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { ComparisonModal, ComparisonTrigger } from '@/components/dashboard/ComparisonModal';
import { EconomicCalendar } from '@/components/dashboard/EconomicCalendar';
import { ExploreGrid } from '@/components/dashboard/ExploreGrid';
import { MarketMovers } from '@/components/dashboard/MarketMovers';
import { MarketPulseBoard } from '@/components/dashboard/MarketPulseBoard';
import { TerminalChart } from '@/components/terminal/TerminalChart';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { SectorPulse } from '@/components/dashboard/SectorPulse';
import { ShareDailyRadar } from '@/components/dashboard/ShareDailyRadar';
import { NetWorthStrip } from '@/components/inventory/NetWorthStrip';
import { DynamicTitle } from '@/components/shared/DynamicTitle';
import { TerminalHero } from '@/components/terminal/TerminalHero';
import { TopScoresPanel } from '@/components/terminal/TopScoresPanel';
import { WatchlistPanel } from '@/components/terminal/WatchlistPanel';
import { WorldIndices } from '@/components/terminal/WorldIndices';
import { QuickChartProvider } from '@/components/terminal/QuickChart';
import { DailyPicks } from '@/components/terminal/DailyPicks';
import { MarketBriefs } from '@/components/terminal/MarketBriefs';
import { SectorPicks } from '@/components/terminal/SectorPicks';
import { useInventorySummary } from '@/hooks/useInventorySummary';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { buildPotentialCards } from '@/lib/ai-opportunity';

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{children}</h2>
      {hint ? <span className="text-[11px] text-[var(--muted)]/70">{hint}</span> : null}
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

/**
 * Terminal home: what the market is doing (hero), what is moving and where
 * (movers, heatmap, sectors), what you follow (list, scores), then context
 * (three markets, news, calendar) and ways to go deeper.
 */
export default function OverviewPage() {
  const scanner = useMarketScanner();
  const items = useMemo(() => scanner.data ?? [], [scanner.data]);
  const inventory = useInventorySummary();
  const [compareOpen, setCompareOpen] = useState(false);
  const shareCards = useMemo(() => buildPotentialCards(items, 3), [items]);
  const xu100 = items.find((i) => i.displaySymbol === 'XU100');

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Istanbul',
  });

  return (
    <QuickChartProvider>
    <div className="space-y-8">
      <DynamicTitle symbol="XU100" price={xu100?.price} changePercent={xu100?.changePercent} currencySymbol="₺" />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs capitalize text-[var(--muted)]">{today}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Piyasa özeti</h1>
        </div>
        <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <ShareDailyRadar cards={shareCards} />
          <ComparisonTrigger onClick={() => setCompareOpen(true)} />
          <Link
            href="/alerts"
            className="inline-flex items-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-300 hover:bg-orange-500/20"
          >
            <Bell className="size-4" /> Alarm kur
          </Link>
        </div>
      </header>

      {inventory.count > 0 ? (
        <NetWorthStrip
          value={inventory.value}
          pnl={inventory.pnl}
          pnlPct={inventory.pnlPct}
          daily={inventory.daily}
          dailyPct={inventory.dailyPct}
          count={inventory.count}
          href="/portfolio"
        />
      ) : null}

      <div className="space-y-4">
        <TerminalHero items={items} loading={scanner.isLoading} />
        <WorldIndices />
      </div>

      <div className="space-y-4">
        <DailyPicks items={items} loading={scanner.isLoading} />
        <SectorPicks items={items} />
      </div>

      <div className="space-y-4">
        <SectionTitle hint="dakikada bir güncellenir">Ne hareket ediyor</SectionTitle>
        {/* Row by row so the two columns always line up. */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <MarketMovers items={items} loading={scanner.isLoading} />
          </div>
          <div className="min-w-0">
            <WatchlistPanel />
          </div>
          <div className="min-w-0 [&>*]:h-full">
            <TerminalChart />
          </div>
          <div className="min-w-0">
            <TopScoresPanel items={items} loading={scanner.isLoading} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <SectorPulse fallback={items} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Dünya ve gündem</SectionTitle>
        <MarketBriefs items={items} />
        <MarketPulseBoard items={items} loading={scanner.isLoading} />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="min-w-0 [&>*]:h-full">
            <NewsFeed />
          </div>
          <div className="min-w-0 [&>*]:h-full">
            <EconomicCalendar />
          </div>
        </div>
      </div>

      <ExploreGrid />

      <ComparisonModal open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
    </QuickChartProvider>
  );
}
