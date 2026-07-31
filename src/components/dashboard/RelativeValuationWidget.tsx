'use client';

import { useQuery } from '@tanstack/react-query';
import { TermHint } from '@/components/shared/TermHint';
import type { ApiResponse, RelativeValuation } from '@/types';
import { cn } from '@/lib/utils';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useRelativeValuation(symbol: string | undefined) {
  return useQuery({
    queryKey: ['relval', symbol],
    enabled: Boolean(symbol),
    queryFn: () =>
      getJson<RelativeValuation>(
        `/api/relative-valuation?symbol=${encodeURIComponent(symbol!)}`
      ),
    staleTime: 300_000,
  });
}

function Gauge({ discountPct }: { discountPct: number | null }) {
  // Map discount +40 (cheap) .. -40 (expensive) to 0..100 fill
  const raw = discountPct ?? 0;
  const pos = Math.min(100, Math.max(0, 50 + raw));

  return (
    <div className="space-y-2">
      <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
          style={{ width: '100%', opacity: 0.35 }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-white shadow"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500">
        <span>Pahalı</span>
        <span>Adil</span>
        <span>Ucuz</span>
      </div>
    </div>
  );
}

interface RelativeValuationWidgetProps {
  symbol: string;
}

export function RelativeValuationWidget({
  symbol,
}: RelativeValuationWidgetProps) {
  const { data, isLoading, error } = useRelativeValuation(symbol);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Sektör kıyası yükleniyor…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400">{error.message}</p>;
  }
  if (!data) return null;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
          Sektörel Ucuzluk Radarı
        </p>
        <span className="text-[11px] text-zinc-500">{data.sectorTr}</span>
      </div>

      <span
        className={cn(
          'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold',
          data.verdict === 'cheap' &&
            'bg-emerald-500/15 text-emerald-300',
          data.verdict === 'expensive' &&
            'bg-orange-500/15 text-orange-300',
          data.verdict === 'fair' && 'bg-zinc-700/60 text-zinc-300',
          data.verdict === 'unknown' && 'bg-zinc-800 text-zinc-500'
        )}
      >
        {data.verdictLabel}
      </span>

      <Gauge discountPct={data.peDiscountPct} />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-zinc-800 p-2">
          <p className="text-zinc-500">
            <TermHint term="fk" /> hisse
          </p>
          <p className="font-semibold tabular-nums">
            {data.stockPE?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-2">
          <p className="text-zinc-500">
            <TermHint term="fk" /> sektör ort.
          </p>
          <p className="font-semibold tabular-nums">
            {data.sectorPE?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-2">
          <p className="text-zinc-500">
            <TermHint term="pddd" /> hisse
          </p>
          <p className="font-semibold tabular-nums">
            {data.stockPB?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-2">
          <p className="text-zinc-500">
            <TermHint term="pddd" /> sektör ort.
          </p>
          <p className="font-semibold tabular-nums">
            {data.sectorPB?.toFixed(2) ?? '—'}
          </p>
        </div>
      </div>

      {data.peers.length ? (
        <p className="text-[11px] text-zinc-600">
          Peer: {data.peers.map((p) => p.replace('.IS', '')).join(', ')}
        </p>
      ) : null}
    </div>
  );
}
