'use client';

import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { projectWealth } from '@/lib/ai-opportunity';
import { cn, formatPrice } from '@/lib/utils';

interface WealthSimulatorProps {
  /** Live portfolio value as default principal */
  defaultPrincipal?: number;
  /** Suggested annual return % from AI avg upside */
  suggestedReturnPct?: number;
  title?: string;
}

export function WealthSimulator({
  defaultPrincipal = 100_000,
  suggestedReturnPct = 10,
  title = '3 Yıllık Servet Simülatörü',
}: WealthSimulatorProps) {
  const [principal, setPrincipal] = useState(String(Math.round(defaultPrincipal) || 100000));
  const [annualReturn, setAnnualReturn] = useState(
    String(Math.round(suggestedReturnPct * 10) / 10)
  );
  const [monthly, setMonthly] = useState('2000');
  const [drip, setDrip] = useState(true);

  const projection = useMemo(() => {
    const p = Number(principal.replace(',', '.')) || 0;
    const r = Number(annualReturn.replace(',', '.')) || 0;
    const m = drip ? Number(monthly.replace(',', '.')) || 0 : 0;
    return projectWealth({
      principal: p,
      annualReturnPct: r,
      monthlyContribution: m,
      years: 3,
    });
  }, [principal, annualReturn, monthly, drip]);

  const maxBar = Math.max(...projection.years.map((y) => y.value), 1);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="size-4 text-emerald-400" />
            {title}
          </h2>
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            Varsayımsal bileşik getiri simülasyonu — tahmin / tavsiye değildir
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <input
            type="checkbox"
            checked={drip}
            onChange={(e) => setDrip(e.target.checked)}
            className="accent-emerald-500"
          />
          Aylık katkı / DRIP
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-[var(--muted)]">
          Başlangıç (₺)
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-emerald-500/50"
          />
        </label>
        <label className="text-xs text-[var(--muted)]">
          Yıllık beklenen getiri (%)
          <input
            type="number"
            step="0.1"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
        <label
          className={cn(
            'text-xs text-[var(--muted)]',
            !drip && 'opacity-40'
          )}
        >
          Aylık katkı (₺)
          <input
            type="number"
            disabled={!drip}
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-emerald-500/50 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-[10px] uppercase text-emerald-400/80">3 yıl sonra</p>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-300">
            {formatPrice(projection.finalValue, 'TRY')}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3 text-center">
          <p className="text-[10px] uppercase text-[var(--muted)]">Toplam katkı</p>
          <p className="mt-1 font-mono text-lg font-semibold">
            {formatPrice(projection.totalContributed, 'TRY')}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3 text-center">
          <p className="text-[10px] uppercase text-[var(--muted)]">Tahmini kazanç</p>
          <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
            {formatPrice(projection.totalGain, 'TRY')}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {projection.years.map((y) => (
          <div key={y.year} className="flex items-center gap-3 text-xs">
            <span className="w-12 shrink-0 text-[var(--muted)]">Yıl {y.year}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400"
                style={{ width: `${(y.value / maxBar) * 100}%` }}
              />
            </div>
            <span className="w-28 shrink-0 text-right font-mono font-medium">
              {formatPrice(y.value, 'TRY')}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
        Simülasyon eğitim amaçlıdır; geçmiş/canlı getiri garantisi değildir. DRIP
        açıkken aylık katkılar her ay bileşik büyümeye eklenir.
      </p>
    </section>
  );
}
