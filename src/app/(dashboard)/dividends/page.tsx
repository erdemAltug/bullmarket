'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TermHint } from '@/components/shared/TermHint';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { ApiResponse, DividendEvent } from '@/types';
import { formatPrice } from '@/lib/utils';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export default function DividendsPage() {
  const { positions } = usePortfolio();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dividends'],
    queryFn: () =>
      getJson<{ events: DividendEvent[] }>('/api/dividends'),
    staleTime: 600_000,
  });

  const events = data?.events ?? [];

  const estimated = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      if (p.assetClass !== 'bist') continue;
      const ev = events.find((e) => e.symbol === p.symbol);
      if (ev) total += ev.netPerShare * p.quantity;
    }
    return total;
  }, [positions, events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Temettü / Pasif Gelir
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Yaklaşan ödemeler ve tahmini gelir
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          title="Tahmini Yıllık Temettü Geliri"
          value={estimated}
          currency="TRY"
          subtitle="Portföydeki eşleşen hisseler"
        />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          <TermHint term="yield" label="Temettü Verimi" />:{' '}
          Yıllık temettünün fiyata oranıdır. Takvim tarihleri bilgilendirme
          amaçlıdır; KAP duyurusunu doğrulayın.
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Hisse</th>
              <th className="px-4 py-3">Ex-Date</th>
              <th className="px-4 py-3">Ödeme</th>
              <th className="px-4 py-3 text-right">Net TL / Hisse</th>
              <th className="px-4 py-3 text-right">
                <TermHint term="yield" />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Yükleniyor…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-400">
                  {error.message}
                </td>
              </tr>
            ) : (
              events.map((e) => {
                const inPortfolio = positions.some((p) => p.symbol === e.symbol);
                return (
                  <tr
                    key={e.symbol}
                    className="border-b border-zinc-800/80 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium">
                        {e.symbol.replace('.IS', '')}
                      </span>
                      <span className="ml-2 text-xs text-zinc-500">
                        {e.name}
                      </span>
                      {inPortfolio ? (
                        <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400">
                          Portföyde
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-400">
                      {e.exDate}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-400">
                      {e.payDate}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(e.netPerShare, 'TRY')}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-400">
                      %{e.yieldPct.toFixed(1)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
