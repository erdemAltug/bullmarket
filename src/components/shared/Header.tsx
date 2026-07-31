'use client';

import { CommandPaletteTrigger } from '@/components/shared/CommandPalette';
import { Logo } from '@/components/shared/Logo';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  return (
    <header className="relative z-50 flex h-16 items-center justify-between gap-4 border-b border-zinc-800/60 bg-zinc-950/80 px-4 backdrop-blur-md">
      <Logo />
      <div className="flex items-center gap-3">
        <CommandPaletteTrigger />
        <p className="hidden text-xs text-zinc-500 lg:block">
          BİST · Kripto · Döviz
        </p>
        <UserMenu />
      </div>
    </header>
  );
}
