'use client';

import { CommandPaletteTrigger } from '@/components/shared/CommandPalette';
import { Logo } from '@/components/shared/Logo';
import { MobileNavTrigger } from '@/components/shared/MobileNav';
import { PreferencesBar } from '@/components/shared/PreferencesBar';
import { UserMenu } from '@/components/auth/UserMenu';
import { usePreferences } from '@/components/providers/PreferencesProvider';

export function Header() {
  const { t } = usePreferences();

  return (
    <header className="relative z-50 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--header)] px-3 backdrop-blur-md sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavTrigger />
        <Logo />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <CommandPaletteTrigger />
        <p className="hidden text-xs text-[var(--muted)] lg:block">
          {t.header.tagline}
        </p>
        <PreferencesBar />
        <UserMenu />
      </div>
    </header>
  );
}
