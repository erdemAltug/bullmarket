'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type State = { available: boolean; active: boolean };

/** "E-mail me this every Monday" switch for the weekly portfolio report. */
export function ReportEmailToggle() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({
    queryKey: ['portfolio-report-sub'],
    queryFn: async (): Promise<State> => {
      const res = await fetch('/api/portfolio-report');
      const json = (await res.json()) as { data?: State };
      return json.data ?? { available: false, active: false };
    },
  });

  if (!data?.available) return null;

  async function toggle() {
    if (!data) return;
    setBusy(true);
    const next = !data.active;
    try {
      const res = await fetch('/api/portfolio-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) {
        qc.setQueryData(['portfolio-report-sub'], { available: true, active: next });
        trackEvent(next ? 'portfolio_report_subscribe' : 'portfolio_report_unsubscribe', {});
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-60',
        data.active
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          : 'border-[var(--border)] text-[var(--foreground)] hover:border-emerald-500/40'
      )}
    >
      <Mail className="size-3.5" />
      {data.active ? 'Her pazartesi e-postana geliyor ✓' : 'Her pazartesi e-postama gönder'}
    </button>
  );
}
