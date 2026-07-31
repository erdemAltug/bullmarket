'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addWatchlistSymbol,
  getUserWatchlist,
  migrateAnonymousWatchlist,
  removeWatchlistSymbol,
} from '@/actions/watchlist';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_WATCHLIST } from '@/hooks/useWatchlist.shared';
import { authClient } from '@/lib/auth/client';

export { DEFAULT_WATCHLIST } from '@/hooks/useWatchlist.shared';

const LS_KEY = 'bullmarket:watchlist';
const MIGRATED_KEY = 'bullmarket:watchlist-migrated';

export function useWatchlist(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? 'anon';
  const migratedRef = useRef(false);
  const [lsSymbols, setLsSymbols, lsReady] = useLocalStorage<string[]>(
    LS_KEY,
    DEFAULT_WATCHLIST
  );
  const [preferDb, setPreferDb] = useState(false);

  const query = useQuery({
    queryKey: ['watchlist', userId],
    queryFn: () => getUserWatchlist(),
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: false,
  });

  useEffect(() => {
    if (query.data?.db) setPreferDb(true);
  }, [query.data?.db]);

  // One-time migrate local → Neon (merge only — never wipe)
  useEffect(() => {
    if (!enabled || !query.data?.db || !lsReady || migratedRef.current) return;
    if (typeof window === 'undefined') return;

    const migKey = `${MIGRATED_KEY}:${userId}`;
    if (localStorage.getItem(migKey) || localStorage.getItem(MIGRATED_KEY)) {
      migratedRef.current = true;
      return;
    }

    migratedRef.current = true;
    localStorage.setItem(migKey, '1');
    localStorage.setItem(MIGRATED_KEY, '1');

    if (query.data.symbols.length > 0) return;

    const seed = lsSymbols.length ? lsSymbols : DEFAULT_WATCHLIST;
    void migrateAnonymousWatchlist(seed)
      .then((data) => {
        if (data.db) qc.setQueryData(['watchlist', userId], data);
      })
      .catch(() => {
        /* ignore race / duplicate */
      });
  }, [enabled, query.data, lsReady, lsSymbols, qc, userId]);

  const useDb = preferDb && Boolean(query.data?.db);
  const symbols = useDb ? (query.data?.symbols ?? []) : lsSymbols;
  const ready = !enabled ? true : useDb ? !query.isLoading : lsReady;

  const addMut = useMutation({
    mutationFn: (symbol: string) => addWatchlistSymbol(symbol),
    onSuccess: (data) => {
      if (data.db) {
        qc.setQueryData(['watchlist', userId], data);
        setPreferDb(true);
      }
    },
  });

  const removeMut = useMutation({
    mutationFn: (symbol: string) => removeWatchlistSymbol(symbol),
    onSuccess: (data) => {
      if (data.db) qc.setQueryData(['watchlist', userId], data);
    },
  });

  const addSymbol = useCallback(
    (symbol: string) => {
      const s = symbol.trim().toUpperCase();
      if (!s) return;
      if (useDb) {
        addMut.mutate(s);
        return;
      }
      setLsSymbols((prev) => (prev.includes(s) ? prev : [...prev, s]));
      addMut.mutate(s);
    },
    [useDb, addMut, setLsSymbols]
  );

  const removeSymbol = useCallback(
    (symbol: string) => {
      const s = symbol.toUpperCase();
      if (useDb) {
        removeMut.mutate(s);
        return;
      }
      setLsSymbols((prev) => prev.filter((x) => x !== s));
      removeMut.mutate(s);
    },
    [useDb, removeMut, setLsSymbols]
  );

  const hasSymbol = useCallback(
    (symbol: string) => symbols.includes(symbol.toUpperCase()),
    [symbols]
  );

  return {
    symbols,
    addSymbol,
    removeSymbol,
    hasSymbol,
    ready,
    source: useDb ? ('neon' as const) : ('local' as const),
  };
}
