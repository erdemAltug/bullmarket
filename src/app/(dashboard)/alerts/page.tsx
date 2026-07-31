'use client';

import { Bell, Trash2 } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import type { AlertKind } from '@/types';

const KIND_LABEL: Record<AlertKind, string> = {
  price_above: 'Fiyat üstü',
  price_below: 'Fiyat altı',
  change_above: '% değişim üstü',
  change_below: '% değişim altı',
};

export default function AlertsPage() {
  const { alerts, removeAlert, ready } = useAlerts();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alarmlarım</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fiyat ve değişim alarmları
        </p>
      </div>

      {!ready ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : !alerts.length ? (
        <EmptyState
          icon={Bell}
          title="Henüz alarm yok"
          description="Metrik kartlarından veya watchlist’ten fiyat alarmı kurabilirsiniz."
        />
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3 backdrop-blur-xl"
            >
              <div>
                <p className="font-semibold text-zinc-100">{a.displaySymbol}</p>
                <p className="text-xs text-zinc-500">
                  {KIND_LABEL[a.kind]} · eşik{' '}
                  {a.kind.startsWith('change')
                    ? `%${a.threshold}`
                    : formatPrice(a.threshold, 'TRY')}
                  {a.triggered ? (
                    <span className="ml-2 text-amber-400">· tetiklendi</span>
                  ) : null}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeAlert(a.id)}
                className="text-zinc-500 hover:text-rose-400"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
