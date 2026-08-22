'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CTA_CLASS =
  'inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#042f2e] shadow-[0_0_28px_rgba(20,184,166,0.28)] transition hover:brightness-110';

export function TerminalCtaButton({
  children = 'Canlı Terminale Geç',
  className,
  compact = false,
}: {
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const cls = cn(compact ? className : CTA_CLASS, className);

  return (
    <Link href="/terminal" prefetch className={cls}>
      {children}
      {!compact ? <ArrowRight className="size-4" /> : null}
    </Link>
  );
}
