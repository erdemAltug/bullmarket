'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { migrateAnonymousWatchlist } from '@/actions/watchlist';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { authClient } from '@/lib/auth/client';
import { trackEvent } from '@/lib/analytics';
import { DEFAULT_WATCHLIST } from '@/hooks/useWatchlist.shared';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: Tab;
  headline?: string;
  subtitle?: string;
  growthMode?: boolean;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.9.7-2.5 1.9C4.9 20 8.2 22 12 22c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-6-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 7.1C2.4 8.6 2 10.2 2 12s.4 3.4 1.2 4.9l3.4-2.6C6.2 13.4 6 12.7 6 12s.2-1.4.6-2.3L3.2 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3.1 14.7 2 12 2 8.2 2 4.9 4 3.2 7.1l3.4 2.6C7 7.9 9.2 6 12 6z"
      />
    </svg>
  );
}

async function migrateLocalWatchlist() {
  try {
    const raw = localStorage.getItem('bullmarket:watchlist');
    const symbols: string[] = raw
      ? (JSON.parse(raw) as string[])
      : [...DEFAULT_WATCHLIST];
    await migrateAnonymousWatchlist(symbols);
    localStorage.setItem(
      'bullmarket:watchlist-migrated',
      `user:${Date.now()}`
    );
  } catch (error) {
    console.error('Watchlist migrate failed:', error);
  }
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'login',
  headline,
  subtitle,
  growthMode = false,
}: AuthModalProps) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab(defaultTab);
    setError(null);
  }, [open, defaultTab]);

  async function afterAuthSuccess() {
    await migrateLocalWatchlist();
    await qc.invalidateQueries({ queryKey: ['watchlist'] });
    await qc.invalidateQueries({ queryKey: ['alerts'] });
    await qc.invalidateQueries({ queryKey: ['portfolio'] });
    trackEvent('registration_completed', { method: 'email_or_session' });
    onOpenChange(false);
    setPassword('');
    setError(null);
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    try {
      const { error: err } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: typeof window !== 'undefined' ? window.location.href : '/',
      });
      if (err) setError(err.message || 'Google girişi başarısız');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google girişi başarısız');
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (tab === 'register') {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split('@')[0],
        });
        if (err) {
          setError(err.message || 'Kayıt başarısız');
          return;
        }
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
        });
        if (err) {
          setError(err.message || 'Giriş başarısız');
          return;
        }
      }
      await afterAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kimlik doğrulama hatası');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-zinc-800/80 bg-zinc-950/90 p-0 backdrop-blur-xl">
        <div className="border-b border-zinc-800/80 bg-gradient-to-r from-emerald-500/10 via-transparent to-violet-500/10 px-5 py-4">
          <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-50">
            {headline ??
              (growthMode
                ? 'Ücretsiz Kayıt Ol & Kilidi Aç'
                : 'Bullsye Hesabı')}
          </DialogTitle>
          <p className="mt-1 text-xs text-zinc-500">
            {subtitle ??
              (growthMode
                ? '1 tıkla Google ile devam et — AI sinyalleri ve hedef fiyatlar açılır.'
                : 'Watchlist, alarm ve portföy hesabınızda güvende')}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
            {(
              [
                ['login', 'Giriş Yap'],
                ['register', 'Kayıt Ol'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setError(null);
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  tab === id
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void onGoogle()}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-60"
          >
            <GoogleIcon className="size-4" />
            {growthMode || tab === 'register'
              ? '1 Tıkla Google ile Kayıt Ol'
              : 'Google ile Devam Et'}
          </button>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600">
            <div className="h-px flex-1 bg-zinc-800" />
            veya e-posta
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
            {tab === 'register' ? (
              <label className="block text-xs text-zinc-400">
                Ad
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Adınız"
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
                />
              </label>
            ) : null}

            <label className="block text-xs text-zinc-400">
              E-Posta adresi
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="ornek@mail.com"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
              />
            </label>

            <label className="block text-xs text-zinc-400">
              Şifre
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                autoComplete={
                  tab === 'login' ? 'current-password' : 'new-password'
                }
                placeholder="En az 8 karakter"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {tab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
