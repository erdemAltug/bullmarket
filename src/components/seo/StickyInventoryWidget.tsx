'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/hooks/usePortfolio';

type Props = {
  symbol: string;
  name: string;
  price: number;
};

export function StickyInventoryWidget({ symbol, name, price }: Props) {
  const { addPosition } = usePortfolio();
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState(price > 0 ? String(price) : '');
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const quantity = Number(qty.replace(',', '.'));
    const buyPrice = Number(cost.replace(',', '.'));
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    if (!Number.isFinite(buyPrice) || buyPrice <= 0) return;
    addPosition({
      symbol,
      name,
      assetClass: 'bist',
      buyPrice,
      quantity,
      date: new Date().toISOString().slice(0, 10),
      currency: 'TRY',
    });
    setDone(true);
  }

  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 lg:sticky lg:top-20">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        Envantere ekle
      </h3>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <label className="block text-[11px] text-[var(--muted)]">
          Lot
          <input
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="100"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-[11px] text-[var(--muted)]">
          Alış (₺)
          <input
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="285,50"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" className="w-full text-sm">
          {done ? 'Eklendi' : 'Ekle'}
        </Button>
      </form>
    </aside>
  );
}
