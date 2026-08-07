'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)]"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-[var(--muted)] transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen ? (
              <div className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--muted)]">
                {item.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
