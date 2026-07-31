'use client';

import { ArrowDownRight, ArrowUpRight, Bell, Trash2 } from 'lucide-react';
import { VolatilityBadge } from '@/components/dashboard/VolatilityBadge';
import { cn, formatPercent, formatPrice } from '@/lib/utils';

export interface WatchlistRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency?: string;
}

interface WatchlistTableProps {
  rows: WatchlistRow[];
  onSort?: (key: 'symbol' | 'price' | 'changePercent') => void;
  onAlert?: (row: WatchlistRow) => void;
  onRemove?: (symbol: string) => void;
  onRowClick?: (row: WatchlistRow) => void;
}

const thClass =
  'px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500';

export function WatchlistTable({
  rows,
  onSort,
  onAlert,
  onRemove,
  onRowClick,
}: WatchlistTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/80">
          <tr>
            <th className={thClass}>
              <button
                type="button"
                className="uppercase tracking-wider"
                onClick={() => onSort?.('symbol')}
              >
                Symbol
              </button>
            </th>
            <th className={thClass}>Name</th>
            <th className={cn(thClass, 'text-right')}>
              <button
                type="button"
                className="uppercase tracking-wider"
                onClick={() => onSort?.('price')}
              >
                Price
              </button>
            </th>
            <th className={cn(thClass, 'text-right')}>
              <button
                type="button"
                className="uppercase tracking-wider"
                onClick={() => onSort?.('changePercent')}
              >
                Change
              </button>
            </th>
            {(onAlert || onRemove) && <th className={thClass}> </th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const positive = row.changePercent >= 0;
            return (
              <tr
                key={row.symbol}
                className={cn(
                  'group border-b border-zinc-800/50 last:border-0 transition-colors hover:bg-zinc-900/60',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                <td className="px-4 py-3 font-medium text-zinc-100">
                  <span className="inline-flex items-center gap-1.5">
                    {row.symbol}
                    <VolatilityBadge changePercent={row.changePercent} />
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{row.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPrice(row.price, row.currency ?? 'TRY')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      'inline-flex items-center justify-end gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold',
                      positive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    {positive ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                    {formatPercent(row.changePercent)}
                  </span>
                </td>
                {(onAlert || onRemove) && (
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {onAlert ? (
                        <button
                          type="button"
                          title="Alarm kur"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAlert(row);
                          }}
                        >
                          <Bell className="size-3.5" />
                        </button>
                      ) : null}
                      {onRemove ? (
                        <button
                          type="button"
                          title="Listeden çıkar"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(row.symbol);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : null}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
