'use client';

import { useState } from 'react';
import { HeatmapTreemap } from '@/components/dashboard/HeatmapTreemap';
import { Button } from '@/components/ui/button';
import { useHeatmap } from '@/hooks/useHeatmap';

export default function HeatmapPage() {
  const { data, isLoading, error } = useHeatmap();
  const [sizeBy, setSizeBy] = useState<'marketCap' | 'volume'>('marketCap');
  const quotes = data?.quotes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Isı Haritası</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Günlük performans dağılımı
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={sizeBy === 'marketCap' ? 'default' : 'outline'}
            onClick={() => setSizeBy('marketCap')}
          >
            Piyasa değeri
          </Button>
          <Button
            type="button"
            variant={sizeBy === 'volume' ? 'default' : 'outline'}
            onClick={() => setSizeBy('volume')}
          >
            Hacim
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-400">{error.message}</p>
      ) : isLoading && !quotes.length ? (
        <p className="text-sm text-zinc-500">Heatmap yükleniyor…</p>
      ) : (
        <HeatmapTreemap quotes={quotes} sizeBy={sizeBy} />
      )}
    </div>
  );
}
