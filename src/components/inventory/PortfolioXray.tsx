import { cn } from '@/lib/utils';

type PortfolioXrayProps = {
  totalValue: number;
  equityPct: number;
  cashCushionPct: number;
  topSymbolSharePct: number;
  topSymbol?: string;
  className?: string;
};

/** İlk varlık sonrası Portföy Röntgeni. */
export function PortfolioXray({
  totalValue,
  equityPct,
  cashCushionPct,
  topSymbolSharePct,
  topSymbol,
  className,
}: PortfolioXrayProps) {
  const concentrated = topSymbolSharePct >= 50;

  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6',
        className
      )}
      aria-label="Portföy Röntgeni"
    >
      <h2 className="text-base font-semibold tracking-tight">Portföy Röntgeni</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Senin girdiğin sayılar — genel piyasa skoru değil
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-[var(--muted)]">Toplam büyüklük</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ₺
            {Math.round(totalValue).toLocaleString('tr-TR')}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)]">Nakit yastığı</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            %{cashCushionPct.toFixed(0)} nakit+mevduat
          </p>
          <p className="text-xs text-[var(--muted)]">
            %{equityPct.toFixed(0)} hisse/kripto
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)]">Çeşitlilik</p>
          <p
            className={cn(
              'mt-1 text-lg font-semibold',
              concentrated ? 'text-amber-300' : 'text-emerald-400'
            )}
          >
            {concentrated ? 'Yoğun' : 'Dengeli'}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className="h-full bg-emerald-500/80"
          style={{ width: `${Math.min(100, equityPct)}%` }}
        />
      </div>

      {concentrated && topSymbol ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
          Portföyünün %{topSymbolSharePct.toFixed(0)}’i {topSymbol} üzerinde
          yoğunlaşmış. Uyarıdır; dağıtım tavsiyesi değildir.
        </p>
      ) : null}
    </section>
  );
}
