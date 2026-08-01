'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { FastLink } from '@/components/shared/NavigationProgress';
import { Logo } from '@/components/shared/Logo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import {
  MOBILE_BOTTOM_ITEMS,
  NAV_GROUPS,
  isNavActive,
} from '@/lib/nav';
import { cn } from '@/lib/utils';

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

export function MobileNavTrigger({ className }: { className?: string }) {
  const { setOpen } = useMobileNav();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Menüyü aç"
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)] md:hidden',
        className
      )}
    >
      <Menu className="size-5" />
    </button>
  );
}

export function MobileNavDrawer() {
  const { open, setOpen } = useMobileNav();
  const pathname = usePathname();
  const { t } = usePreferences();

  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="w-[min(100vw,20rem)] max-w-[20rem] bg-[var(--sidebar)] p-0 sm:max-w-[20rem] md:hidden"
      >
        <div className="flex h-16 items-center border-b border-[var(--border)] px-4 pr-12">
          <SheetTitle className="sr-only">Navigasyon</SheetTitle>
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 pb-8">
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
                    onClick={close}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors',
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
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = usePreferences();
  const { setOpen } = useMobileNav();

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--header)]/95 backdrop-blur-xl md:hidden',
        'pb-[max(0.35rem,env(safe-area-inset-bottom))]'
      )}
      aria-label="Mobil gezinme"
    >
      <div className="grid grid-cols-5 gap-0.5 px-1 pt-1">
        {MOBILE_BOTTOM_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <FastLink
              key={href}
              href={href}
              className={cn(
                'flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium',
                active
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)]'
              )}
            >
              <Icon
                className={cn(
                  'size-5',
                  active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                )}
              />
              <span className="truncate max-w-full">{t.nav[key]}</span>
            </FastLink>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium text-[var(--muted)]"
        >
          <Menu className="size-5" />
          <span>Menü</span>
        </button>
      </div>
    </nav>
  );
}
