'use client';

import { useEffect } from 'react';

interface DynamicTitleProps {
  symbol?: string;
  price?: number;
  changePercent?: number;
  currencySymbol?: string;
  enabled?: boolean;
}

/** Live-price prefix we add: "🟢 ₺295,5 +1,46% · ". */
const PREFIX_RE = /^(?:🟢|🔴|●) [^·]* · /u;

function stripPrefix(title: string) {
  return title.replace(PREFIX_RE, '');
}

/**
 * Prefixes the live price to the page's own title instead of replacing it,
 * so the keyword title from metadata stays in the rendered DOM (Google reads
 * it) while the browser tab still shows the move at a glance.
 */
export function DynamicTitle({
  price,
  changePercent,
  currencySymbol = '₺',
  enabled = true,
}: DynamicTitleProps) {
  useEffect(() => {
    if (!enabled || price == null || Number.isNaN(price)) return;

    const direction =
      changePercent == null ? '●' : changePercent >= 0 ? '🟢' : '🔴';
    const formattedPrice = price.toLocaleString('tr-TR', {
      maximumFractionDigits: 2,
    });
    const formattedChange =
      changePercent == null
        ? ''
        : ` ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

    const base = stripPrefix(document.title);
    document.title = `${direction} ${currencySymbol}${formattedPrice}${formattedChange} · ${base}`;

    return () => {
      document.title = stripPrefix(document.title);
    };
  }, [price, changePercent, currencySymbol, enabled]);

  return null;
}
