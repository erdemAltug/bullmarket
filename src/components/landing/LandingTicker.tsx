'use client';

import { useMemo } from 'react';
import { TickerTape } from '@/components/dashboard/TickerTape';
import { useMarketScanner } from '@/hooks/useMarketScanner';

const PRIORITY = [
  'THYAO',
  'GARAN',
  'ASELS',
  'EREGL',
  'XU100',
  'BTC',
  'ETH',
  'BNB',
  'SOL',
  'XRP',
  'AAPL',
  'NVDA',
  'TSLA',
];

export function LandingTicker() {
  const { data } = useMarketScanner();

  const items = useMemo(() => {
    const list = data ?? [];
    if (!list.length) return [];
    const ranked = [...list].sort((a, b) => {
      const ai = PRIORITY.findIndex((p) =>
        a.displaySymbol.toUpperCase().includes(p)
      );
      const bi = PRIORITY.findIndex((p) =>
        b.displaySymbol.toUpperCase().includes(p)
      );
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return ranked.slice(0, 24).map((m) => ({
      symbol: m.displaySymbol,
      price: m.price,
      changePercent: m.changePercent,
    }));
  }, [data]);

  if (!items.length) {
    return (
      <div className="border-y border-[var(--border)] bg-[var(--surface)]/80 py-2.5 text-center text-xs text-[var(--muted)]">
        Canlı piyasa bandı yükleniyor…
      </div>
    );
  }

  return (
    <div className="border-y border-[var(--border)] [&_.animate-ticker]:opacity-95">
      <TickerTape items={items} />
    </div>
  );
}
