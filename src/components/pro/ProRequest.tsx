'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { trackEvent } from '@/lib/analytics';
import { authClient } from '@/lib/auth/client';
import {
  FOUNDER_SEATS,
  PRO_FEATURES,
  PRO_PRICE,
  formatTl,
  type ProFeatureId,
  type ProPlanChoice,
} from '@/lib/pro-plan';
import { cn } from '@/lib/utils';

const DONE_KEY = 'bullsye:pro-waitlist';

type Ctx = { openPro: (where: string, plan?: ProPlanChoice) => void };
const ProRequestContext = createContext<Ctx>({ openPro: () => {} });

export function useProRequest() {
  return useContext(ProRequestContext);
}

/** Mount once; any CTA calls useProRequest().openPro('placement'). */
export function ProRequestProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user?.email);
  const [open, setOpen] = useState(false);
  const [where, setWhere] = useState('unknown');
  const [plan, setPlan] = useState<ProPlanChoice>('yearly');

  const openPro = useCallback((w: string, p?: ProPlanChoice) => {
    setWhere(w);
    if (p) setPlan(p);
    setOpen(true);
    trackEvent('pro_cta_click', { where: w });
    // Signed-in visitors are captured on the click itself (account e-mail),
    // even if they close the dialog without sending the form.
    if (signedIn) {
      void fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: w, kind: 'click' }),
      }).catch(() => undefined);
    }
  }, [signedIn]);

  const value = useMemo(() => ({ openPro }), [openPro]);

  return (
    <ProRequestContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[8%] max-h-[88dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto p-5 sm:p-6">
          {open ? (
            <ProRequestForm
              where={where}
              plan={plan}
              onPlan={setPlan}
              onClose={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </ProRequestContext.Provider>
  );
}

function ProRequestForm({
  where,
  plan,
  onPlan,
  onClose,
}: {
  where: string;
  plan: ProPlanChoice;
  onPlan: (p: ProPlanChoice) => void;
  onClose: () => void;
}) {
  const { data: session } = authClient.useSession();
  const sessionEmail = session?.user?.email ?? '';
  const [email, setEmail] = useState('');
  const [features, setFeatures] = useState<ProFeatureId[]>(['alerts']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function toggle(id: ProFeatureId) {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || sessionEmail,
          source: where,
          plan,
          features,
        }),
      });
      const j = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !j.success) throw new Error(j.error || 'Kaydedilemedi');
      try {
        localStorage.setItem(DONE_KEY, '1');
      } catch {
        /* private mode */
      }
      trackEvent('pro_request_submit', { where, plan, features: features.join(',') });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Check className="size-5" />
        </span>
        <DialogTitle className="text-lg font-semibold">Talebin alındı</DialogTitle>
        <p className="text-sm text-[var(--muted)]">
          Pro’yu ilk {FOUNDER_SEATS} kişiye kurucu üye fiyatıyla (
          {formatTl(PRO_PRICE.founderMonthly)}/ay) açıyoruz. Davet e-postan
          gelecek; şimdi hiçbir ödeme alınmadı. Bu arada her şey ücretsiz
          kullanılmaya devam ediyor.
        </p>
        <Button type="button" onClick={onClose} className="w-full">
          Tamam
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <DialogTitle className="flex items-center gap-2 pr-6 text-lg font-semibold">
          <Sparkles className="size-5 text-emerald-400" /> Pro’ya erken erişim
        </DialogTitle>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pro davetle açılıyor. Talep bırak; ilk {FOUNDER_SEATS} kişi kurucu üye
          fiyatını alır. Şimdi ödeme alınmaz.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Plan
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['monthly', 'Aylık', `${formatTl(PRO_PRICE.monthly)}/ay`],
              ['yearly', 'Yıllık', `${formatTl(PRO_PRICE.yearly)}/yıl · 2 ay hediye`],
            ] as const
          ).map(([id, label, price]) => (
            <button
              key={id}
              type="button"
              onClick={() => onPlan(id)}
              aria-pressed={plan === id}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                plan === id
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-[var(--border)] hover:border-emerald-500/30'
              )}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-[var(--muted)]">{price}</p>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          En çok neye ihtiyacın var?
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {PRO_FEATURES.map((f) => {
            const on = features.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                aria-pressed={on}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium',
                  on
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {on ? '✓ ' : ''}
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {sessionEmail ? null : (
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresin"
          aria-label="E-posta adresi"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
        />
      )}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      <Button type="submit" disabled={busy} className="w-full">
        Erken erişim talep et
      </Button>
      <p className="text-center text-[11px] text-[var(--muted)]">
        Ödeme bilgisi istenmez. İstediğin an listeden çıkabilirsin.
      </p>
    </form>
  );
}

/** Small reusable CTA button. */
export function ProCtaButton({
  where,
  className,
  children = 'Pro’ya erken erişim al',
}: {
  where: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { openPro } = useProRequest();
  return (
    <button
      type="button"
      onClick={() => openPro(where)}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#042f2e] hover:brightness-110',
        className
      )}
    >
      <Sparkles className="size-4" /> {children}
    </button>
  );
}
