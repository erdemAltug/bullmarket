'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useBistBoard } from '@/hooks/useMarketScanner';
import { BIST_SECTORS } from '@/lib/seo/sectors';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';

/**
 * Today's average move per BIST sector, as diverging bars. Uses the full
 * board when it has loaded, the live tape until then.
 */
export function SectorPulse({ fallback }: { fallback: ScannerItem[] }) {
  const board = useBistBoard();
  const items = board.data?.length ? board.data : fallback;

  const rows = useMemo(() => {
    const bySym = new Map(
      items.filter((i) => i.category === 'BIST').map((i) => [i.displaySymbol, i])
    );
    return BIST_SECTORS.map((s) => {
      const members = s.symbols
        .map((sym) => bySym.get(sym))
        .filter((i): i is ScannerItem => Boolean(i) && Math.abs(i!.changePercent) < 25);
      if (!members.length) return null;
      const avg = members.reduce((a, i) => a + i.changePercent, 0) / members.length;
      const leader = [...members].sort((a, b) => b.changePercent - a.changePercent)[0];
      const ups = members.filter((i) => i.changePercent > 0).length;
      return { sector: s, avg, leader, ups, count: members.length };
    })
      .filter((r): r is NonNullable<typeof r> => r != null)
      .sort((a, b) => b.avg - a.avg);
  }, [items]);

  const maxAbs = Math.max(0.5, ...rows.map((r) => Math.abs(r.avg)));

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Sektör nabzı</h2>
        <Link href="/bist/sektorler" className="text-xs text-[var(--accent)] hover:underline">
          Sektörler →
        </Link>
      </div>
      <p className="mt-0.5 text-[11px] text-[var(--muted)]">BİST sektörlerinin bugünkü ortalama hareketi</p>
      <ul className="mt-3 space-y-1.5">
        {!rows.length
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="h-6 animate-pulse rounded bg-[var(--border)]/40" />
            ))
          : rows.map((r) => {
              const up = r.avg >= 0;
              const w = (Math.abs(r.avg) / maxAbs) * 50;
              return (
                <li key={r.sector.slug}>
                  <Link
                    href={`/bist/sektor/${r.sector.slug}`}
                    title={`${r.count} hissenin ${r.ups} tanesi yükselişte · lider ${r.leader.displaySymbol}`}
                    className="group grid grid-cols-[minmax(0,7.5rem)_1fr_3.5rem] items-center gap-2 rounded-md px-1 py-1 hover:bg-[var(--background)]/60"
                  >
                    <span className="truncate text-xs group-hover:text-[var(--accent)]">{r.sector.name}</span>
                    <span className="relative h-2 rounded-full bg-[var(--border)]/50">
                      <span className="absolute inset-y-0 left-1/2 w-px bg-[var(--muted)]/40" />
                      <span
                        className={cn('absolute inset-y-0 rounded-full', up ? 'bg-emerald-400/80' : 'bg-rose-400/80')}
                        style={up ? { left: '50%', width: `${w}%` } : { right: '50%', width: `${w}%` }}
                      />
                    </span>
                    <span className={cn('text-right font-mono text-[11px] font-semibold tabular-nums', up ? 'text-emerald-400' : 'text-rose-400')}>
                      {up ? '+' : ''}
                      {r.avg.toFixed(2)}%
                    </span>
                  </Link>
                </li>
              );
            })}
      </ul>
    </section>
  );
}
