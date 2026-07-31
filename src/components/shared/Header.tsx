'use client';

import { CommandPaletteTrigger } from '@/components/shared/CommandPalette';
import { Logo } from '@/components/shared/Logo';
import { PreferencesBar } from '@/components/shared/PreferencesBar';
import { UserMenu } from '@/components/auth/UserMenu';
import { usePreferences } from '@/components/providers/PreferencesProvider';

export function Header() {
  const { t } = usePreferences();

  return (
    <header className="relative z-50 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--header)] px-4 backdrop-blur-md">
      <Logo />
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
