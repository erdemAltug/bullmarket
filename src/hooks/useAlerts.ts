'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPriceAlert,
  deletePriceAlert,
  getUserAlerts,
  setAlertTriggered,
} from '@/actions/alerts';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AlertKind, PriceAlert } from '@/types';
import { authClient } from '@/lib/auth/client';

const LS_KEY = 'bullmarket:alerts';

export function useAlerts(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const qc = useQueryClient();
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

  const useDb = preferDb && query.data?.db;
  const alerts = useDb ? (query.data?.alerts ?? []) : lsAlerts;
  const ready = useDb ? !query.isLoading : lsReady;

  const addAlert = useCallback(
    (input: {
      symbol: string;
      displaySymbol: string;
      kind: AlertKind;
      threshold: number;
    }) => {
      const local: PriceAlert = {
        id: crypto.randomUUID(),
        ...input,
        triggered: false,
        createdAt: new Date().toISOString(),
      };

      if (!useDb) {
        setLsAlerts((prev) => [
          ...prev.filter(
            (a) => !(a.symbol === local.symbol && a.kind === local.kind)
          ),
          local,
        ]);
      }

      void createPriceAlert(input).then((data) => {
        if (data.db) {
          setPreferDb(true);
          qc.setQueryData(['alerts'], data);
        }
      });

      return local;
    },
    [useDb, setLsAlerts, qc]
  );

  const removeAlert = useCallback(
    (id: string) => {
      if (!useDb) setLsAlerts((prev) => prev.filter((a) => a.id !== id));
      void deletePriceAlert(id).then((data) => {
        if (data.db) qc.setQueryData(['alerts'], data);
      });
    },
    [useDb, setLsAlerts, qc]
  );

  const markTriggered = useCallback(
    (id: string) => {
      if (!useDb) {
        setLsAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, triggered: true } : a))
        );
      }
      void setAlertTriggered(id, true).then((data) => {
        if (data.db) qc.setQueryData(['alerts'], data);
      });
    },
    [useDb, setLsAlerts, qc]
  );

  const resetTriggered = useCallback(
    (id: string) => {
      if (!useDb) {
        setLsAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, triggered: false } : a))
        );
      }
      void setAlertTriggered(id, false).then((data) => {
        if (data.db) qc.setQueryData(['alerts'], data);
      });
    },
    [useDb, setLsAlerts, qc]
  );

  return {
    alerts,
    addAlert,
    removeAlert,
    markTriggered,
    resetTriggered,
    ready,
    source: useDb ? ('neon' as const) : ('local' as const),
  };
}
