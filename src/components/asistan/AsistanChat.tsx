'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { ProtectedFeature } from '@/components/auth/ProtectedFeature';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

type Turn = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'Portföyümde yoğunlaşma var mı?',
  'Alarmlarım ile pozisyonlarım uyumlu mu?',
  'Nakit / mevduat dilimim nasıl görünüyor?',
];

function ChatInner() {
  const { data: session } = authClient.useSession();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      content:
        'Merhaba — envanterin, alarmların ve izleme listene bakarak sorularını yanıtlarım. Yatırım tavsiyesi vermem; rakamlar senin kayıtlı verinden gelir.',
    },
  ]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError(null);
    setInput('');
    const nextHistory = [
      ...turns.filter((t) => t.role === 'user' || t.role === 'assistant'),
      { role: 'user' as const, content: message },
    ];
    setTurns(nextHistory);
    setBusy(true);
    try {
      const res = await fetch('/api/asistan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: nextHistory.slice(1, -1),
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { reply: string; remaining: number };
      };
      if (!json.success || !json.data) {
        setError(json.error ?? 'İstek başarısız');
        setTurns((t) => t.slice(0, -1));
        return;
      }
      setRemaining(json.data.remaining);
      setTurns((t) => [
        ...t,
        { role: 'assistant', content: json.data!.reply },
      ]);
    } catch {
      setError('Bağlantı hatası');
      setTurns((t) => t.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  const name = session?.user?.name?.split(' ')[0] ?? 'sen';

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-[var(--accent)]" />
          <div>
            <p className="text-sm font-semibold">Portföy asistanı</p>
            <p className="text-[10px] text-[var(--muted)]">
              Merhaba {name} · kayıtlı envanter bağlamı · tavsiye değil
            </p>
          </div>
        </div>
        {remaining != null ? (
          <span className="font-mono text-[10px] text-[var(--muted)]">
            {remaining} kalan
          </span>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {turns.map((t, i) => (
          <div
            key={`${t.role}-${i}`}
            className={cn(
              'max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
              t.role === 'user'
                ? 'ml-auto bg-[var(--accent)]/15 text-[var(--foreground)]'
                : 'bg-[var(--surface)] text-[var(--foreground)]/90'
            )}
          >
            {t.content}
          </div>
        ))}
        {busy ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
            <Loader2 className="size-3.5 animate-spin" />
            Düşünüyor…
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="px-4 pb-1 text-xs text-[var(--down)]">{error}</p>
      ) : null}

      {!busy && turns.length <= 2 ? (
        <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-3 py-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-md border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex gap-2 border-t border-[var(--border)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Portföyün hakkında sor…"
          disabled={busy}
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/50"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length < 2}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-3 py-2 text-[#042f2e] disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>

      <p className="border-t border-[var(--border)] px-4 py-2 text-[10px] text-[var(--muted)]">
        Veriler Neon hesabındaki envanterden gelir. Guest LocalStorage dahil
        değil —{' '}
        <Link href="/portfolio" className="text-[var(--accent)]">
          envantere ekle
        </Link>
        .
      </p>
    </div>
  );
}

export function AsistanChat() {
  return (
    <ProtectedFeature
      featureTitle="Portföy asistanını aç"
      className="min-h-[320px]"
    >
      <ChatInner />
    </ProtectedFeature>
  );
}
