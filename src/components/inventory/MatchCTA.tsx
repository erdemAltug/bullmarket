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

/** “Kaç lotun var?” — guest envantere sıfır sürtünmeli ekleme. */
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
        'rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5',
        className
      )}
    >
      <h3 className="text-sm font-semibold">Kişisel eşleşme</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        Bu hisseden ({displaySymbol}) elinde kaç lot var? Maliyetini gir, risk
        puanını hemen görelim.
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-[var(--muted)]">
          Lot
          <input
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="100"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="block text-xs text-[var(--muted)]">
          Alış (₺)
          <input
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="285,50"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Envantere ekle
          </Button>
        </div>
      </form>
      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Kayıtsız deneme · {symbol} LocalStorage’da tutulur
      </p>
    </div>
  );
}
