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

interface SmartAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  displaySymbol: string;
  currentPrice: number;
  changePercent?: number;
  /** AI opportunity score 0–100 — enables “skor üstü” trigger */
  currentScore?: number;
}

const BASE_KINDS: {
  value: AlertKind;
  label: string;
  needsRsi: boolean;
  needsScore: boolean;
}[] = [
  { value: 'price_above', label: 'Fiyat üstü', needsRsi: false, needsScore: false },
  { value: 'price_below', label: 'Fiyat altı', needsRsi: false, needsScore: false },
  { value: 'change_above', label: '% hareket üstü', needsRsi: false, needsScore: false },
  { value: 'score_above', label: 'AI skor üstü', needsRsi: false, needsScore: true },
  { value: 'rsi_above', label: 'RSI aşırı alım', needsRsi: true, needsScore: false },
  { value: 'rsi_below', label: 'RSI aşırı satım', needsRsi: true, needsScore: false },
];

export function SmartAlertModal({
  open,
  onOpenChange,
  symbol,
  displaySymbol,
  currentPrice,
  changePercent = 0,
  currentScore,
}: SmartAlertModalProps) {
  const { addAlert } = useAlerts();
  const [kind, setKind] = useState<AlertKind>('price_above');
  const [threshold, setThreshold] = useState(String(currentPrice));
  const [permNote, setPermNote] = useState('');
  const rsiOk = assetSupportsRsi(symbol);
  const scoreOk = currentScore != null && currentScore > 0;

  const kinds = BASE_KINDS.filter(
    (k) => (!k.needsRsi || rsiOk) && (!k.needsScore || scoreOk)
  );

  useEffect(() => {
    if (!open) return;
    setKind('price_above');
    setThreshold(String(Number(currentPrice.toFixed(4))));
    setPermNote('');
  }, [open, currentPrice, displaySymbol]);

  function applyPreset(next: AlertKind) {
    setKind(next);
    if (next === 'rsi_above') setThreshold('70');
    else if (next === 'rsi_below') setThreshold('30');
    else if (next === 'change_above') setThreshold('3');
    else if (next === 'score_above') {
      setThreshold(String(Math.min(95, Math.max(70, Math.ceil((currentScore ?? 80) / 5) * 5))));
    } else if (next === 'price_above') {
      setThreshold(String(Number((currentPrice * 1.02).toFixed(4))));
    } else if (next === 'price_below') {
      setThreshold(String(Number((currentPrice * 0.98).toFixed(4))));
    } else {
      setThreshold(String(Number(currentPrice.toFixed(4))));
    }
  }

  async function ensurePermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermNote('Bu tarayıcı bildirim desteklemiyor — alarm yine kaydedilir.');
      return;
    }
    if (Notification.permission === 'granted') {
      setPermNote('Bildirimler açık.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPermNote(
      perm === 'granted'
        ? 'Bildirim izni verildi — tetiklenince toast gelecek.'
        : 'İzin yok — alarm kaydedilir, toast için izin gerekir.'
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(threshold.replace(',', '.'));
    if (!Number.isFinite(n)) return;
    void ensurePermission();
    addAlert({ symbol, displaySymbol, kind, threshold: n });
    onOpenChange(false);
  }

  const hint =
    kind === 'price_above'
      ? `${displaySymbol} ₺/fiyat ${threshold} üzerine çıkınca`
      : kind === 'price_below'
        ? `${displaySymbol} ${threshold} altına inince`
        : kind === 'score_above'
          ? `AI skor ${threshold} üstüne çıkınca`
          : kind === 'change_above'
            ? `%${threshold} hareket olunca`
            : `RSI eşiği ${threshold}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <DialogTitle className="mb-1 flex items-center gap-2 px-1 text-base font-semibold">
          <Bell className="size-4 text-emerald-500" />
          Akıllı alarm · {displaySymbol}
        </DialogTitle>
        <p className="mb-3 px-1 text-xs text-zinc-500">
          Şu an{' '}
          {currentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} · %
          {changePercent.toFixed(2)}
          {scoreOk ? ` · skor ${currentScore}/100` : ''}
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5 px-1">
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => applyPreset(k.value)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                kind === k.value
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3 px-1 pb-2">
          <label className="block text-xs text-zinc-400">
            Eşik
            <input
              type="number"
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              required
            />
          </label>
          <p className="text-[11px] text-zinc-500">{hint}</p>
          {permNote ? (
            <p className="text-[11px] text-emerald-400/90">{permNote}</p>
          ) : null}
          <Button type="submit" className="w-full">
            Alarmı kaydet &amp; bildirim iste
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
