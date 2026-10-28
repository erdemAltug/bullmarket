'use client';

import { CommandPaletteTrigger } from '@/components/shared/CommandPalette';
import { Logo } from '@/components/shared/Logo';
import { MarketStatus } from '@/components/shared/MarketStatus';
import { PreferencesBar } from '@/components/shared/PreferencesBar';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--header)]/95 px-3 backdrop-blur-md sm:h-16 sm:gap-4 sm:px-4">
      <div className="min-w-0 flex-1">
        <Logo compact href="/terminal" />
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <CommandPaletteTrigger />
        <MarketStatus className="hidden md:flex" />
        <PreferencesBar />
        <UserMenu />
      </div>
    </header>
  );
}
