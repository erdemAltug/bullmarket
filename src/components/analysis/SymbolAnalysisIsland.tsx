'use client';

import dynamic from 'next/dynamic';

const SymbolAnalysisView = dynamic(
  () =>
    import('@/components/analysis/SymbolAnalysisView').then(
      (m) => m.SymbolAnalysisView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
          />
        ))}
      </div>
    ),
  }
);

type Props = {
  symbol: string;
  yahooSymbol: string;
};

/** Lazy client island for /bist/[symbol] advanced analytics. */
export function SymbolAnalysisIsland({ symbol, yahooSymbol }: Props) {
  return <SymbolAnalysisView symbol={symbol} yahooSymbol={yahooSymbol} />;
}
