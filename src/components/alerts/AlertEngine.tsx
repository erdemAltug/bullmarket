'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAlerts } from '@/hooks/useAlerts';
import { useFx } from '@/hooks/useMarketData';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
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
  score?: number | null;
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
    case 'score_above':
      return snap.score != null && snap.score >= alert.threshold;
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
    case 'score_above':
      return 'AI skor üstü';
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

function indexSnap(
  map: Map<string, LiveQuoteSnap>,
  snap: LiveQuoteSnap
) {
  map.set(snap.symbol.toUpperCase(), snap);
  map.set(snap.displaySymbol.toUpperCase(), snap);
  const bare = snap.symbol.replace(/\.IS$/i, '').toUpperCase();
  if (bare !== snap.symbol.toUpperCase()) map.set(bare, snap);
}

/** Background alert checker — mount once in dashboard layout. */
export function AlertEngine() {
  const { alerts, markTriggered, resetTriggered } = useAlerts();
  const active = alerts.length > 0;
  const scanner = useMarketScanner();
  const fx = useFx(undefined, { enabled: active });
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
      map.set(it.symbol.toUpperCase(), it.rsi);
    }
    return map;
  }, [rsiQuery.data?.items]);

  const snaps = useMemo(() => {
    const map = new Map<string, LiveQuoteSnap>();

    for (const item of scanner.data ?? []) {
      indexSnap(map, {
        symbol: item.symbol,
        displaySymbol: item.displaySymbol,
        price: item.price,
        changePercent: item.changePercent,
        rsi:
          rsiMap.get(item.symbol) ??
          rsiMap.get(item.symbol.toUpperCase()) ??
          null,
        score: scoreOpportunity(item),
      });
    }

    for (const c of scanner.commodities ?? []) {
      indexSnap(map, {
        symbol: c.symbol,
        displaySymbol: c.name,
        price: c.price,
        changePercent: c.changePercent,
        rsi: null,
      });
    }

    for (const r of fx.data?.rates ?? []) {
      indexSnap(map, {
        symbol: r.code,
        displaySymbol: `${r.code}/TRY`,
        price: r.forexSelling,
        changePercent: 0,
        rsi: null,
      });
      if (r.code === 'USD') {
        indexSnap(map, {
          symbol: 'USDTRY',
          displaySymbol: 'USD/TRY',
          price: r.forexSelling,
          changePercent: 0,
          rsi: null,
        });
      }
    }

    return map;
  }, [scanner.data, scanner.commodities, fx.data?.rates, rsiMap]);

  useEffect(() => {
    if (!active) return;

    for (const alert of alerts) {
      const key = alert.symbol.toUpperCase();
      const snap =
        snaps.get(key) ??
        snaps.get(alert.displaySymbol.toUpperCase()) ??
        snaps.get(alert.symbol.replace(/\.IS$/i, '').toUpperCase());
      if (!snap) continue;

      const hit = evaluate(alert, snap);
      if (hit && !alert.triggered && !firedRef.current.has(alert.id)) {
        firedRef.current.add(alert.id);
        markTriggered(alert.id);
        const dir =
          alert.kind.includes('above') || alert.kind === 'change_above'
            ? '▲'
            : '▼';
        const detail = alert.kind.startsWith('rsi')
          ? `RSI ${snap.rsi?.toFixed(1) ?? '—'} (hedef: ${alert.threshold})`
          : alert.kind === 'score_above'
            ? `skor ${snap.score ?? '—'} (hedef: ${alert.threshold})`
            : alert.kind.startsWith('change')
              ? `%${snap.changePercent.toFixed(2)} (hedef: %${alert.threshold})`
              : `${snap.price.toLocaleString('tr-TR')} (hedef: ${alert.threshold})`;
        void notify(
          `${dir} ${alert.displaySymbol} · ${kindLabel(alert.kind)}`,
          `${alert.displaySymbol}: ${detail}`
        );
        void fetch('/api/alerts/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert.id,
            displaySymbol: alert.displaySymbol,
            kindLabel: kindLabel(alert.kind),
            detail: `${alert.displaySymbol}: ${detail}`,
          }),
        }).catch(() => undefined);
      } else if (!hit && alert.triggered) {
        firedRef.current.delete(alert.id);
        resetTriggered(alert.id);
      }
    }
  }, [active, alerts, snaps, markTriggered, resetTriggered]);

  return null;
}

export function useActiveAlertSymbols(alerts: PriceAlert[]) {
  return useMemo(
    () => new Set(alerts.filter((a) => a.triggered).map((a) => a.displaySymbol)),
    [alerts]
  );
}
