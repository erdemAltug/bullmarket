'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Briefcase,
  ChevronDown,
  LogOut,
  UserRound,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { FastLink } from '@/components/shared/NavigationProgress';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const qc = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function signOut() {
    setMenuOpen(false);
    await authClient.signOut();
    await qc.invalidateQueries({ queryKey: ['watchlist'] });
    await qc.invalidateQueries({ queryKey: ['alerts'] });
    await qc.invalidateQueries({ queryKey: ['portfolio'] });
  }

  if (isPending) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-800/80" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Giriş Yap / Kayıt Ol
        </button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  const label =
    user.name?.trim() ||
    user.email?.split('@')[0] ||
    'Hesap';
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-1 pl-1 pr-2.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-500',
          menuOpen && 'border-emerald-500/40'
        )}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="size-6 rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <span className="max-w-[120px] truncate">{label}</span>
        <ChevronDown className="size-3.5 text-zinc-500" />
      </button>

      {menuOpen ? (
        <div className="absolute right-0 z-[100] mt-2 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-2xl">
          <div className="border-b border-zinc-800 px-3 py-2">
            <p className="truncate text-xs font-medium text-zinc-200">
              {user.email}
            </p>
          </div>
          <FastLink
            href="/portfolio"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-cyan-300"
          >
            <Briefcase className="size-3.5" />
            Portföyüm
          </FastLink>
          <FastLink
            href="/alerts"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-amber-300"
          >
            <Bell className="size-3.5" />
            Alarmlarım
          </FastLink>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-300 hover:bg-zinc-900"
          >
            <LogOut className="size-3.5" />
            Çıkış Yap
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Optional compact avatar for tight layouts */
export function UserAvatarFallback() {
  return <UserRound className="size-4 text-zinc-400" />;
}
