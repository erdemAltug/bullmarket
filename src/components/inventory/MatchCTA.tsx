'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MatchCTAProps = {
  symbol: string;
  displaySymbol: string;
  onAdd: (input: { quantity: number; buyPrice: number }) => void;
  className?: string;
};

/** Lot + maliyet → guest envanter. Form her zaman dikey; dar sheet’te kırılmaz. */
export function MatchCTA({
  symbol,
  displaySymbol,
  onAdd,
  className,
}: MatchCTAProps) {
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const quantity = Number(qty.replace(',', '.'));
    const buyPrice = Number(cost.replace(',', '.'));
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    if (!Number.isFinite(buyPrice) || buyPrice <= 0) return;
    onAdd({ quantity, buyPrice });
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5',
        className
      )}
    >
      <h3 className="text-sm font-semibold">Envantere ekle</h3>
      <form onSubmit={submit} className="mt-4 flex flex-1 flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0 text-xs text-[var(--muted)]">
            Lot
            <input
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="100"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
          <label className="block min-w-0 text-xs text-[var(--muted)]">
            Alış
            <input
              inputMode="decimal"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="285,50"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
        </div>
        <Button type="submit" className="mt-auto w-full shrink-0">
          Ekle
        </Button>
      </form>
    </div>
  );
}
