'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Point = { day: string; score: number; price: number };

const W = 600;
const H = 140;

function fmtDay(day: string) {
  const d = new Date(`${day}T12:00:00`);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

/** 90-day daily score trend from the server-side scan (score_history). */
export function ScoreHistoryCard({ symbol, label }: { symbol: string; label: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['score-history', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/scores/history?symbol=${encodeURIComponent(symbol)}&days=90`);
      if (!res.ok) return [] as Point[];
      const json = (await res.json()) as { data?: { points?: Point[] } };
      return json.data?.points ?? [];
    },
    staleTime: 15 * 60_000,
  });
  const points = useMemo(() => data ?? [], [data]);

  const chart = useMemo(() => {
    if (points.length < 2) return null;
    const xy = points.map((p, i) => [
      (i / (points.length - 1)) * W,
      H - 8 - (Math.max(0, Math.min(100, p.score)) / 100) * (H - 16),
    ]);
    const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return { line, area: `${line} L${W},${H} L0,${H} Z`, last: xy[xy.length - 1] };
  }, [points]);

  const first = points[0];
  const last = points[points.length - 1];
  const delta = first && last ? last.score - first.score : 0;
  const best = points.reduce<Point | null>((b, p) => (!b || p.score > b.score ? p : b), null);
  const worst = points.reduce<Point | null>((b, p) => (!b || p.score < b.score ? p : b), null);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-semibold">
            <History className="size-4 text-[var(--accent)]" /> {label} skor geçmişi
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Analiz skorunun günlük değişimi, son 90 gün
          </p>
        </div>
        {chart && last ? (
          <div className="text-right">
            <p className="font-mono text-2xl font-bold tabular-nums">{last.score}</p>
            <p
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold',
                delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {delta >= 0 ? '+' : ''}
              {delta} puan · {points.length} gün
            </p>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-4 h-[140px] animate-pulse rounded-lg bg-[var(--border)]/40" />
      ) : chart ? (
        <>
          <div className="relative mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[140px] w-full">
            <defs>
              <linearGradient id={`sh-${symbol}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(20,184,166)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(20,184,166)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[30, 50, 70].map((v) => {
              const y = H - 8 - (v / 100) * (H - 16);
              return (
                <line key={v} x1="0" x2={W} y1={y} y2={y} stroke="rgba(148,163,184,0.12)" strokeDasharray="3 5" />
              );
            })}
            <path d={chart.area} fill={`url(#sh-${symbol})`} />
            <path
              d={chart.line}
              fill="none"
              stroke="rgb(45,212,191)"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-[var(--muted)]">
            <span>{fmtDay(first.day)}</span>
            {best && worst ? (
              <span>
                En yüksek {best.score} ({fmtDay(best.day)}) · En düşük {worst.score} ({fmtDay(worst.day)})
              </span>
            ) : null}
            <span>{fmtDay(last.day)}</span>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-5 text-center text-sm text-[var(--muted)]">
          Skor geçmişi birikiyor. Her gün bir ölçüm eklenir; birkaç gün içinde
          {` ${label} `}skorunun nasıl değiştiğini burada göreceksin.
        </div>
      )}
    </section>
  );
}
