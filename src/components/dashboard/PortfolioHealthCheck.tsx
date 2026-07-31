'use client';

import { HeartPulse } from 'lucide-react';
import type { PortfolioHealthReport } from '@/types';
import { cn } from '@/lib/utils';

interface PortfolioHealthCheckProps {
  report: PortfolioHealthReport;
}

export function PortfolioHealthCheck({ report }: PortfolioHealthCheckProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="size-4 text-rose-400" />
          <h2 className="text-sm font-medium text-zinc-200">
            Portföy Sağlık Analizi
          </h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">
            {report.score}
            <span className="text-sm font-normal text-zinc-500">/100</span>
          </p>
          <p className="text-xs text-zinc-400">{report.label}</p>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            report.score >= 80
              ? 'bg-emerald-500'
              : report.score >= 60
                ? 'bg-amber-500'
                : 'bg-red-500'
          )}
          style={{ width: `${report.score}%` }}
        />
      </div>

      <ul className="space-y-2">
        {report.findings.map((f) => (
          <li
            key={f.id}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              f.severity === 'critical' &&
                'border-red-500/40 bg-red-500/10 text-red-200',
              f.severity === 'warn' &&
                'border-amber-500/40 bg-amber-500/10 text-amber-100',
              f.severity === 'info' &&
                'border-zinc-700 bg-zinc-900/60 text-zinc-300'
            )}
          >
            <p className="font-medium">{f.title}</p>
            <p className="mt-0.5 text-xs opacity-90">{f.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
