'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/seo/symbols';

type Props = {
  symbol: string;
  path: string;
  scoreHint?: string;
};

export function ShareScorecardButton({ symbol, path, scoreHint }: Props) {
  const url = `${SITE_URL}${path}`;
  const text = encodeURIComponent(
    `${symbol} Bullsye karnesi${scoreHint ? ` · ${scoreHint}` : ''} — ücretsiz analiz`
  );
  const intent = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-1.5 text-xs"
      onClick={() => window.open(intent, '_blank', 'noopener,noreferrer')}
    >
      <Share2 className="size-3.5" />
      Karneni X&apos;te paylaş
    </Button>
  );
}
