'use client';

import { useState } from 'react';
import { GitCompare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AssetCompareMatrix } from '@/components/dashboard/AssetCompareMatrix';
import { useCompare } from '@/hooks/useIntelligence';
import { SEARCH_CATALOG } from '@/lib/search-catalog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PICKS = SEARCH_CATALOG.filter(
  (i) => i.kind === 'bist' || i.kind === 'crypto'
).map((i) => {
  const m = i.href.match(/\/(?:bist|crypto)\/([^/?]+)/);
  const raw = m ? decodeURIComponent(m[1]) : i.id;
  const symbol =
    i.kind === 'crypto'
      ? raw.endsWith('USDT')
        ? raw
        : `${raw}USDT`
      : raw.includes('.')
        ? raw
        : `${raw}.IS`;
  return {
    symbol,
    label: i.label.split('·')[0].trim(),
  };
});

interface ComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComparisonModal({ open, onOpenChange }: ComparisonModalProps) {
  const [selected, setSelected] = useState<string[]>([
    'THYAO.IS',
    'GARAN.IS',
  ]);

  const { data, isFetching, error } = useCompare(
    open && selected.length >= 2 ? selected : []
  );
  const items = data?.items ?? [];

  function toggle(sym: string) {
    setSelected((prev) => {
      if (prev.includes(sym)) return prev.filter((s) => s !== sym);
      if (prev.length >= 3) return [...prev.slice(1), sym];
      return [...prev, sym];
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-4">
        <DialogTitle className="mb-3 flex items-center justify-between gap-2 px-1">
          <span className="flex items-center gap-2">
            <GitCompare className="size-4 text-emerald-400" />
            Varlık Kıyaslama
          </span>
          <Link
            href={`/compare?a=${encodeURIComponent(selected[0] ?? '')}&b=${encodeURIComponent(selected[1] ?? '')}`}
            className="text-xs font-normal text-emerald-400 hover:underline"
            onClick={() => onOpenChange(false)}
          >
            Tam sayfa →
          </Link>
        </DialogTitle>

        <div className="mb-3 flex flex-wrap gap-2 px-1">
          {PICKS.map((p) => (
            <button
              key={p.symbol}
              type="button"
              onClick={() => toggle(p.symbol)}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                selected.includes(p.symbol)
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {selected.length < 2 ? (
          <p className="px-1 text-sm text-zinc-500">En az 2 varlık seçin.</p>
        ) : isFetching && !items.length ? (
          <p className="px-1 text-sm text-zinc-500">Kıyaslanıyor…</p>
        ) : error ? (
          <p className="px-1 text-sm text-red-400">{error.message}</p>
        ) : (
          <AssetCompareMatrix items={items} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ComparisonTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="gap-1.5">
      <GitCompare className="size-3.5" />
      Kıyasla
    </Button>
  );
}
