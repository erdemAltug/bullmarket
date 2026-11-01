'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Sunrise } from 'lucide-react';
import { useAuthGate } from '@/components/auth/AuthGateProvider';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

type State = { available: boolean; active: boolean };

const noopSubscribe = () => () => {};
const cameFromUnsubscribe = () =>
  new URLSearchParams(window.location.search).get('digest') === 'off';

/** Opt-in for the weekday 08:30 e-mail with the top 5 scores. */
export function MorningDigestToggle({ className }: { className?: string }) {
  const { data: session } = authClient.useSession();
  const { openAuth } = useAuthGate();
  const signedIn = Boolean(session?.user);
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toggled, setToggled] = useState(false);
  const fromLink = useSyncExternalStore(
    noopSubscribe,
    cameFromUnsubscribe,
    () => false
  );
  const unsubscribed = fromLink && !toggled;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch('/api/digest')
      .then((r) => r.json())
      .then((j: { data?: State }) => {
        if (!cancelled && j.data) setState(j.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  async function toggle() {
    if (!signedIn) {
      openAuth();
      return;
    }
    const next = !state?.active;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: next }),
      });
      const j = (await res.json()) as { data?: State; error?: string };
      if (!res.ok || !j.data) throw new Error(j.error || 'Kaydedilemedi');
      setState(j.data);
      setToggled(true);
      trackEvent(next ? 'digest_subscribe' : 'digest_unsubscribe', {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  if (signedIn && state && !state.available) return null;
  const active = Boolean(state?.active);

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      aria-label="Sabah özeti e-postası"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-300">
          <Sunrise className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Sabah özeti e-postası</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {unsubscribed
              ? 'Sabah özetinden çıktın. İstediğin zaman tekrar açabilirsin.'
              : 'Hafta içi 08:30 — günün en yüksek 5 skoru ve gerekçesi, tek e-posta.'}
          </p>
          {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
        </div>
      </div>
      <Button
        type="button"
        variant={active ? 'outline' : 'default'}
        disabled={busy || (signedIn && !state)}
        onClick={toggle}
        aria-pressed={active}
        className="shrink-0"
      >
        {!signedIn ? 'Giriş yap ve aç' : active ? 'Açık · kapat' : 'Aç'}
      </Button>
    </section>
  );
}
