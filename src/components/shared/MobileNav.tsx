'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { FastLink } from '@/components/shared/NavigationProgress';
import { Logo } from '@/components/shared/Logo';
import { OPEN_COMMAND_EVENT } from '@/components/shared/CommandPalette';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { authClient } from '@/lib/auth/client';
import {
  MOBILE_BOTTOM_ITEMS,
  isNavActive,
  navGroupsForUser,
  type NavKey,
} from '@/lib/nav';
import { cn } from '@/lib/utils';

/** Short labels that fit 5-col bottom bar on narrow phones */
const MOBILE_SHORT: Partial<Record<NavKey, string>> = {
  overview: 'Ana',
  opportunities: 'Fırsat',
  bist: 'BİST',
  signals: 'Sinyal',
};

interface MobileNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error('useMobileNav must be used within MobileNavProvider');
  }
  return ctx;
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function MobileNavDrawer() {
  const { open, setOpen } = useMobileNav();
  const pathname = usePathname();
  const { t } = usePreferences();
  const { data: session, isPending } = authClient.useSession();
  const groups = navGroupsForUser(isPending || Boolean(session?.user));

  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="flex w-[min(100vw,20rem)] max-w-[20rem] flex-col bg-[var(--sidebar)] p-0 sm:max-w-[20rem] md:hidden"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 pr-12">
          <SheetTitle className="sr-only">Navigasyon</SheetTitle>
          <Logo compact href="/terminal" />
        </div>
        <button
          type="button"
          onClick={() => {
            close();
            window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
          }}
          className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-left text-sm text-[var(--muted)]"
        >
          <Search className="size-4 shrink-0" />
          Ara · hisse, fon, ETF…
        </button>
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 pb-10">
          {groups.map(({ group, items }) => (
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
                    onClick={close}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-[15px] transition-colors',
                      active
                        ? 'border-[var(--accent)] bg-gradient-to-r from-[var(--glow-up)] to-transparent font-semibold text-[var(--accent)]'
                        : 'border-transparent text-[var(--muted)] active:bg-[var(--card)]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-5 shrink-0',
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
        <div className="mt-auto border-t border-[var(--border)] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]/70">
            Hukuki
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/kvkk', label: 'KVKK' },
              { href: '/gizlilik', label: 'Gizlilik' },
              { href: '/kosullar', label: 'Koşullar' },
              { href: '/yatirim-uyarisi', label: 'Risk' },
            ].map((l) => (
              <FastLink
                key={l.href}
                href={l.href}
                onClick={close}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--muted)]"
              >
                {l.label}
              </FastLink>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setOpen } = useMobileNav();

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--header)]/98 backdrop-blur-xl md:hidden',
        'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
      )}
      aria-label="Mobil gezinme"
    >
      <div className="grid grid-cols-5 px-1 pt-1">
        {MOBILE_BOTTOM_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          const label = MOBILE_SHORT[key] ?? key;
          return (
            <FastLink
              key={href}
              href={href}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[11px] font-semibold leading-none',
                active
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)]'
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl transition-colors',
                  active && 'bg-emerald-500/15'
                )}
              >
                <Icon
                  className={cn(
                    'size-5',
                    active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                  )}
                />
              </span>
              <span className="truncate">{label}</span>
            </FastLink>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[11px] font-semibold leading-none text-[var(--muted)]"
        >
          <span className="flex size-9 items-center justify-center rounded-xl">
            <Menu className="size-5" />
          </span>
          <span>Menü</span>
        </button>
      </div>
    </nav>
  );
}
