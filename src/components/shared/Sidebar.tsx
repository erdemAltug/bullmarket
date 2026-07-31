'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Bell,
  Bitcoin,
  Briefcase,
  Coins,
  Crosshair,
  GitCompare,
  LayoutDashboard,
  LineChart,
  Map,
  Banknote,
  Sparkles,
  Waves,
} from 'lucide-react';
import { FastLink } from '@/components/shared/NavigationProgress';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { cn } from '@/lib/utils';

const linkDefs = [
  { href: '/', key: 'overview' as const, icon: LayoutDashboard, color: 'text-emerald-400' },
  { href: '/bist', key: 'bist' as const, icon: LineChart, color: 'text-blue-400' },
  { href: '/bist/heatmap', key: 'heatmap' as const, icon: Map, color: 'text-amber-400' },
  { href: '/crypto', key: 'crypto' as const, icon: Bitcoin, color: 'text-violet-400' },
  { href: '/fx/USD-TRY', key: 'fx' as const, icon: Banknote, color: 'text-lime-400' },
  { href: '/compare', key: 'compare' as const, icon: GitCompare, color: 'text-emerald-300' },
  { href: '/signals', key: 'signals' as const, icon: Sparkles, color: 'text-emerald-300' },
  { href: '/targets', key: 'targets' as const, icon: Crosshair, color: 'text-amber-300' },
  { href: '/smart-money', key: 'smartMoney' as const, icon: Waves, color: 'text-cyan-400' },
  { href: '/dividends', key: 'dividends' as const, icon: Coins, color: 'text-rose-400' },
  { href: '/portfolio-audit', key: 'portfolioAudit' as const, icon: Activity, color: 'text-rose-300' },
  { href: '/portfolio', key: 'portfolio' as const, icon: Briefcase, color: 'text-cyan-400' },
  { href: '/alerts', key: 'alerts' as const, icon: Bell, color: 'text-orange-400' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = usePreferences();

  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const { href } of linkDefs) {
        router.prefetch(href);
      }
    }, 100);
    return () => window.clearTimeout(id);
  }, [router]);

  return (
    <aside className="hidden w-52 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] p-3 backdrop-blur-xl md:block">
      <nav className="flex flex-col gap-1">
        {linkDefs.map(({ href, key, icon: Icon, color }) => {
          const label = t.nav[key];
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
                  ? 'border-[var(--accent)] bg-gradient-to-r from-[var(--glow-up)] to-transparent font-semibold text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon
                className={cn('size-4', active ? 'text-[var(--accent)]' : color)}
              />
              {label}
            </FastLink>
          );
        })}
      </nav>
    </aside>
  );
}
