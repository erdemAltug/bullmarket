import type { StockFundamentals } from '@/types';
import { formatCompact } from '@/lib/utils';

function cell(
  label: string,
  value: string | null,
  hint?: string
) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-bold tabular-nums text-[var(--foreground)]">
        {value ?? '—'}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[10px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

function fmtNum(n: number | null | undefined, digits = 2) {
  if (n == null || !Number.isFinite(n)) return null;
  return n.toLocaleString('tr-TR', { maximumFractionDigits: digits });
}

function fmtPct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return null;
  const pct = Math.abs(n) <= 1.5 ? n * 100 : n;
  return `%${pct.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
}

interface AssetFundamentalsStripProps {
  data: StockFundamentals;
  currencySymbol?: string;
}

/** Compact multiples / range strip for stock detail pages */
export function AssetFundamentalsStrip({
  data,
  currencySymbol = '₺',
}: AssetFundamentalsStripProps) {
  const range =
    data.fiftyTwoWeekLow != null && data.fiftyTwoWeekHigh != null
      ? `${currencySymbol}${fmtNum(data.fiftyTwoWeekLow)} – ${currencySymbol}${fmtNum(data.fiftyTwoWeekHigh)}`
      : null;

  const posInRange =
    data.fiftyTwoWeekLow != null &&
    data.fiftyTwoWeekHigh != null &&
    data.fiftyTwoWeekHigh > data.fiftyTwoWeekLow
      ? Math.min(
          100,
          Math.max(
            0,
            ((data.price - data.fiftyTwoWeekLow) /
              (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow)) *
              100
          )
        )
      : null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          Çarpanlar &amp; aralık
        </h2>
        {posInRange != null ? (
          <p className="text-[10px] text-[var(--muted)]">
            52h aralıkta %{posInRange.toFixed(0)}
          </p>
        ) : null}
      </div>
      {posInRange != null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${posInRange}%` }}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {cell('F/K', fmtNum(data.trailingPE))}
        {cell('PD/DD', fmtNum(data.priceToBook))}
        {cell(
          'Piyasa değeri',
          data.marketCap != null ? formatCompact(data.marketCap) : null
        )}
        {cell('Beta', fmtNum(data.beta))}
        {cell('Temettü verimi', fmtPct(data.dividendYield))}
        {cell('Yıllık getiri', fmtPct(data.yearReturn))}
        {cell('52h aralık', range)}
        {cell('ROE', fmtPct(data.returnOnEquity))}
        {cell(
          'Hedef ort.',
          data.analyst?.targetMean != null
            ? `${currencySymbol}${fmtNum(data.analyst.targetMean)}`
            : null
        )}
      </div>
    </section>
  );
}
