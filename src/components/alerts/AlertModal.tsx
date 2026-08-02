'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlerts } from '@/hooks/useAlerts';
import { assetSupportsRsi } from '@/lib/alert-assets';
import type { AlertKind } from '@/types';

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  displaySymbol: string;
  currentPrice: number;
  changePercent?: number;
}

const KINDS: { value: AlertKind; label: string; needsRsi: boolean }[] = [
  { value: 'price_above', label: 'Fiyat üstü', needsRsi: false },
  { value: 'price_below', label: 'Fiyat altı', needsRsi: false },
  { value: 'change_above', label: 'Volatilite spike (%)', needsRsi: false },
  { value: 'change_below', label: '% değişim altı', needsRsi: false },
  { value: 'rsi_above', label: 'RSI aşırı alım', needsRsi: true },
  { value: 'rsi_below', label: 'RSI aşırı satım', needsRsi: true },
];

export function AlertModal({
  open,
  onOpenChange,
  symbol,
  displaySymbol,
  currentPrice,
  changePercent = 0,
}: AlertModalProps) {
  const { addAlert } = useAlerts();
  const [kind, setKind] = useState<AlertKind>('price_above');
  const [threshold, setThreshold] = useState(String(currentPrice));
  const rsiOk = assetSupportsRsi(symbol);
  const kindOptions = KINDS.filter((k) => !k.needsRsi || rsiOk);

  useEffect(() => {
    if (!open) return;
    setKind('price_above');
    setThreshold(String(currentPrice));
  }, [open, currentPrice, displaySymbol]);

  function onKindChange(next: AlertKind) {
    setKind(next);
    if (next === 'rsi_above') setThreshold('70');
    else if (next === 'rsi_below') setThreshold('30');
    else if (next.startsWith('change')) setThreshold('3');
    else setThreshold(String(currentPrice));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(threshold.replace(',', '.'));
    if (!Number.isFinite(n)) return;

    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    addAlert({ symbol, displaySymbol, kind, threshold: n });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <DialogTitle className="mb-3 flex items-center gap-2 px-1 text-base font-semibold">
          <Bell className="size-4 text-emerald-500" />
          Alarm · {displaySymbol}
        </DialogTitle>
        <p className="mb-4 px-1 text-xs text-zinc-500">
          Şu an {currentPrice.toLocaleString('tr-TR')} · %{changePercent.toFixed(2)}
        </p>
        <form onSubmit={submit} className="space-y-3 px-1 pb-2">
          <label className="block text-xs text-zinc-400">
            Tip
            <select
              value={kindOptions.some((k) => k.value === kind) ? kind : 'price_above'}
              onChange={(e) => onKindChange(e.target.value as AlertKind)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            >
              {kindOptions.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-zinc-400">
            Hedef
            <input
              type="number"
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              required
            />
          </label>
          <Button type="submit" className="w-full">
            Alarm kur
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
