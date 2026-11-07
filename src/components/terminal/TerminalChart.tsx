'use client';

import { useEffect, useState } from 'react';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { cn } from '@/lib/utils';

const OPTIONS: { id: string; label: string; symbol: string; source: 'yahoo' | 'binance'; cur: string }[] = [
  { id: 'xu100', label: 'BİST 100', symbol: 'XU100.IS', source: 'yahoo', cur: '' },
  { id: 'ndx', label: 'Nasdaq', symbol: '^IXIC', source: 'yahoo', cur: '' },
  { id: 'spx', label: 'S&P 500', symbol: '^GSPC', source: 'yahoo', cur: '' },
  { id: 'dji', label: 'Dow Jones', symbol: '^DJI', source: 'yahoo', cur: '' },
  { id: 'dax', label: 'DAX', symbol: '^GDAXI', source: 'yahoo', cur: '' },
  { id: 'btc', label: 'Bitcoin', symbol: 'BTCUSDT', source: 'binance', cur: '$' },
  { id: 'gold', label: 'Altın (ons)', symbol: 'GC=F', source: 'yahoo', cur: '$' },
  { id: 'usd', label: 'Dolar/TL', symbol: 'USDTRY=X', source: 'yahoo', cur: '₺' },
  { id: 'brent', label: 'Brent', symbol: 'BZ=F', source: 'yahoo', cur: '$' },
];

const KEY = 'bullsye:terminal-chart';

/** Terminal's main chart with a switcher across indices, crypto, gold and FX. */
export function TerminalChart() {
  const [id, setId] = useState('xu100');
  // Restore the last pick after hydration (server always renders BİST 100).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setId(saved);
    } catch {
      /* private mode */
    }
  }, []);
  const opt = OPTIONS.find((o) => o.id === id) ?? OPTIONS[0];

  const pick = (next: string) => {
    setId(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="-mb-2 flex gap-1.5 overflow-x-auto px-4 pt-4 [scrollbar-width:none]">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => pick(o.id)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              o.id === opt.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex-1 px-4 [&>*]:h-full">
        <ChartPanel
          key={opt.symbol}
          title={opt.label}
          symbol={opt.symbol}
          source={opt.source}
          currencySymbol={opt.cur}
          defaultTimeframe="5D"
          bare
        />
      </div>
    </div>
  );
}
