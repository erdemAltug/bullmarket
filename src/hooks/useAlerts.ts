'use client';

import { usePlan } from '@/hooks/usePlan';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPriceAlert,
  deletePriceAlert,
  getUserAlerts,
  setAlertTriggered,
  updatePriceAlert,
  type AlertsResult,
} from '@/actions/alerts';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AlertKind, PriceAlert } from '@/types';
import { trackEvent } from '@/lib/analytics';
import { authClient } from '@/lib/auth/client';

const LS_KEY = 'bullmarket:alerts';

function mergeAlert(list: PriceAlert[], next: PriceAlert): PriceAlert[] {
  return [
    ...list.filter((a) => !(a.symbol === next.symbol && a.kind === next.kind)),
    next,
  ];
}

export function useAlerts(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const qc = useQueryClient();
  const { limits } = usePlan();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? 'anon';
  const [lsAlerts, setLsAlerts, lsReady] = useLocalStorage<PriceAlert[]>(
    LS_KEY,
    []
  );
  const [preferDb, setPreferDb] = useState(false);

  const query = useQuery({
    queryKey: ['alerts', userId],
    queryFn: () => getUserAlerts(),
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: false,
  });

  useEffect(() => {
    if (query.data?.db) setPreferDb(true);
  }, [query.data?.db]);

  const useDb = preferDb && Boolean(query.data?.db);
  const alerts = useDb ? (query.data?.alerts ?? []) : lsAlerts;
  const ready = useDb ? !query.isLoading : lsReady;

  const writeDbCache = useCallback(
    (data: AlertsResult) => {
      setPreferDb(true);
      qc.setQueryData(['alerts', userId], data);
    },
    [qc, userId]
  );

  const addAlert = useCallback(
    (input: {
      symbol: string;
      displaySymbol: string;
      kind: AlertKind;
      threshold: number;
    }) => {
      const activeOthers = alerts.filter(
        (a) => !a.triggered && !(a.symbol === input.symbol && a.kind === input.kind)
      ).length;
      if (activeOthers >= limits.activeAlerts) {
        trackEvent('alert_limit_hit', { symbol: input.displaySymbol });
        return null;
      }
      const local: PriceAlert = {
        id: crypto.randomUUID(),
        ...input,
        triggered: false,
        createdAt: new Date().toISOString(),
      };
      trackEvent('alert_create', {
        kind: input.kind,
        symbol: input.displaySymbol,
        storage: useDb ? 'account' : 'local',
      });

      if (useDb) {
        qc.setQueryData(['alerts', userId], (old: AlertsResult | undefined) => ({
          db: true,
          alerts: mergeAlert(old?.alerts ?? [], local),
        }));
      } else {
        setLsAlerts((prev) => mergeAlert(prev, local));
      }

      void createPriceAlert(input)
        .then((data) => {
          if (data.db) {
            writeDbCache(data);
          } else {
            setPreferDb(false);
            setLsAlerts((prev) => mergeAlert(prev, local));
          }
        })
        .catch(() => {
          setPreferDb(false);
          setLsAlerts((prev) => mergeAlert(prev, local));
        });

      return local;
    },
    [alerts, limits.activeAlerts, useDb, setLsAlerts, qc, userId, writeDbCache]
  );

  const removeAlert = useCallback(
    (id: string) => {
      if (useDb) {
        qc.setQueryData(['alerts', userId], (old: AlertsResult | undefined) => ({
          db: true,
          alerts: (old?.alerts ?? []).filter((a) => a.id !== id),
        }));
      } else {
        setLsAlerts((prev) => prev.filter((a) => a.id !== id));
      }
      void deletePriceAlert(id).then((data) => {
        if (data.db) writeDbCache(data);
      });
    },
    [useDb, setLsAlerts, qc, userId, writeDbCache]
  );

  const markTriggered = useCallback(
    (id: string) => {
      if (useDb) {
        qc.setQueryData(['alerts', userId], (old: AlertsResult | undefined) => ({
          db: true,
          alerts: (old?.alerts ?? []).map((a) =>
            a.id === id ? { ...a, triggered: true } : a
          ),
        }));
      } else {
        setLsAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, triggered: true } : a))
        );
      }
      void setAlertTriggered(id, true).then((data) => {
        if (data.db) writeDbCache(data);
      });
    },
    [useDb, setLsAlerts, qc, userId, writeDbCache]
  );

  const resetTriggered = useCallback(
    (id: string) => {
      if (useDb) {
        qc.setQueryData(['alerts', userId], (old: AlertsResult | undefined) => ({
          db: true,
          alerts: (old?.alerts ?? []).map((a) =>
            a.id === id ? { ...a, triggered: false } : a
          ),
        }));
      } else {
        setLsAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, triggered: false } : a))
        );
      }
      void setAlertTriggered(id, false).then((data) => {
        if (data.db) writeDbCache(data);
      });
    },
    [useDb, setLsAlerts, qc, userId, writeDbCache]
  );

  const updateAlert = useCallback(
    (
      id: string,
      input: { kind: AlertKind; threshold: number; displaySymbol?: string }
    ) => {
      if (useDb) {
        qc.setQueryData(['alerts', userId], (old: AlertsResult | undefined) => ({
          db: true,
          alerts: (old?.alerts ?? []).map((a) =>
            a.id === id
              ? {
                  ...a,
                  kind: input.kind,
                  threshold: input.threshold,
                  displaySymbol: input.displaySymbol ?? a.displaySymbol,
                  triggered: false,
                }
              : a
          ),
        }));
      } else {
        setLsAlerts((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  kind: input.kind,
                  threshold: input.threshold,
                  displaySymbol: input.displaySymbol ?? a.displaySymbol,
                  triggered: false,
                }
              : a
          )
        );
      }

      void updatePriceAlert(id, input)
        .then((data) => {
          if (data.db) writeDbCache(data);
        })
        .catch(() => {
          /* optimistic already applied locally / db path */
        });
    },
    [useDb, setLsAlerts, qc, userId, writeDbCache]
  );

  const activeCount = alerts.filter((a) => !a.triggered).length;

  return {
    alerts,
    activeCount,
    alertLimit: limits.activeAlerts,
    addAlert,
    updateAlert,
    removeAlert,
    markTriggered,
    resetTriggered,
    ready,
    source: useDb ? ('neon' as const) : ('local' as const),
  };
}
