'use client';

import { useState, useSyncExternalStore } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

const DONE_KEY = 'bullsye:pro-waitlist';

const noopSubscribe = () => () => {};
function readDone(): boolean {
  try {
    return localStorage.getItem(DONE_KEY) === '1';
  } catch {
    return false;
  }
}

const PERKS = [
  'Sınırsız fiyat / RSI / skor alarmı',
  'Skor geçmişi (90 gün) ve CSV dışa aktarım',
  'Tam portföy doktoru raporu',
];

/** Pro interest signal — no pricing, no paywall. Open beta stays free. */
export function ProWaitlistCard({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const { data: session } = authClient.useSession();
  const sessionEmail = session?.user?.email ?? '';
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const stored = useSyncExternalStore(noopSubscribe, readDone, () => false);
  const done = joined || stored;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || sessionEmail, source }),
      });
      const j = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !j.success) throw new Error(j.error || 'Kaydedilemedi');
      try {
        localStorage.setItem(DONE_KEY, '1');
      } catch {
        /* private mode */
      }
      setJoined(true);
      trackEvent('pro_waitlist_join', { source });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn(
        'rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-[var(--card)] to-[var(--card)] p-4 sm:p-5',
        className
      )}
      aria-label="Bullsye Pro bekleme listesi"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-emerald-400" />
        <h2 className="text-sm font-semibold">Bullsye Pro — bekleme listesi</h2>
        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
          Açık beta ücretsiz
        </span>
      </div>
      <ul className="mt-3 grid gap-1.5 text-xs text-[var(--muted)] sm:grid-cols-3">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-1.5">
            <Check className="mt-0.5 size-3 shrink-0 text-emerald-400" />
            {p}
          </li>
        ))}
      </ul>

      {done ? (
        <p className="mt-4 text-sm text-emerald-300">
          Listedesin. Pro açıldığında ilk sen haber alacaksın.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          {sessionEmail ? null : (
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresin"
              aria-label="E-posta adresi"
              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          )}
          <Button type="submit" disabled={busy} className="shrink-0">
            {sessionEmail ? 'Beni listeye ekle' : 'Haber ver'}
          </Button>
        </form>
      )}
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </section>
  );
}
