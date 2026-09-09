import Link from 'next/link';
import { ShareScorecardButton } from '@/components/seo/ShareScorecardButton';
import { StickyInventoryWidget } from '@/components/seo/StickyInventoryWidget';
import { SymbolMatrixNav } from '@/components/seo/SymbolMatrixNav';
import { SymbolSocialProof } from '@/components/seo/SymbolSocialProof';
import type { BistMatrixSlug } from '@/lib/seo/matrix';

type Props = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  active: BistMatrixSlug;
  path: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  scoreHint?: string;
};

export function BistMatrixShell({
  symbol,
  name,
  price,
  changePercent,
  active,
  path,
  title,
  subtitle,
  children,
  scoreHint,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
      <article className="space-y-5">
        <SymbolMatrixNav symbol={symbol} active={active} />
        <SymbolSocialProof symbol={symbol} />
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p>
          {price > 0 ? (
            <p className="text-lg font-semibold tabular-nums">
              ₺{price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}{' '}
              <span
                className={
                  changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }
              >
                ({changePercent >= 0 ? '+' : ''}
                {changePercent.toFixed(2)}%)
              </span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <ShareScorecardButton
              symbol={symbol}
              path={path}
              scoreHint={scoreHint}
            />
            <Link
              href={`/bist/${symbol}`}
              className="inline-flex items-center rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium hover:bg-[var(--surface)]"
            >
              Ana karne
            </Link>
          </div>
        </header>
        {children}
      </article>
      <StickyInventoryWidget symbol={symbol} name={name} price={price} />
    </div>
  );
}
