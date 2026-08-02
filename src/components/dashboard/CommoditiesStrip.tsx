'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AlertModal } from '@/components/alerts/AlertModal';
import { useCommodities } from '@/hooks/useMarketScanner';
import { cn } from '@/lib/utils';

function formatCommodity(price: number, currency: 'TRY' | 'USD') {
  const prefix = currency === 'USD' ? '$' : '₺';
  if (price >= 1000) {
    return `${prefix}${price.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
  }
  if (price >= 100) {
    return `${prefix}${price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
  }
  return `${prefix}${price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}`;
}

/** Compact live strip: Gram Altın, gümüş, Brent, WTI, USDTRY — click = alarm */
export function CommoditiesStrip() {
  const { data, isLoading } = useCommodities();
  const [alertTarget, setAlertTarget] = useState<{
    symbol: string;
    displaySymbol: string;
    price: number;
    changePercent: number;
  } | null>(null);

  if (isLoading && !data.length) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
          />
        ))}
      </div>
    );
  }

  if (!data.length) return null;

  const preferred = ['ALTIN', 'GUMUS_GR', 'GUMUS', 'BRENT', 'WTI', 'USDTRY'];
  const items = preferred
    .map((s) => data.find((d) => d.symbol === s))
    .filter(Boolean)
    .concat(data.filter((d) => !preferred.includes(d.symbol)))
    .slice(0, 6) as typeof data;

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          Emtia &amp; Kıymetli Maden
        </h2>
        <span className="text-[10px] text-[var(--muted)]">Tıkla → alarm</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((c) => {
          const up = c.changePercent >= 0;
          return (
            <button
              key={c.symbol}
              type="button"
              onClick={() =>
                setAlertTarget({
                  symbol: c.symbol,
                  displaySymbol: c.name,
                  price: c.price,
                  changePercent: c.changePercent,
                })
              }
              className="group rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-left transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              <div className="flex items-start justify-between gap-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                  {c.name}
                </p>
                <Bell className="size-3 shrink-0 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-[var(--foreground)]">
                {formatCommodity(c.price, c.currency)}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-[11px] font-semibold tabular-nums',
                  up ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {up ? '+' : ''}
                {c.changePercent.toFixed(2)}%
              </p>
            </button>
          );
        })}
      </div>

      {alertTarget ? (
        <AlertModal
          open
          onOpenChange={(open) => {
            if (!open) setAlertTarget(null);
          }}
          symbol={alertTarget.symbol}
          displaySymbol={alertTarget.displaySymbol}
          currentPrice={alertTarget.price}
          changePercent={alertTarget.changePercent}
        />
      ) : null}
    </section>
  );
}
