'use client';

import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PortfolioHealthCheck } from '@/components/dashboard/PortfolioHealthCheck';
import { RiskRewardCalculator } from '@/components/dashboard/RiskRewardCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBist, useCrypto, useFx } from '@/hooks/useMarketData';
import {
  costBasisTry,
  livePriceTry,
  usePortfolio,
} from '@/hooks/usePortfolio';
import { analyzePortfolioHealth } from '@/lib/portfolio-health';
import type { AssetClass } from '@/types';
import { formatPercent, formatPrice } from '@/lib/utils';

const COLORS = {
  bist: '#22c55e',
  crypto: '#38bdf8',
  gold: '#eab308',
};

export default function PortfolioPage() {
  const { positions, addPosition, removePosition } = usePortfolio();
  const bist = useBist();
  const crypto = useCrypto();
  const fx = useFx();

  const [symbol, setSymbol] = useState('THYAO.IS');
  const [name, setName] = useState('THYAO');
  const [assetClass, setAssetClass] = useState<AssetClass>('bist');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const usdTry = fx.data?.rates.find((r) => r.code === 'USD')?.forexSelling ?? 0;
  const goldTry =
    fx.data?.rates.find((r) => r.code === 'GOLD')?.forexSelling ?? 0;

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of bist.data?.quotes ?? []) map[q.symbol] = q.price;
    for (const t of crypto.data?.tickers ?? []) map[t.symbol] = t.price;
    if (goldTry) map.GOLD = goldTry;
    return map;
  }, [bist.data?.quotes, crypto.data?.tickers, goldTry]);

  const changeMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of bist.data?.quotes ?? []) map[q.symbol] = q.changePercent;
    for (const t of crypto.data?.tickers ?? []) map[t.symbol] = t.changePercent;
    return map;
  }, [bist.data?.quotes, crypto.data?.tickers]);

  const metrics = useMemo(() => {
    let value = 0;
    let cost = 0;
    let daily = 0;
    const alloc = { bist: 0, crypto: 0, gold: 0 };
    const liveValues: Record<string, number> = {};
    const costValues: Record<string, number> = {};

    for (const p of positions) {
      const live = livePriceTry(p, priceMap, usdTry);
      const basis = costBasisTry(p, usdTry);
      value += live;
      cost += basis;
      alloc[p.assetClass] += live;
      liveValues[p.id] = live;
      costValues[p.id] = basis;
      const ch = changeMap[p.symbol] ?? 0;
      daily += live * (ch / 100);
    }

    const pnl = value - cost;
    const pnlPct = cost ? (pnl / cost) * 100 : 0;
    const health = analyzePortfolioHealth(
      positions,
      liveValues,
      costValues,
      value
    );

    return { value, cost, pnl, pnlPct, daily, alloc, health };
  }, [positions, priceMap, usdTry, changeMap]);

  const pieData = [
    { name: 'BİST', value: metrics.alloc.bist, color: COLORS.bist },
    { name: 'Kripto', value: metrics.alloc.crypto, color: COLORS.crypto },
    { name: 'Altın', value: metrics.alloc.gold, color: COLORS.gold },
  ].filter((d) => d.value > 0);

  const entryPreview = Number(buyPrice.replace(',', '.'));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bp = Number(buyPrice.replace(',', '.'));
    const qty = Number(quantity.replace(',', '.'));
    if (!Number.isFinite(bp) || !Number.isFinite(qty) || qty <= 0) return;

    addPosition({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol,
      assetClass,
      buyPrice: bp,
      quantity: qty,
      date,
      currency: assetClass === 'crypto' ? 'USD' : 'TRY',
    });
    setBuyPrice('');
    setQuantity('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portföyüm</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pozisyonlar, getiri ve portföy sağlığı
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard title="Toplam Değer" value={metrics.value} currency="TRY" />
        <MetricCard
          title="Toplam K/Z"
          value={metrics.pnl}
          changePercent={metrics.pnlPct}
          currency="TRY"
          subtitle={formatPercent(metrics.pnlPct)}
        />
        <MetricCard
          title="Günlük K/Z"
          value={metrics.daily}
          changePercent={
            metrics.value ? (metrics.daily / metrics.value) * 100 : 0
          }
          currency="TRY"
        />
        <Card>
          <CardHeader>
            <CardTitle>Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length ? (
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={58}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatPrice(Number(v), 'TRY')}
                      contentStyle={{
                        background: '#18181b',
                        borderColor: '#27272a',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-zinc-500">
                Pozisyon ekle
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-zinc-400">
              {pieData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <PortfolioHealthCheck report={metrics.health} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pozisyon ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-400">
                Sembol
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-xs text-zinc-400">
                İsim
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-400">
                Sınıf
                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
                >
                  <option value="bist">BİST</option>
                  <option value="crypto">Kripto</option>
                  <option value="gold">Altın</option>
                </select>
              </label>
              <label className="text-xs text-zinc-400">
                Alış fiyatı
                <input
                  type="number"
                  step="any"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-xs text-zinc-400">
                Adet
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-xs text-zinc-400">
                Tarih
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
                />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit">Ekle</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <RiskRewardCalculator
          entryPrice={Number.isFinite(entryPreview) ? entryPreview : undefined}
          currencySymbol={assetClass === 'crypto' ? '$' : '₺'}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Sembol</th>
              <th className="px-4 py-3">Sınıf</th>
              <th className="px-4 py-3 text-right">Adet</th>
              <th className="px-4 py-3 text-right">Alış</th>
              <th className="px-4 py-3 text-right">Canlı</th>
              <th className="px-4 py-3 text-right">K/Z</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const live = livePriceTry(p, priceMap, usdTry);
              const cost = costBasisTry(p, usdTry);
              const pnl = live - cost;
              const unit = priceMap[p.symbol] ?? p.buyPrice;
              return (
                <tr
                  key={p.id}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{p.symbol}</td>
                  <td className="px-4 py-3 capitalize text-zinc-400">
                    {p.assetClass}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.quantity}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.buyPrice.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {unit.toLocaleString('tr-TR')}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {formatPrice(pnl, 'TRY')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removePosition(p.id)}
                      className="rounded p-1 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!positions.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Henüz pozisyon yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
