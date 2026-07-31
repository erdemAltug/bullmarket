'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FxRate } from '@/types';

interface FxConverterProps {
  rates: FxRate[];
}

type Pair = 'USD_TRY' | 'EUR_TRY' | 'GBP_TRY' | 'GOLD_TRY' | 'GOLD_USD' | 'TRY_USD';

const PAIRS: { id: Pair; label: string }[] = [
  { id: 'USD_TRY', label: 'USD → TRY' },
  { id: 'EUR_TRY', label: 'EUR → TRY' },
  { id: 'GBP_TRY', label: 'GBP → TRY' },
  { id: 'GOLD_TRY', label: 'Gram Altın → TRY' },
  { id: 'GOLD_USD', label: 'Gram Altın → USD' },
  { id: 'TRY_USD', label: 'TRY → USD' },
];

function rateFor(rates: FxRate[], code: string): number {
  return rates.find((r) => r.code === code)?.forexSelling ?? 0;
}

function convert(amount: number, pair: Pair, rates: FxRate[]): number {
  const usd = rateFor(rates, 'USD');
  const eur = rateFor(rates, 'EUR');
  const gbp = rateFor(rates, 'GBP');
  const gold = rateFor(rates, 'GOLD');

  switch (pair) {
    case 'USD_TRY':
      return amount * usd;
    case 'EUR_TRY':
      return amount * eur;
    case 'GBP_TRY':
      return amount * gbp;
    case 'GOLD_TRY':
      return amount * gold;
    case 'GOLD_USD':
      return usd ? (amount * gold) / usd : 0;
    case 'TRY_USD':
      return usd ? amount / usd : 0;
    default:
      return 0;
  }
}

function resultCurrency(pair: Pair): string {
  if (pair === 'GOLD_USD' || pair === 'TRY_USD') return 'USD';
  return 'TRY';
}

export function FxConverter({ rates }: FxConverterProps) {
  const [amount, setAmount] = useState('1000');
  const [pair, setPair] = useState<Pair>('USD_TRY');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const n = Number(amount.replace(',', '.'));
    if (!Number.isFinite(n)) return 0;
    return convert(n, pair, rates);
  }, [amount, pair, rates]);

  async function copy() {
    const text = result.toLocaleString('tr-TR', {
      maximumFractionDigits: 4,
    });
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3 border-t border-zinc-800 pt-3">
      <p className="text-xs font-medium text-zinc-400">Hızlı çevirici</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm tabular-nums"
        />
        <select
          value={pair}
          onChange={(e) => setPair(e.target.value as Pair)}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm"
        >
          {PAIRS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-semibold tabular-nums">
          {result.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}{' '}
          <span className="text-sm font-normal text-zinc-500">
            {resultCurrency(pair)}
          </span>
        </p>
        <Button type="button" variant="outline" onClick={copy} className="gap-1.5 px-2 py-1.5">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </Button>
      </div>
    </div>
  );
}
