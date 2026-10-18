'use client';

import { useMemo } from 'react';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { cn, formatPercent } from '@/lib/utils';
import type { ScannerItem } from '@/types/scanner';

type Quote = {
  label: string;
  hint: string;
  change: number | null;
  price: string | null;
};

function matchSymbol(list: ScannerItem[], token: string) {
  const key = token.toUpperCase();
  return (
    list.find(
      (item) =>
        item.displaySymbol.toUpperCase() === key ||
        item.symbol.toUpperCase() === key ||
        item.symbol.toUpperCase().startsWith(`${key}.`) ||
        item.symbol.toUpperCase().startsWith(`${key}USDT`)
    ) ?? null
  );
}

function money(value: number, currency: 'TRY' | 'USD') {
  const prefix = currency === 'USD' ? '$' : '₺';
  return `${prefix}${value.toLocaleString('tr-TR', {
    maximumFractionDigits: value >= 100 ? 2 : 4,
  })}`;
}

export function HeroAtmosphere() {
  const { data, commodities } = useMarketScanner();

  const cards = useMemo<Quote[]>(() => {
    const list = data ?? [];
    const xu = matchSymbol(list, 'XU100');
    const qqq = matchSymbol(list, 'QQQ');
    const btc = matchSymbol(list, 'BTC');
    const usd = commodities?.find((item) => item.symbol === 'USDTRY');

    return [
      {
        label: 'BİST 100',
        hint: 'XU100',
        change: xu?.changePercent ?? null,
        price: xu ? money(xu.price, 'TRY') : null,
      },
      {
        label: 'NASDAQ 100',
        hint: 'QQQ',
        change: qqq?.changePercent ?? null,
        price: qqq ? money(qqq.price, 'USD') : null,
      },
      {
        label: 'Bitcoin',
        hint: 'BTC',
        change: btc?.changePercent ?? null,
        price: btc ? money(btc.price, 'USD') : null,
      },
      {
        label: 'Dolar',
        hint: 'USD/TRY',
        change: usd?.changePercent ?? null,
        price: usd ? money(usd.price, 'TRY') : null,
      },
    ];
  }, [data, commodities]);

  return (
    <ul className="relative z-10 mt-8 grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const up = (card.change ?? 0) >= 0;
        return (
          <li
            key={card.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              {card.label}
            </p>
            <p
              className={cn(
                'mt-3 font-mono text-3xl font-semibold tabular-nums',
                card.change == null
                  ? 'text-[var(--muted)]'
                  : up
                    ? 'text-[var(--up)]'
                    : 'text-[var(--down)]'
              )}
            >
              {card.change == null ? '—' : formatPercent(card.change)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {card.price ? `${card.hint} · ${card.price}` : card.hint}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
