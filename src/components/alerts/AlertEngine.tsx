'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAlerts } from '@/hooks/useAlerts';
import { useBist, useCrypto } from '@/hooks/useMarketData';
import type { AlertKind, ApiResponse, PriceAlert } from '@/types';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export interface LiveQuoteSnap {
  symbol: string;
  displaySymbol: string;
  price: number;
  changePercent: number;
  rsi?: number | null;
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
    case 'rsi_above':
      return snap.rsi != null && snap.rsi >= alert.threshold;
    case 'rsi_below':
      return snap.rsi != null && snap.rsi <= alert.threshold;
    default:
      return false;
  }
}

function kindLabel(kind: AlertKind): string {
  switch (kind) {
    case 'price_above':
      return 'fiyat üstü';
    case 'price_below':
      return 'fiyat altı';
    case 'change_above':
      return '% hareket üstü';
    case 'change_below':
      return '% hareket altı';
    case 'rsi_above':
      return 'RSI üstü';
    case 'rsi_below':
      return 'RSI altı';
    default:
      return kind;
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

  const rsiSymbols = useMemo(
    () =>
      [
        ...new Set(
          alerts
            .filter((a) => a.kind === 'rsi_above' || a.kind === 'rsi_below')
            .map((a) => a.symbol)
        ),
      ].join(','),
    [alerts]
  );

  const rsiQuery = useQuery({
    queryKey: ['alert-rsi', rsiSymbols],
    queryFn: () =>
      getJson<{ items: { symbol: string; rsi: number | null }[] }>(
        `/api/rsi?symbols=${encodeURIComponent(rsiSymbols)}`
      ),
    enabled: active && rsiSymbols.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const rsiMap = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const it of rsiQuery.data?.items ?? []) {
      map.set(it.symbol, it.rsi);
    }
    return map;
  }, [rsiQuery.data?.items]);

  const snaps = useMemo(() => {
    const map = new Map<string, LiveQuoteSnap>();
    for (const q of bist.data?.quotes ?? []) {
      map.set(q.symbol, {
        symbol: q.symbol,
        displaySymbol: q.symbol.replace('.IS', ''),
        price: q.price,
        changePercent: q.changePercent,
        rsi: rsiMap.get(q.symbol) ?? null,
      });
    }
    for (const t of crypto.data?.tickers ?? []) {
      map.set(t.symbol, {
        symbol: t.symbol,
        displaySymbol: t.symbol.replace('USDT', ''),
        price: t.price,
        changePercent: t.changePercent,
        rsi: rsiMap.get(t.symbol) ?? null,
      });
    }
    return map;
  }, [bist.data?.quotes, crypto.data?.tickers, rsiMap]);

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
        const detail =
          alert.kind.startsWith('rsi')
            ? `RSI ${snap.rsi?.toFixed(1) ?? '—'} (hedef: ${alert.threshold})`
            : alert.kind.startsWith('change')
              ? `%${snap.changePercent.toFixed(2)} (hedef: %${alert.threshold})`
              : `${snap.price.toLocaleString('tr-TR')} (hedef: ${alert.threshold})`;
        void notify(
          `${dir} ${alert.displaySymbol} · ${kindLabel(alert.kind)}`,
          `${alert.displaySymbol}: ${detail}`
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
