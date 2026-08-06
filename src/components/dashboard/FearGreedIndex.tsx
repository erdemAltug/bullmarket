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
  return 'teal';
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

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl">
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <div className="relative mx-auto h-20 w-40 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-20 rounded-t-full"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 100%, #f43f5e 0deg, #f59e0b 60deg, #eab308 90deg, #2dd4bf 140deg, #14b8a6 180deg)',
            maskImage:
              'radial-gradient(circle at 50% 100%, transparent 52%, black 54%)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 100%, transparent 52%, black 54%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-16 w-0.5 origin-bottom bg-[var(--foreground)]"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--foreground)]" />
      </div>
      <p className="mt-2 text-center text-2xl font-black tabular-nums text-[var(--foreground)]">
        {value}
      </p>
      <div className="mt-2 flex justify-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
            tone === 'rose' &&
              'border-[var(--down)]/40 bg-[var(--glow-down)] text-[var(--down)]',
            tone === 'orange' &&
              'border-orange-500/40 bg-orange-500/10 text-orange-400',
            tone === 'zinc' &&
              'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]',
            tone === 'lime' &&
              'border-lime-500/35 bg-lime-500/10 text-lime-400',
            tone === 'teal' &&
              'border-[var(--up)]/40 bg-[var(--glow-up)] text-[var(--up)]'
          )}
        >
          <span
            className={cn(
              'size-1.5 animate-pulse rounded-full',
              tone === 'rose' && 'bg-[var(--down)]',
              tone === 'orange' && 'bg-orange-400',
              tone === 'zinc' && 'bg-[var(--muted)]',
              tone === 'lime' && 'bg-lime-400',
              tone === 'teal' && 'bg-[var(--up)]'
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur-xl">
      <div className="mb-4 border-b border-[var(--border)] pb-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Fear & Greed Index
        </h2>
      </div>
      {isLoading && !data ? (
        <ListSkeleton rows={2} />
      ) : error ? (
        <p className="text-sm text-[var(--down)]">{error.message}</p>
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
          <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
            {data.bist.note}
          </p>
          <p className="mt-2 text-[10px] text-[var(--muted)]/70">
            0–25 Aşırı Korku · 75–100 Aşırı Açgözlülük
          </p>
        </>
      ) : null}
    </div>
  );
}
