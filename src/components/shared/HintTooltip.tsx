'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HintTooltipProps {
  content: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Show info icon next to children */
  withIcon?: boolean;
}

/** Generic educational hover tooltip for radar metrics & drawers */
export function HintTooltip({
  content,
  title,
  children,
  className,
  side = 'top',
  withIcon = false,
}: HintTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={180}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex max-w-full cursor-help items-center gap-1 text-left text-inherit',
              className
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label={title ?? 'Açıklama'}
          >
            {children}
            {withIcon ? (
              <Info className="size-3 shrink-0 text-zinc-500 opacity-70" />
            ) : null}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={6}
            className="z-[80] max-w-[260px] rounded-lg border border-zinc-700/90 bg-zinc-900/95 px-3 py-2 text-xs leading-relaxed text-zinc-200 shadow-xl backdrop-blur-xl"
          >
            {title ? (
              <p className="mb-1 font-semibold text-zinc-100">{title}</p>
            ) : null}
            {content}
            <Tooltip.Arrow className="fill-zinc-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
