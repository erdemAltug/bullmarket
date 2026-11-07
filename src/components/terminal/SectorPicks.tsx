'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useProRequest } from '@/components/pro/ProRequest';
import { useBistBoard } from '@/hooks/useMarketScanner';
import { usePlan } from '@/hooks/usePlan';
import { useTargets } from '@/hooks/useTargets';
import { buildPicks } from '@/lib/picks';
import { BIST_SECTORS, US_SECTORS } from '@/lib/seo/sectors';
import { assetDetailHref } from '@/lib/seo/internal-links';
import type { ScannerItem } from '@/types/scanner';
import { cn } from '@/lib/utils';
import { targetFromScanner, useChartClick } from './QuickChart';

const FREE_SECTORS = 4;

/** The single strongest name in every sector, with the reason in a few words. */
export function SectorPicks({ items }: { items: ScannerItem[] }) {
  const [market, setMarket] = useState<'BIST' | 'US'>('BIST');
  const board = useBistBoard();
  const targets = useTargets();
  const { isPaid } = usePlan();
  const { openPro } = useProRequest();
  const chartClick = useChartClick();

  const rows = useMemo(() => {
    const pool = market === 'BIST' && board.data?.length ? [...board.data, ...items.filter((i) => i.category !== 'BIST')] : items;
    const picks = buildPicks(pool.filter((i) => i.category === market), targets.data ?? []);
    const bySym = new Map(picks.map((p) => [p.item.displaySymbol, p]));
    const sectors = market === 'BIST' ? BIST_SECTORS : US_SECTORS;
    return sectors
      .map((s) => {
        const members = s.symbols.map((sym) => bySym.get(sym)).filter((p): p is NonNullable<typeof p> => Boolean(p));
        if (!members.length) return null;
        const best = [...members].sort((a, b) => b.rank - a.rank)[0];
        const avg = members.reduce((a, p) => a + p.item.changePercent, 0) / members.length;
        return { sector: s, best, avg, count: members.length };
      })
      .filter((r): r is NonNullable<typeof r> => r != null)
      .sort((a, b) => b.best.rank - a.best.rank);
  }, [market, board.data, items, targets.data]);

  return (
    <section className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Her sektörün en güçlüsü</h2>
          <p className="text-xs text-[var(--muted)]">Sektör içinde skor, hedef ve değerlemesi en iyi olan hisse</p>
        </div>
        <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5 text-xs">
          {(['BIST', 'US'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMarket(m)}
              className={cn(
                'rounded-md px-3 py-1 font-semibold',
                market === m ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {m === 'BIST' ? 'BİST' : 'ABD'}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {rows.map((r, idx) => {
          const locked = !isPaid && idx >= FREE_SECTORS;
          const p = r.best;
          const href = assetDetailHref(p.item.symbol, p.item.category);
          const up = p.item.changePercent >= 0;
          const inner = (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] uppercase tracking-wide text-[var(--muted)]">{r.sector.name}</p>
                <p className="flex items-baseline gap-2">
                  <b className="text-sm">{locked ? '•••••' : p.item.displaySymbol}</b>
                  <span className="truncate text-[11px] text-[var(--accent)]">{locked ? '' : p.reasons[0]}</span>
                </p>
              </div>
              {locked ? (
                <Lock className="size-3.5 text-amber-300" />
              ) : (
                <>
                  <span className="font-mono text-sm font-bold tabular-nums">{p.score}</span>
                  <span className={cn('w-14 text-right font-mono text-[11px]', up ? 'text-emerald-400' : 'text-rose-400')}>
                    {up ? '+' : ''}
                    {p.item.changePercent.toFixed(2)}%
                  </span>
                </>
              )}
            </>
          );
          const cls = 'flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2 transition-colors hover:border-[var(--accent)]/50';
          return (
            <li key={r.sector.slug}>
              {locked ? (
                <button type="button" onClick={() => openPro('sector-picks')} className={cn(cls, 'w-full text-left')}>
                  {inner}
                </button>
              ) : (
                <Link href={href ?? '/bist/sektorler'} onClick={chartClick(targetFromScanner(p.item, href))} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
        {!rows.length ? (
          <li className="col-span-full h-40 animate-pulse rounded-xl bg-[var(--border)]/30" />
        ) : null}
      </ul>
      {!isPaid && rows.length > FREE_SECTORS ? (
        <button type="button" onClick={() => openPro('sector-picks')} className="mt-3 text-[11px] font-semibold text-amber-300 hover:underline">
          {rows.length - FREE_SECTORS} sektörün liderini Pro ile gör →
        </button>
      ) : null}
    </section>
  );
}
