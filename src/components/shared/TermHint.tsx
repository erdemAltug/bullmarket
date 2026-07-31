'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import { TERM_GLOSSARY, type TermKey } from '@/lib/glossary';
import { cn } from '@/lib/utils';

interface TermHintProps {
  term: TermKey;
  className?: string;
  label?: string;
}

export function TermHint({ term, className, label }: TermHintProps) {
  const g = TERM_GLOSSARY[term];
  if (!g) return null;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1 text-inherit',
              className
            )}
            aria-label={`${g.term} açıklaması`}
          >
            {label ?? g.term}
            <Info className="size-3 text-zinc-500" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            className="z-[60] max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-200 shadow-xl"
          >
            <p className="mb-1 font-semibold text-zinc-100">{g.term}</p>
            {g.short}
            <Tooltip.Arrow className="fill-zinc-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
