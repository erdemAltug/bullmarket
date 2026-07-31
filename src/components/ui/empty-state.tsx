'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-12 text-center',
        className
      )}
    >
      <div className="rounded-full border border-zinc-800 bg-zinc-900/80 p-3">
        <Icon className="size-5 text-zinc-500" />
      </div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {description ? (
        <p className="max-w-xs text-xs text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}
