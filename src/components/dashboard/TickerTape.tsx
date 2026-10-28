'use client';

import { BellRing, TrendingDown, TrendingUp } from 'lucide-react';
import { VolatilityBadge } from '@/components/dashboard/VolatilityBadge';
import { PriceFlash } from '@/components/shared/PriceFlash';
import { cn, formatPercent } from '@/lib/utils';

export interface TickerItem {
  symbol: string;
  price: number;
  changePercent: number;
  alertActive?: boolean;
}

interface TickerTapeProps {
  items: TickerItem[];
}

export function TickerTape({ items }: TickerTapeProps) {
  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className="relative z-0 overflow-hidden border-b [mask-image:linear-gradient(to_right,transparent,#000_24px,#000_calc(100%-24px),transparent)] border-[var(--border)] bg-[var(--surface)]/90 py-2.5 backdrop-blur-md">
      <div className="animate-ticker flex w-max gap-8 whitespace-nowrap px-4 text-sm">
        {loop.map((item, i) => {
          const positive = item.changePercent >= 0;
          return (
            <span
              key={`${item.symbol}-${i}`}
              className="inline-flex items-center gap-2.5"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                {item.symbol}
                {item.alertActive ? (
                  <BellRing
                    className={cn(
                      'size-3.5 animate-alert-blink',
                      positive ? 'text-[var(--up)]' : 'text-[var(--down)]'
                    )}
                  />
                ) : null}
                <VolatilityBadge changePercent={item.changePercent} />
              </span>
              <PriceFlash value={item.price} className="px-0.5 text-[var(--muted)]">
                {item.price.toLocaleString('tr-TR', {
                  maximumFractionDigits: 4,
                })}
              </PriceFlash>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-bold',
                  positive
                    ? 'border-[var(--up)]/30 bg-[var(--glow-up)] text-[var(--up)]'
                    : 'border-[var(--down)]/30 bg-[var(--glow-down)] text-[var(--down)]'
                )}
              >
                {positive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {formatPercent(item.changePercent)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
