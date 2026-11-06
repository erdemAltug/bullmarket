'use client';

import Link from 'next/link';
import { HeatmapTreemap } from '@/components/dashboard/HeatmapTreemap';
import { useHeatmap } from '@/hooks/useHeatmap';

/** Compact BIST heatmap for the terminal; full view lives on /bist/heatmap. */
export function MiniHeatmap() {
  const { data, isLoading } = useHeatmap();
  const quotes = data?.quotes ?? [];
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">BİST ısı haritası</h2>
        <Link href="/bist/heatmap" className="text-xs text-[var(--accent)] hover:underline">
          Tam ekran →
        </Link>
      </div>
      {isLoading && !quotes.length ? (
        <div className="h-[380px] animate-pulse rounded-xl bg-[var(--border)]/40" />
      ) : (
        <HeatmapTreemap quotes={quotes} sizeBy="marketCap" heightClass="h-[380px]" />
      )}
    </section>
  );
}
