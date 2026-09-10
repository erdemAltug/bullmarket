'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalysisModuleFooter } from '@/components/analysis/AnalysisModuleFooter';
import type { SymbolAnalysisBundle } from '@/lib/analysis/types';

type Props = { data: SymbolAnalysisBundle };

function simulateDrip(
  monthlyTry: number,
  years: number,
  yieldPct: number,
  priceStart: number,
  priceCagr = 0.12
) {
  let shares = 0;
  let cashDiv = 0;
  let price = priceStart;
  const months = years * 12;
  const monthlyYield = yieldPct / 100 / 12;
  for (let m = 0; m < months; m++) {
    shares += monthlyTry / Math.max(price, 0.01);
    const div = shares * price * monthlyYield;
    cashDiv += div;
    shares += div / Math.max(price, 0.01);
    price *= Math.pow(1 + priceCagr, 1 / 12);
  }
  return {
    portfolioTry: shares * price,
    shares,
    invested: monthlyTry * months,
    dividendsReinvested: cashDiv,
  };
}

export function DividendSimModule({ data }: Props) {
  const [monthly, setMonthly] = useState(5000);
  const y = data.dividend.trailingYieldPct ?? 0;
  const sim = useMemo(
    () => simulateDrip(monthly, 5, y, data.price || 1),
    [monthly, y, data.price]
  );

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold">Temettü & DRIP</h3>

      <div className="mt-3 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.dividend.years}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} width={32} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, name) => [
                name === 'yieldPct'
                  ? `%${Number(v).toFixed(2)}`
                  : `₺${Number(v).toFixed(2)}`,
                name === 'yieldPct' ? 'Verim' : 'Hisse başı',
              ]}
            />
            <Bar dataKey="yieldPct" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-4 block text-xs text-[var(--muted)]">
        Ayda ₺{monthly.toLocaleString('tr-TR')} alıp temettüyü DRIP etsem…
        <input
          type="range"
          min={500}
          max={20000}
          step={500}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </label>

      <div className="mt-3 rounded-xl bg-[var(--surface)] p-3 text-sm">
        <p className="font-medium text-[var(--foreground)]">
          5 yılda ~₺
          {Math.round(sim.portfolioTry).toLocaleString('tr-TR')}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Yatırılan ₺{sim.invested.toLocaleString('tr-TR')} · yeniden yatırılan
          temettü ~₺
          {Math.round(sim.dividendsReinvested).toLocaleString('tr-TR')} · verim
          %{y.toFixed(2)}
        </p>
      </div>

      <AnalysisModuleFooter
        symbol={data.symbol}
        displaySymbol={data.displaySymbol}
        name={data.name}
        price={data.price}
      />
    </article>
  );
}
