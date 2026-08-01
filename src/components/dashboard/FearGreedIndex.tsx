'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, FearGreedData } from '@/types';
import { ListSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

function statusTone(value: number) {
  if (value <= 25) return 'rose';
  if (value <= 45) return 'orange';
  if (value <= 55) return 'zinc';
  if (value <= 75) return 'lime';
  return 'emerald';
}

function Dial({
  value,
  label,
  classification,
}: {
  value: number;
  label: string;
  classification: string;
}) {
  const angle = -90 + (value / 100) * 180;
  const tone = statusTone(value);
  const glow =
    value <= 25
      ? 'drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]'
      : value >= 75
        ? 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
        : 'drop-shadow-[0_0_8px_rgba(250,204,21,0.25)]';

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-5 backdrop-blur-xl">
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-zinc-400">
        {label}
      </p>
      <div className={cn('relative mx-auto h-20 w-40 overflow-hidden', glow)}>
        <div
          className="absolute inset-x-0 bottom-0 h-20 rounded-t-full"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 100%, #f43f5e 0deg, #f59e0b 60deg, #eab308 90deg, #22c55e 140deg, #10b981 180deg)',
            maskImage:
              'radial-gradient(circle at 50% 100%, transparent 52%, black 54%)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 100%, transparent 52%, black 54%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-16 w-0.5 origin-bottom bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </div>
      <p className="mt-2 text-center text-2xl font-black tabular-nums text-white">
        {value}
      </p>
      <div className="mt-2 flex justify-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
            tone === 'rose' &&
              'border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
            tone === 'orange' &&
              'border-orange-500/40 bg-orange-500/15 text-orange-400',
            tone === 'zinc' && 'border-zinc-600 bg-zinc-800/80 text-zinc-300',
            tone === 'lime' && 'border-lime-500/40 bg-lime-500/15 text-lime-400',
            tone === 'emerald' &&
              'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          )}
        >
          <span
            className={cn(
              'size-1.5 animate-pulse rounded-full',
              tone === 'rose' && 'bg-rose-400',
              tone === 'orange' && 'bg-orange-400',
              tone === 'zinc' && 'bg-zinc-400',
              tone === 'lime' && 'bg-lime-400',
              tone === 'emerald' && 'bg-emerald-400'
            )}
          />
          {classification}
        </span>
      </div>
    </div>
  );
}

export function FearGreedIndex() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['fear-greed'],
    queryFn: () => getJson<FearGreedData>('/api/fear-greed'),
    refetchInterval: 300_000,
    staleTime: 180_000,
  });

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-xl">
      <div className="mb-4 border-b border-zinc-800/60 pb-3">
        <h2 className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-sm font-semibold text-transparent">
          Fear & Greed Index
        </h2>
      </div>
      {isLoading && !data ? (
        <ListSkeleton rows={2} />
      ) : error ? (
        <p className="text-sm text-rose-400">{error.message}</p>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Dial
              value={data.crypto.value}
              label="Kripto"
              classification={data.crypto.classification}
            />
            <Dial
              value={data.bist.value}
              label="BİST Endeksi"
              classification={data.bist.classification}
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-400">
            {data.bist.note}
          </p>
          <p className="mt-2 text-[10px] text-zinc-600">
            0–25 Aşırı Korku · 75–100 Aşırı Açgözlülük
          </p>
        </>
      ) : null}
    </div>
  );
}
