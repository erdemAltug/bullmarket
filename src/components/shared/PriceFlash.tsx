'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Wraps a live number; when the value changes it briefly tints green or red,
 * so a moving market is felt without reading every digit.
 */
export function PriceFlash({
  value,
  children,
  className,
}: {
  value: number | null | undefined;
  children: React.ReactNode;
  className?: string;
}) {
  const prev = useRef(value);
  const [dir, setDir] = useState<'up' | 'down' | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const before = prev.current;
    prev.current = value;
    if (before == null || value == null || before === value) return;
    setDir(value > before ? 'up' : 'down');
    setTick((t) => t + 1);
  }, [value]);

  return (
    <span
      // A new key restarts the CSS animation on every change.
      key={tick}
      className={cn(
        'tabular-nums',
        dir === 'up' && 'price-flash-up',
        dir === 'down' && 'price-flash-down',
        className
      )}
    >
      {children}
    </span>
  );
}
