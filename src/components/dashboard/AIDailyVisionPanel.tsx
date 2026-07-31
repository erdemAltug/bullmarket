'use client';

import { Sparkles } from 'lucide-react';
import type { DailyVisionReport } from '@/lib/ai-opportunity';
import { cn } from '@/lib/utils';

interface AIDailyVisionPanelProps {
  report: DailyVisionReport | null;
  loading?: boolean;
}

export function AIDailyVisionPanel({
  report,
  loading,
}: AIDailyVisionPanelProps) {
  if (loading && !report) {
    return (
      <div className="h-36 animate-pulse rounded-2xl border border-emerald-500/20 bg-zinc-950" />
    );
  }
  if (!report) return null;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-500/25',
        'bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/40 p-5 sm:p-6'
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              <Sparkles className="size-3.5" />
              Yapay Zeka Günlük Vizyon
            </span>
            <span className="text-[11px] text-zinc-500">
              {new Date(report.asOf).toLocaleString('tr-TR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
            {report.headline}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            {report.body}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
          {(
            [
              ['Ort. potansiyel', `%${report.avgUpsidePct.toFixed(0)}`],
              ['Fırsat kartı', String(report.opportunityCount)],
              ['Yükselen pay', `%${report.bullishShare.toFixed(0)}`],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="min-w-[88px] rounded-xl border border-emerald-500/20 bg-black/40 px-3 py-2 text-center"
            >
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                {label}
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold text-emerald-400">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
