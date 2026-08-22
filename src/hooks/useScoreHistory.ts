'use client';

import { useEffect, useState } from 'react';

const KEY = 'bullsye:score-hist:v1';

type DayPoint = { d: string; v: number };
type Store = Record<string, DayPoint[]>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export function useScoreHistory(
  rows: { symbol: string; score: number }[]
): Record<string, number[]> {
  const [hist, setHist] = useState<Record<string, number[]>>({});
  const sig = rows.map((r) => `${r.symbol}:${r.score}`).join('|');

  useEffect(() => {
    if (!sig) return;
    const parsed = sig.split('|').map((p) => {
      const [symbol, score] = p.split(':');
      return { symbol, score: Number(score) };
    });
    const day = today();
    const store = read();
    for (const row of parsed) {
      if (!row.symbol) continue;
      const prev = store[row.symbol] ?? [];
      const withoutToday = prev.filter((x) => x.d !== day);
      store[row.symbol] = [...withoutToday, { d: day, v: row.score }].slice(
        -7
      );
    }
    write(store);
    const next: Record<string, number[]> = {};
    for (const row of parsed) {
      if (!row.symbol) continue;
      next[row.symbol] = (store[row.symbol] ?? []).map((x) => x.v);
    }
    setHist(next);
  }, [sig]);

  return hist;
}
