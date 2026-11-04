'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { FastLink } from '@/components/shared/NavigationProgress';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import {
  allNavHrefs,
  isNavActive,
  navGroupsForUser,
  splitGuestNav,
  type NavGroup,
} from '@/lib/nav';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

const noopSubscribe = () => () => {};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = usePreferences();
  const { data: session, isPending } = authClient.useSession();
  // Match the server (session unknown -> full menu) until hydration is done.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const signedIn = !hydrated || isPending || Boolean(session?.user);
  const groups = navGroupsForUser(signedIn);
  const { primary, more } = signedIn
    ? { primary: groups, more: [] as NavGroup[] }
    : splitGuestNav(groups);
  // Keep "Tüm araçlar" open when the guest is already on one of those pages.
  const moreActive = more.some((g) =>
    g.items.some((i) => isNavActive(pathname, i.href))
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const href of allNavHrefs()) {
        router.prefetch(href);
      }
    }, 100);
    return () => window.clearTimeout(id);
  }, [router]);

  function renderGroups(list: NavGroup[]) {
    return list.map(({ group, items }) => (
      <div key={group} className="space-y-1">
        <p className="px-3 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]/80">
          {t.navGroups[group]}
        </p>
        {items.map(({ href, key, icon: Icon }) => {
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
                  // One quiet icon colour; accent marks only where you are.
                  active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                )}
              />
              <span className="truncate">{t.nav[key]}</span>
            </FastLink>
          );
        })}
      </div>
    ));
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-52 shrink-0 self-start overflow-y-auto overscroll-contain border-r border-[var(--border)] bg-[var(--sidebar)] backdrop-blur-xl md:block">
      <nav className="flex flex-col gap-4 p-3">
        {renderGroups(primary)}
        {more.length ? (
          <details
            key={moreActive ? 'more-open' : 'more'}
            open={moreActive}
            className="group/more"
          >
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
              <ChevronRight className="size-3.5 transition-transform group-open/more:rotate-90" />
              {t.navGroups.moreTools}
            </summary>
            <div className="mt-3 flex flex-col gap-4">{renderGroups(more)}</div>
          </details>
        ) : null}
      </nav>
    </aside>
  );
}
