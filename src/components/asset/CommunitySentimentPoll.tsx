'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { CommunitySentiment, SentimentVote } from '@/lib/community-sentiment';
import { cn } from '@/lib/utils';

const voteKey = (symbol: string) => `bullsye:sentiment-vote:${symbol.toUpperCase()}`;

async function fetchSentiment(
  symbol: string,
  changePercent: number
): Promise<CommunitySentiment> {
  const res = await fetch(
    `/api/community-sentiment?symbol=${encodeURIComponent(symbol)}&change=${changePercent}`
  );
  const json = (await res.json()) as {
    success: boolean;
    data?: CommunitySentiment;
    error?: string;
  };
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Sentiment yüklenemedi');
  }
  return json.data;
}

interface CommunitySentimentPollProps {
  symbol: string;
  changePercent?: number;
  /** AI fırsat / sağlık skoru — yan yana sosyal kanıt */
  aiScore?: number | null;
  compact?: boolean;
  className?: string;
}

export function CommunitySentimentPoll({
  symbol,
  changePercent = 0,
  aiScore = null,
  compact = false,
  className,
}: CommunitySentimentPollProps) {
  const qc = useQueryClient();
  const [userVote, setUserVote] = useState<SentimentVote | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(voteKey(symbol));
      if (v === 'bull' || v === 'bear') setUserVote(v);
    } catch {
      /* ignore */
    }
  }, [symbol]);

  const query = useQuery({
    queryKey: ['community-sentiment', symbol.toUpperCase()],
    queryFn: () => fetchSentiment(symbol, changePercent),
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (vote: SentimentVote) => {
      const res = await fetch('/api/community-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          vote,
          previous: userVote,
          changePercent,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: CommunitySentiment;
        error?: string;
      };
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Oy kaydedilemedi');
      }
      return json.data;
    },
    onSuccess: (data, vote) => {
      setUserVote(vote);
      try {
        localStorage.setItem(voteKey(symbol), vote);
      } catch {
        /* ignore */
      }
      qc.setQueryData(['community-sentiment', symbol.toUpperCase()], data);
    },
  });

  const onVote = useCallback(
    (vote: SentimentVote) => {
      if (mutation.isPending) return;
      mutation.mutate(vote);
    },
    [mutation]
  );

  const data = query.data;
  const bullPct = data?.bullPct ?? 50;
  const bearPct = data?.bearPct ?? 50;

  return (
    <section
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)]',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3
            className={cn(
              'font-semibold tracking-tight',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            Topluluk Konsensüsü
          </h3>
          {!compact ? (
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Boğa / ayı oylaması — AI skoru ile sosyal kanıt
            </p>
          ) : null}
        </div>
        {aiScore != null ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-center">
            <p className="text-[9px] uppercase tracking-wide text-emerald-400/80">
              AI Skor
            </p>
            <p className="font-mono text-sm font-bold tabular-nums text-emerald-300">
              {aiScore}
              <span className="text-[10px] font-normal">/100</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${bullPct}%` }}
        />
        <div
          className="bg-rose-500 transition-all"
          style={{ width: `${bearPct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onVote('bull')}
          disabled={mutation.isPending}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm',
            userVote === 'bull'
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
              : 'border-[var(--border)] bg-[var(--surface)]/60 text-[var(--foreground)] hover:border-emerald-500/40'
          )}
        >
          <TrendingUp className="size-4 text-emerald-400" />
          <span>Boğa (%{bullPct})</span>
        </button>
        <button
          type="button"
          onClick={() => onVote('bear')}
          disabled={mutation.isPending}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:text-sm',
            userVote === 'bear'
              ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
              : 'border-[var(--border)] bg-[var(--surface)]/60 text-[var(--foreground)] hover:border-rose-500/40'
          )}
        >
          <TrendingDown className="size-4 text-rose-400" />
          <span>Ayı (%{bearPct})</span>
        </button>
      </div>

      {data ? (
        <p className="mt-2 text-[10px] text-[var(--muted)]">
          {data.totalVotes.toLocaleString('tr-TR')} oy ·{' '}
          {userVote
            ? userVote === 'bull'
              ? 'Oyunuz: Boğa'
              : 'Oyunuz: Ayı'
            : 'Oy vermek için bir taraf seçin'}
        </p>
      ) : query.isLoading ? (
        <p className="mt-2 text-[10px] text-[var(--muted)]">Yükleniyor…</p>
      ) : null}
    </section>
  );
}
