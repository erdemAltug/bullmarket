'use client';

import { ChevronDown } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  /** Stable id for localStorage persistence */
  id: string;
  title: string;
  subtitle?: string;
  /** Extra controls on the right (links, badges) — always visible */
  actions?: React.ReactNode;
  /** Shown next to title when collapsed */
  collapsedHint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ExpandableSection({
  id,
  title,
  subtitle,
  actions,
  collapsedHint,
  defaultOpen = true,
  children,
  className,
}: ExpandableSectionProps) {
  const [open, setOpen] = useLocalStorage(
    `bullmarket:section-open:${id}`,
    defaultOpen
  );

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            'group flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left',
            'transition-colors active:bg-[var(--surface)]/50',
            '-mx-1 px-1 py-1.5'
          )}
        >
          <ChevronDown
            className={cn(
              'mt-0.5 size-5 shrink-0 text-[var(--muted)] transition-transform duration-200 sm:mt-1 sm:size-4',
              !open && '-rotate-90'
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
                {title}
              </span>
              {!open && collapsedHint ? (
                <span className="text-[11px] font-medium text-[var(--muted)] sm:text-xs">
                  {collapsedHint}
                </span>
              ) : null}
            </span>
            {open && subtitle ? (
              <span className="mt-0.5 block text-[11px] leading-snug text-[var(--muted)] sm:text-xs">
                {subtitle}
              </span>
            ) : null}
          </span>
        </button>
        {actions ? (
          <div className="mt-1.5 shrink-0">{actions}</div>
        ) : null}
      </div>

      {open ? <div className="min-w-0">{children}</div> : null}
    </section>
  );
}
