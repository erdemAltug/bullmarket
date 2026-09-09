import Link from 'next/link';
import {
  BIST_MATRIX_NAV,
  bistMatrixPath,
  type BistMatrixSlug,
} from '@/lib/seo/matrix';
import { cn } from '@/lib/utils';

type Props = {
  symbol: string;
  active: BistMatrixSlug;
};

export function SymbolMatrixNav({ symbol, active }: Props) {
  return (
    <nav
      aria-label="Analiz bölümleri"
      className="flex gap-1 overflow-x-auto pb-1"
    >
      {BIST_MATRIX_NAV.map((item) => {
        const href = bistMatrixPath(symbol, item.slug);
        const isActive = item.slug === active;
        return (
          <Link
            key={item.slug || 'root'}
            href={href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-[var(--accent)] text-[#042f2e]'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
