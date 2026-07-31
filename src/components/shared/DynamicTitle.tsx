'use client';

import { useEffect } from 'react';

const DEFAULT_TITLE =
  'Bullseye — BİST, Kripto & Finansal Analiz Terminali';

interface DynamicTitleProps {
  symbol?: string;
  price?: number;
  changePercent?: number;
  currencySymbol?: string;
  enabled?: boolean;
}

export function DynamicTitle({
  symbol = 'XU100',
  price,
  changePercent,
  currencySymbol = '₺',
  enabled = true,
}: DynamicTitleProps) {
  useEffect(() => {
    // Static routes keep Next.js metadata titles untouched
    if (!enabled) return;

    if (price == null || Number.isNaN(price)) {
      document.title = DEFAULT_TITLE;
      return;
    }

    const direction =
      changePercent == null ? '●' : changePercent >= 0 ? '🟢' : '🔴';
    const formattedPrice = price.toLocaleString('tr-TR', {
      maximumFractionDigits: 2,
    });
    const formattedChange =
      changePercent == null
        ? ''
        : ` (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;

    document.title = `${direction} ${symbol} ${currencySymbol}${formattedPrice}${formattedChange} | Bullseye`;

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [symbol, price, changePercent, currencySymbol, enabled]);

  return null;
}
