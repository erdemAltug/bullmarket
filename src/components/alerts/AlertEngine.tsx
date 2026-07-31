'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useBist, useCrypto } from '@/hooks/useMarketData';
import type { PriceAlert } from '@/types';

export interface LiveQuoteSnap {
  symbol: string;
  displaySymbol: string;
  price: number;
  changePercent: number;
}

function evaluate(alert: PriceAlert, snap: LiveQuoteSnap): boolean {
  switch (alert.kind) {
    case 'price_above':
      return snap.price >= alert.threshold;
    case 'price_below':
      return snap.price <= alert.threshold;
    case 'change_above':
      return snap.changePercent >= alert.threshold;
    case 'change_below':
      return snap.changePercent <= alert.threshold;
    default:
      return false;
  }
}

async function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

/** Background alert checker — mount once in dashboard layout. */
export function AlertEngine() {
  const { alerts, markTriggered, resetTriggered } = useAlerts();
  const active = alerts.length > 0;
  const bist = useBist(undefined, { enabled: active });
  const crypto = useCrypto(undefined, undefined, { enabled: active });
  const firedRef = useRef<Set<string>>(new Set());

  const snaps = useMemo(() => {
    const map = new Map<string, LiveQuoteSnap>();
    for (const q of bist.data?.quotes ?? []) {
      map.set(q.symbol, {
        symbol: q.symbol,
        displaySymbol: q.symbol.replace('.IS', ''),
        price: q.price,
        changePercent: q.changePercent,
      });
    }
    for (const t of crypto.data?.tickers ?? []) {
      map.set(t.symbol, {
        symbol: t.symbol,
        displaySymbol: t.symbol.replace('USDT', ''),
        price: t.price,
        changePercent: t.changePercent,
      });
    }
    return map;
  }, [bist.data?.quotes, crypto.data?.tickers]);

  useEffect(() => {
    for (const alert of alerts) {
      const snap = snaps.get(alert.symbol);
      if (!snap) continue;

      const hit = evaluate(alert, snap);
      if (hit && !alert.triggered && !firedRef.current.has(alert.id)) {
        firedRef.current.add(alert.id);
        markTriggered(alert.id);
        const dir =
          alert.kind.includes('above') || alert.kind === 'change_above'
            ? '▲'
            : '▼';
        void notify(
          `${dir} ${alert.displaySymbol} alarm`,
          `${alert.displaySymbol} ${snap.price.toLocaleString('tr-TR')} · %${snap.changePercent.toFixed(2)} (hedef: ${alert.threshold})`
        );
      } else if (!hit && alert.triggered) {
        firedRef.current.delete(alert.id);
        resetTriggered(alert.id);
      }
    }
  }, [alerts, snaps, markTriggered, resetTriggered]);

  return null;
}

export function useActiveAlertSymbols(alerts: PriceAlert[]) {
  return useMemo(
    () => new Set(alerts.filter((a) => a.triggered).map((a) => a.displaySymbol)),
    [alerts]
  );
}
