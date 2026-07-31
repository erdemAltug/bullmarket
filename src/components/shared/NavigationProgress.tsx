'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Thin top progress bar on route change. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const hide = window.setTimeout(() => setVisible(false), 320);
    return () => window.clearTimeout(hide);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden"
      aria-hidden
    >
      <div className="animate-nav-pulse h-full w-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400" />
    </div>
  );
}

/**
 * Full-prefetch Link — warms App Router client cache so tab switches
 * reuse the cached page payload (cat-cat-cat).
 */
export function FastLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} prefetch={true} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
