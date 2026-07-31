'use client';

import type { OrderBook, OrderBookLevel } from '@/types';
import { cn } from '@/lib/utils';

function DepthSide({
  levels,
  side,
}: {
  levels: OrderBookLevel[];
  side: 'bid' | 'ask';
}) {
  const maxQty = Math.max(...levels.map((l) => l.quantity), 1);

  return (
    <div>
      <p
        className={cn(
          'mb-2 text-xs font-medium uppercase tracking-wider',
          side === 'bid' ? 'text-emerald-400' : 'text-red-400'
        )}
      >
        {side === 'bid' ? 'Bids' : 'Asks'}
      </p>
      <ul className="space-y-0.5 font-mono text-xs">
        {levels.map((l) => {
          const pct = Math.min(100, (l.quantity / maxQty) * 100);
          return (
            <li
              key={`${side}-${l.price}`}
              className="relative flex justify-between overflow-hidden rounded px-1.5 py-1"
            >
              <div
                className={cn(
                  'absolute inset-y-0 opacity-[0.15]',
                  side === 'bid'
                    ? 'right-0 bg-emerald-500'
                    : 'left-0 bg-red-500'
                )}
                style={{ width: `${pct}%` }}
              />
              <span
                className={cn(
                  'relative z-10',
                  side === 'bid' ? 'text-emerald-300' : 'text-red-300'
                )}
              >
                {l.price}
              </span>
              <span className="relative z-10 text-zinc-500">{l.quantity}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface OrderBookDepthProps {
  orderbook: OrderBook;
}

export function OrderBookDepth({ orderbook }: OrderBookDepthProps) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <DepthSide levels={orderbook.bids} side="bid" />
      <DepthSide levels={orderbook.asks} side="ask" />
    </div>
  );
}
