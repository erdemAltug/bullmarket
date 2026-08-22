'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
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
  const text = `Bullsye günün 3 fırsatı\n${lines}\n${url}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bullsye — günün fırsatları',
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

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-1.5 text-xs"
      onClick={() => void share()}
    >
      {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
      {copied ? 'Kopyalandı' : 'Günün 3 kartını paylaş'}
    </Button>
  );
}
