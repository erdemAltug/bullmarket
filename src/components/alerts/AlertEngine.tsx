'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAlerts } from '@/hooks/useAlerts';
import { useFx } from '@/hooks/useMarketData';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import {
  alertKindLabel,
  describeAlertHit,
  evaluateAlert,
  indexSnap,
  lookupSnap,
  type LiveQuoteSnap,
} from '@/lib/alert-eval';
import type { ApiResponse, PriceAlert } from '@/types';

export type { LiveQuoteSnap };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
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
      const snap = lookupSnap(snaps, alert);
      if (!snap) continue;

      const hit = evaluateAlert(alert, snap);
      if (hit && !alert.triggered && !firedRef.current.has(alert.id)) {
        firedRef.current.add(alert.id);
        markTriggered(alert.id);
        const dir =
          alert.kind.includes('above') || alert.kind === 'change_above'
            ? '▲'
            : '▼';
        const detail = describeAlertHit(alert, snap);
        void notify(
          `${dir} ${alert.displaySymbol} · ${alertKindLabel(alert.kind)}`,
          detail
        );
        // Server claims the alert first, so the cron and this tab never
        // both e-mail the same trigger.
        void fetch('/api/alerts/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert.id,
            displaySymbol: alert.displaySymbol,
            kindLabel: alertKindLabel(alert.kind),
            detail,
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
