'use client';

import { useState } from 'react';
import { Check, ImageDown, Share2 } from 'lucide-react';
import type { PotentialCard } from '@/lib/ai-opportunity';
import { SITE_URL } from '@/lib/seo/symbols';
import { Button } from '@/components/ui/button';

export function ShareDailyRadar({ cards }: { cards: PotentialCard[] }) {
  const top = cards.slice(0, 3);
  const [copied, setCopied] = useState(false);
  if (!top.length) return null;

  const lines = top
    .map((c) => `${c.displaySymbol} skor ${c.score}/100`)
    .join('\n');
  const url = `${SITE_URL}/firsatlar?utm_source=share&utm_medium=radar`;
  const text = `Bullsye — günün 3 yüksek skorlu sembolü\n${lines}\n${url}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bullsye — günlük skor taraması',
          text,
          url,
        });
        return;
      }
    } catch {
      /* user cancel */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const imageUrl = `/api/og?type=radar&${top
    .map((c, i) => `t${i + 1}=${encodeURIComponent(c.displaySymbol)}&s${i + 1}=${c.score}`)
    .join('&')}`;

  return (
    <div className="inline-flex shrink-0">
      <Button
        type="button"
        variant="outline"
        className="gap-1.5 rounded-r-none text-xs"
        onClick={() => void share()}
      >
        {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        {copied ? 'Kopyalandı' : 'Günün 3 kartını paylaş'}
      </Button>
      <a
        href={imageUrl}
        download="bullsye-gunun-3-karti.png"
        target="_blank"
        rel="noopener"
        aria-label="Paylaşım görselini indir"
        title="Paylaşım görselini indir"
        className="inline-flex items-center rounded-r-lg border border-l-0 border-[var(--border)] px-2.5 text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
      >
        <ImageDown className="size-3.5" />
      </a>
    </div>
  );
}
