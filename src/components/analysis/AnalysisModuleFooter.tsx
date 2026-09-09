'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

type Props = {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  className?: string;
};

export function AnalysisModuleFooter({
  symbol,
  displaySymbol,
  name,
  price,
  className,
}: Props) {
  const { addPosition } = usePortfolio();
  const [added, setAdded] = useState(false);

  function add() {
    addPosition({
      symbol: displaySymbol,
      name,
      assetClass: 'bist',
      buyPrice: price,
      quantity: 1,
      date: new Date().toISOString().slice(0, 10),
      currency: 'TRY',
    });
    setAdded(true);
  }

  return (
    <div
      className={cn(
        'mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3',
        className
      )}
    >
      <Button type="button" className="gap-1.5 px-2.5 py-1.5 text-xs" onClick={add}>
        <Briefcase className="size-3.5" />
        {added ? 'Eklendi' : 'Envanterime ekle'}
      </Button>
      <Link
        href={`/terminal?alert=${encodeURIComponent(displaySymbol)}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]"
      >
        <Bell className="size-3.5" />
        Fiyat alarmı kur
      </Link>
      <span className="text-[10px] text-[var(--muted)]">{symbol}</span>
    </div>
  );
}
