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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            'group flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left',
            'transition-colors hover:bg-[var(--surface)]/40',
            '-mx-1 px-1 py-1'
          )}
        >
          <ChevronDown
            className={cn(
              'mt-1 size-4 shrink-0 text-[var(--muted)] transition-transform duration-200',
              'group-hover:text-[var(--foreground)]',
              !open && '-rotate-90'
            )}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {title}
              </span>
              {!open && collapsedHint ? (
                <span className="text-xs font-medium text-[var(--muted)]">
                  {collapsedHint}
                </span>
              ) : null}
            </span>
            {open && subtitle ? (
              <span className="mt-0.5 block text-xs text-[var(--muted)]">
                {subtitle}
              </span>
            ) : null}
          </span>
        </button>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
            {actions}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">{open ? children : null}</div>
      </div>
    </section>
  );
}
