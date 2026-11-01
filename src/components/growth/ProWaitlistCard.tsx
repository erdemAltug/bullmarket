'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { ProCtaButton } from '@/components/pro/ProRequest';
import { FOUNDER_SEATS, PRO_PRICE, formatTl } from '@/lib/pro-plan';
import { cn } from '@/lib/utils';

const DONE_KEY = 'bullsye:pro-waitlist';

const noopSubscribe = () => () => {};
function readDone(): boolean {
  try {
    return localStorage.getItem(DONE_KEY) === '1';
  } catch {
    return false;
  }
}

const PERKS = [
  'Sınırsız ve daha hızlı alarm',
  'Skor geçmişi (90 gün)',
  'Kişisel sabah özeti ve portföy raporu',
];

/** Pro offer card — opens the early-access request (no payment yet). */
export function ProWaitlistCard({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const done = useSyncExternalStore(noopSubscribe, readDone, () => false);

  return (
    <section
      className={cn(
        'rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-[var(--card)] to-[var(--card)] p-4 sm:p-5',
        className
      )}
      aria-label="Bullsye Pro"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-emerald-400" /> Bullsye Pro
        </h2>
        <span className="text-xs text-[var(--muted)]">
          {formatTl(PRO_PRICE.monthly)}/ay · ilk {FOUNDER_SEATS} kişiye{' '}
          {formatTl(PRO_PRICE.founderMonthly)}
        </span>
      </div>
      <ul className="mt-3 grid gap-1.5 text-xs text-[var(--muted)] sm:grid-cols-3">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-1.5">
            <Check className="mt-0.5 size-3 shrink-0 text-emerald-400" />
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {done ? (
          <p className="text-sm text-emerald-300">
            Talebin alındı — davet e-postayla gelecek.
          </p>
        ) : (
          <ProCtaButton where={source} />
        )}
        <Link
          href="/pro"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Planları karşılaştır →
        </Link>
      </div>
    </section>
  );
}
