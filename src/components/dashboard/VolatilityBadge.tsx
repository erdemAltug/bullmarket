'use client';

import { Flame, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VOLATILITY_THRESHOLD } from '@/types';

interface VolatilityBadgeProps {
  changePercent: number;
  className?: string;
}

export function VolatilityBadge({ changePercent, className }: VolatilityBadgeProps) {
  if (Math.abs(changePercent) < VOLATILITY_THRESHOLD) return null;

  const up = changePercent > 0;

  return (
    <span
      title={`Aşırı volatilite: %${changePercent.toFixed(2)}`}
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        up
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-amber-500/15 text-amber-400',
        className
      )}
    >
      {up ? <Flame className="size-3" /> : <TriangleAlert className="size-3" />}
      Vol
    </span>
  );
}
