'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Newspaper } from 'lucide-react';
import { useNews } from '@/hooks/useIntelligence';
import { ListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types';

const CAT: Record<
  NewsItem['category'],
  { label: string; className: string }
> = {
  bist: { label: 'BİST', className: 'bg-emerald-500/15 text-emerald-400' },
  crypto: { label: 'Kripto', className: 'bg-sky-500/15 text-sky-400' },
  macro: { label: 'Makro', className: 'bg-amber-500/15 text-amber-400' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

interface NewsFeedProps {
  defaultOpen?: boolean;
}

export function NewsFeed({ defaultOpen = true }: NewsFeedProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { data, isLoading, error } = useNews();
  const items = data?.items ?? [];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Newspaper className="size-4 text-zinc-400" />
          Haberler & KAP Akışı
        </span>
        {open ? (
          <ChevronUp className="size-4 text-zinc-500" />
        ) : (
          <ChevronDown className="size-4 text-zinc-500" />
        )}
      </button>

      {open ? (
        <div className="max-h-80 space-y-0 overflow-y-auto border-t border-zinc-800">
          {isLoading && !items.length ? (
            <div className="p-4">
              <ListSkeleton rows={5} />
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-red-400">{error.message}</p>
          ) : !items.length ? (
            <EmptyState
              icon={Newspaper}
              title="Haber bulunamadı"
              description="Akış boş veya kaynak yanıt vermedi."
              className="py-8"
            />
          ) : (
            items.map((item) => {
              const cat = CAT[item.category];
              return (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex gap-3 border-b border-zinc-800/80 px-4 py-3 last:border-0 hover:bg-zinc-900/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          cat.className
                        )}
                      >
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {relativeTime(item.publishedAt)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-zinc-200">
                      {item.title}
                    </p>
                  </div>
                  <ExternalLink className="mt-1 size-3 shrink-0 text-zinc-700 opacity-60 transition-opacity group-hover:opacity-100" />
                </a>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
