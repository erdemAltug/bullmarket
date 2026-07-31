'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Bitcoin,
  Briefcase,
  Coins,
  LayoutDashboard,
  LineChart,
  Map,
  Banknote,
} from 'lucide-react';
import { FastLink } from '@/components/shared/NavigationProgress';
import { cn } from '@/lib/utils';

const links = [
  {
    href: '/',
    label: 'Overview',
    icon: LayoutDashboard,
    color: 'text-emerald-400',
  },
  { href: '/bist', label: 'BİST', icon: LineChart, color: 'text-blue-400' },
  {
    href: '/bist/heatmap',
    label: 'Isı Haritası',
    icon: Map,
    color: 'text-amber-400',
  },
  {
    href: '/crypto',
    label: 'Crypto',
    icon: Bitcoin,
    color: 'text-violet-400',
  },
  {
    href: '/fx/USD-TRY',
    label: 'Döviz',
    icon: Banknote,
    color: 'text-lime-400',
  },
  {
    href: '/portfolio',
    label: 'Portföyüm',
    icon: Briefcase,
    color: 'text-cyan-400',
  },
  {
    href: '/alerts',
    label: 'Alarmlar',
    icon: Bell,
    color: 'text-orange-400',
  },
  {
    href: '/dividends',
    label: 'Temettü',
    icon: Coins,
    color: 'text-rose-400',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Warm every tab into the client router cache (idle) so clicks are instant
  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const { href } of links) {
        router.prefetch(href);
      }
    }, 100);
    return () => window.clearTimeout(id);
  }, [router]);

  return (
    <aside className="hidden w-52 shrink-0 border-r border-zinc-800/80 bg-zinc-950/80 p-3 backdrop-blur-xl md:block">
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, color }) => {
          const active =
            href === '/'
              ? pathname === '/'
              : href === '/bist'
                ? pathname === '/bist' ||
                  /^\/bist\/(?!heatmap)/.test(pathname)
                : href === '/crypto'
                  ? pathname === '/crypto' || pathname.startsWith('/crypto/')
                  : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <FastLink
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm transition-colors',
                active
                  ? 'border-emerald-400 bg-gradient-to-r from-emerald-500/15 to-transparent font-semibold text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              )}
            >
              <Icon
                className={cn('size-4', active ? 'text-emerald-400' : color)}
              />
              {label}
            </FastLink>
          );
        })}
      </nav>
    </aside>
  );
}
