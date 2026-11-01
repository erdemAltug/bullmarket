'use client';

import { useState } from 'react';
import { Bell, Plus, Star } from 'lucide-react';
import { AlertModal } from '@/components/alerts/AlertModal';
import { ShareScorecardButton } from '@/components/seo/ShareScorecardButton';
import { useWatchlist } from '@/hooks/useWatchlist';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type Kind = 'bist' | 'crypto' | 'fx' | 'us';

/** Watchlist key used by the scanner/terminal (BIST rows carry ".IS"). */
export function watchKeyFor(kind: Kind, symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (kind === 'bist') return s.endsWith('.IS') ? s : `${s}.IS`;
  return s;
}

const BTN =
  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors';

/** Primary actions right under the price: watch, alert, add, share. */
export function SymbolActionBar({
  kind,
  symbol,
  name,
  price,
  changePercent,
  sharePath,
}: {
  kind: Kind;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sharePath: string;
}) {
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlist();
  const [alertOpen, setAlertOpen] = useState(false);
  const key = watchKeyFor(kind, symbol);
  const bare = symbol.trim().toUpperCase();
  // Older builds stored bare BIST tickers; treat them as the same entry.
  const starred = hasSymbol(key) || (kind === 'bist' && hasSymbol(bare));

  function toggleWatch() {
    if (starred) {
      removeSymbol(key);
      if (kind === 'bist') removeSymbol(bare);
    } else {
      addSymbol(key);
      trackEvent('watchlist_add', { symbol: bare, source: 'symbol_header' });
    }
  }

  function scrollToInventory() {
    document
      .getElementById('envanter-ekle')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleWatch}
        aria-pressed={starred}
        className={cn(
          BTN,
          starred
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            : 'border-[var(--border)] text-[var(--foreground)] hover:border-amber-500/40'
        )}
      >
        <Star className={cn('size-4', starred && 'fill-amber-300')} />
        {starred ? 'İzleniyor' : 'İzle'}
      </button>
      <button
        type="button"
        onClick={() => setAlertOpen(true)}
        className={cn(
          BTN,
          'border-transparent bg-[var(--accent)] font-semibold text-[#042f2e] hover:brightness-110'
        )}
      >
        <Bell className="size-4" /> Alarm kur
      </button>
      {kind === 'bist' ? (
        <button
          type="button"
          onClick={scrollToInventory}
          className={cn(
            BTN,
            'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40'
          )}
        >
          <Plus className="size-4" /> Envantere ekle
        </button>
      ) : null}
      {kind === 'bist' ? (
        <ShareScorecardButton symbol={symbol} path={sharePath} />
      ) : null}

      {alertOpen ? (
        <AlertModal
          open={alertOpen}
          onOpenChange={setAlertOpen}
          symbol={key}
          displaySymbol={bare.replace(/USDT$/, '') || name}
          currentPrice={price}
          changePercent={changePercent}
        />
      ) : null}
    </div>
  );
}
