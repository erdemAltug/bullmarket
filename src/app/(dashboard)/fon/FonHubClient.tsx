'use client';

import { Landmark } from 'lucide-react';
import { MarketScannerTable } from '@/components/dashboard/MarketScannerTable';
import { useMarketScanner } from '@/hooks/useMarketScanner';

export function FonHubClient() {
  const scanner = useMarketScanner();
  const items = (scanner.data ?? []).filter(
    (i) => i.category === 'FON' || i.category === 'ETF'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Landmark className="size-6 text-amber-400" />
          Fonlar & ETF&apos;ler
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          TEFAS yatırım fonları (günlük pay değeri) + küresel ABD ETF&apos;leri
          (VOO, QQQ, SPY, SCHD…) — aynı masada.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            TEFAS fon
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {items.filter((i) => i.category === 'FON').length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Küresel ETF
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {items.filter((i) => i.category === 'ETF').length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Kaynak
          </p>
          <p className="mt-1 text-sm font-medium">TEFAS · Canlı borsa</p>
        </div>
      </div>

      <MarketScannerTable
        items={items}
        isLoading={scanner.isLoading}
        error={scanner.error?.message}
        defaultFilter="FUNDS"
        title="Fon & ETF Screener"
      />
    </div>
  );
}
