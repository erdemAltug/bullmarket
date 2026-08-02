'use client';

import { CommandPaletteTrigger } from '@/components/shared/CommandPalette';
import { Logo } from '@/components/shared/Logo';
import { PreferencesBar } from '@/components/shared/PreferencesBar';
import { UserMenu } from '@/components/auth/UserMenu';
import { usePreferences } from '@/components/providers/PreferencesProvider';

export function Header() {
  const { t } = usePreferences();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--header)]/95 px-3 backdrop-blur-md sm:h-16 sm:gap-4 sm:px-4">
      <div className="min-w-0 flex-1">
        <Logo compact />
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
