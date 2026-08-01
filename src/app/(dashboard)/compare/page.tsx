'use client';

import { Suspense, useMemo, useState } from 'react';
import { GitCompare, Swords } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { AssetCompareMatrix } from '@/components/dashboard/AssetCompareMatrix';
import { useCompare } from '@/hooks/useIntelligence';
import { SEARCH_CATALOG } from '@/lib/search-catalog';
import { cn } from '@/lib/utils';

const EXTRA = [
  { symbol: 'PGSUS.IS', label: 'PGSUS' },
  { symbol: 'AKBNK.IS', label: 'AKBNK' },
  { symbol: 'YKBNK.IS', label: 'YKBNK' },
  { symbol: 'TUPRS.IS', label: 'TUPRS' },
  { symbol: 'VOO', label: 'VOO' },
  { symbol: 'QQQ', label: 'QQQ' },
  { symbol: 'SCHD', label: 'SCHD' },
  { symbol: 'TEFAS:AFT', label: 'AFT' },
  { symbol: 'TEFAS:YAY', label: 'YAY' },
];

const BASE_PICKS = [
  ...SEARCH_CATALOG.filter(
    (i) => i.kind === 'bist' || i.kind === 'crypto' || i.kind === 'fon'
  ).map((i) => {
      const m = i.href.match(/\/(?:bist|crypto|fon)\/([^/?]+)/);
      const raw = m ? decodeURIComponent(m[1]) : i.id;
      if (i.kind === 'crypto') {
        const symbol = raw.endsWith('USDT') ? raw : `${raw}USDT`;
        return { symbol, label: i.label.split('·')[0].trim() };
      }
      if (i.kind === 'fon') {
        const isEtf = ['VOO', 'QQQ', 'SPY', 'SCHD', 'ARKK', 'VTI', 'IWM', 'GLD'].includes(
          raw.toUpperCase()
        );
        return {
          symbol: isEtf ? raw.toUpperCase() : `TEFAS:${raw.toUpperCase()}`,
          label: i.label.split('·')[0].trim(),
        };
      }
      const symbol = raw.includes('.') ? raw : `${raw}.IS`;
      return {
        symbol,
        label: i.label.split('·')[0].trim(),
      };
    }),
  ...EXTRA,
];

function normalizeParam(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  const u = raw.trim().toUpperCase();
  if (!u) return fallback;
  if (u.startsWith('TEFAS:')) return u;
  if (u.endsWith('USDT') || u.endsWith('.IS')) return u;
  if (['BTC', 'ETH', 'SOL', 'BNB'].includes(u)) return `${u}USDT`;
  if (
    ['VOO', 'QQQ', 'SPY', 'SCHD', 'ARKK', 'VTI', 'IWM', 'EEM', 'GLD', 'QQQM', 'VIG', 'JEPI'].includes(
      u
    )
  ) {
    return u;
  }
  if (
    ['AFT', 'YAY', 'TTE', 'TI2', 'MAC', 'IIH', 'OJK', 'GUM', 'BIO', 'CPU', 'TCD', 'NNF', 'ST1', 'IPB', 'AK2', 'PPN'].includes(
      u
    )
  ) {
    return `TEFAS:${u}`;
  }
  return `${u}.IS`;
}

function CompareInner() {
  const params = useSearchParams();
  const [assetA, setAssetA] = useState(() =>
    normalizeParam(params.get('a'), 'THYAO.IS')
  );
  const [assetB, setAssetB] = useState(() =>
    normalizeParam(params.get('b'), 'PGSUS.IS')
  );

  const picks = useMemo(() => {
    const map = new Map(BASE_PICKS.map((p) => [p.symbol, p]));
    for (const sym of [assetA, assetB]) {
      if (!map.has(sym)) {
        map.set(sym, {
          symbol: sym,
          label: sym.replace('.IS', '').replace('USDT', ''),
        });
      }
    }
    return [...map.values()];
  }, [assetA, assetB]);

  const { data, isFetching, error } = useCompare([assetA, assetB]);
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Swords className="size-6 text-emerald-400" />
          1v1 Varlık Kıyaslama
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          İki hisse veya kriptoyu çarpan, büyüme ve teknik metriklerle kafa kafaya
          karşılaştırın
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
        <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-1.5 block text-[11px] uppercase tracking-wide text-[var(--muted)]">
              Varlık A
            </span>
            <select
              value={assetA}
              onChange={(e) => setAssetA(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500/50"
            >
              {picks
                .filter((p) => p.symbol !== assetB)
                .map((p) => (
                  <option key={p.symbol} value={p.symbol}>
                    {p.label}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex items-center justify-center pb-2 text-[var(--muted)]">
            <GitCompare className="size-5" />
          </div>
          <label className="block flex-1">
            <span className="mb-1.5 block text-[11px] uppercase tracking-wide text-[var(--muted)]">
              Varlık B
            </span>
            <select
              value={assetB}
              onChange={(e) => setAssetB(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500/50"
            >
              {picks
                .filter((p) => p.symbol !== assetA)
                .map((p) => (
                  <option key={p.symbol} value={p.symbol}>
                    {p.label}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {picks.slice(0, 14).map((p) => (
            <button
              key={p.symbol}
              type="button"
              onClick={() => {
                if (p.symbol === assetA || p.symbol === assetB) return;
                setAssetB(p.symbol);
              }}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                p.symbol === assetA || p.symbol === assetB
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isFetching && !items.length ? (
          <p className="text-sm text-[var(--muted)]">Kıyaslanıyor…</p>
        ) : error ? (
          <p className="text-sm text-rose-400">{error.message}</p>
        ) : (
          <AssetCompareMatrix items={items} />
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--muted)]">Kıyaslama yükleniyor…</p>
      }
    >
      <CompareInner />
    </Suspense>
  );
}
