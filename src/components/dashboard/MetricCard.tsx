'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VolatilityBadge } from '@/components/dashboard/VolatilityBadge';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { cn, formatPercent } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  changePercent?: number;
  currency?: string;
  subtitle?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  changePercent = 0,
  currency = 'TRY',
  subtitle,
  onClick,
}: MetricCardProps) {
  const { formatPrice, t } = usePreferences();
  const positive = changePercent >= 0;

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-[var(--card)]',
        positive
          ? 'shadow-[0_0_20px_var(--glow-up)]'
          : 'shadow-[0_0_20px_var(--glow-down)]',
        onClick && 'cursor-pointer hover:border-[var(--accent)]/40'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r',
          positive
            ? 'from-transparent via-emerald-400/80 to-transparent'
            : 'from-transparent via-rose-400/80 to-transparent'
        )}
      />
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          {title}
          <VolatilityBadge changePercent={changePercent} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] tabular-nums">
          {formatPrice(value, currency)}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold',
              positive
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/15 text-rose-400'
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {formatPercent(changePercent)}
          </span>
          {subtitle ? (
            <span className="text-xs font-normal text-zinc-500">{subtitle}</span>
          ) : null}
        </div>
        {onClick ? (
          <p className="mt-2 text-[11px] text-[var(--muted)]">{t.common.clickForAlert}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
