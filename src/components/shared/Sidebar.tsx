'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FastLink } from '@/components/shared/NavigationProgress';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { NAV_GROUPS, allNavHrefs, isNavActive } from '@/lib/nav';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = usePreferences();

  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const href of allNavHrefs()) {
        router.prefetch(href);
      }
    }, 100);
    return () => window.clearTimeout(id);
  }, [router]);

  return (
    <aside className="hidden w-52 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] backdrop-blur-xl md:block">
      <nav className="flex h-full flex-col gap-4 overflow-y-auto p-3">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group} className="space-y-1">
            <p className="px-3 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]/70">
              {t.navGroups[group]}
            </p>
            {items.map(({ href, key, icon: Icon, color }) => {
              const active = isNavActive(pathname, href);
              return (
                <FastLink
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-l-2 px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'border-[var(--accent)] bg-gradient-to-r from-[var(--glow-up)] to-transparent font-semibold text-[var(--accent)]'
                      : 'border-transparent text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon
                    className={cn(
                      'size-4 shrink-0',
                      active ? 'text-[var(--accent)]' : color
                    )}
                  />
                  <span className="truncate">{t.nav[key]}</span>
                </FastLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
