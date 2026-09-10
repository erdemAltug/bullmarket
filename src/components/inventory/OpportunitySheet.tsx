'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OpportunitySheetBody } from '@/components/inventory/OpportunitySheetBody';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { scoreOpportunity } from '@/lib/ai-opportunity';
import { trackEvent } from '@/lib/analytics';
import { buildScoreReasons } from '@/lib/score-reasons';
import type { ApiResponse, StockFundamentals } from '@/types';
import type { MarketAsset, MarketAssetQuote } from '@/types/market-asset';
import type { ScannerItem } from '@/types/scanner';

type OpportunitySheetProps = {
  asset: MarketAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SheetData = {
  quote: MarketAssetQuote;
  score: number;
  reasons: { id: string; label: string }[];
  consensus: {
    mean: number | null;
    high: number | null;
    low: number | null;
    upsidePct: number | null;
    price: number;
  };
  fundamentalsSymbol: string;
};

function yahooSymbolFor(asset: MarketAsset): string {
  if (asset.category === 'bist') {
    return asset.quoteId.includes('.IS')
      ? asset.quoteId
      : `${asset.symbol}.IS`;
  }
  if (asset.category === 'crypto') return asset.quoteId;
  return asset.quoteId || asset.symbol;
}

function toScannerItem(
  asset: MarketAsset,
  quote: MarketAssetQuote,
  pe: number | null
): ScannerItem {
  const category =
    asset.category === 'bist'
      ? 'BIST'
      : asset.category === 'crypto'
        ? 'CRYPTO'
        : asset.category === 'us'
          ? 'US'
          : 'ETF';
  return {
    symbol: quote.symbol,
    displaySymbol: asset.symbol,
    name: quote.name || asset.name,
    price: quote.price,
    changePercent: quote.changePercent,
    volume: '—',
    volumeRaw: 0,
    category,
    market: asset.exchange,
    currency: asset.category === 'bist' ? 'TRY' : 'USD',
    sparkline: [],
    chartSymbol: yahooSymbolFor(asset),
    chartSource: asset.category === 'crypto' ? 'binance' : 'yahoo',
    trailingPE: pe,
  };
}

async function loadSheet(asset: MarketAsset): Promise<SheetData | null> {
  const quoteRes = await fetch(
    `/api/market/asset/${encodeURIComponent(asset.quoteId)}`
  );
  const quoteJson = (await quoteRes.json()) as ApiResponse<MarketAssetQuote>;
  if (!quoteJson.success || !quoteJson.data) return null;
  const quote = quoteJson.data;

  let fundamentals: StockFundamentals | null = null;
  const ySym = yahooSymbolFor(asset);
  if (asset.category === 'bist' || asset.category === 'us') {
    try {
      const fRes = await fetch(
        `/api/fundamentals?symbol=${encodeURIComponent(ySym)}`
      );
      const fJson = (await fRes.json()) as ApiResponse<StockFundamentals>;
      if (fJson.success) fundamentals = fJson.data;
    } catch {
      fundamentals = null;
    }
  }

  const pe = fundamentals?.trailingPE ?? null;
  const item = toScannerItem(asset, quote, pe);
  const score = scoreOpportunity(item);
  const mean = fundamentals?.analyst?.targetMean ?? null;
  const high = fundamentals?.analyst?.targetHigh ?? null;
  const low = fundamentals?.analyst?.targetLow ?? null;
  const price = quote.price;
  const upsidePct =
    mean != null && price > 0 ? ((mean - price) / price) * 100 : null;

  let reasons = buildScoreReasons({
    pe,
    price,
    targetMean: mean,
    volume48h: null,
    volume20dAvg: null,
  });

  if (reasons.length < 3 && quote.changePercent !== 0) {
    reasons = [
      ...reasons,
      {
        id: 'day-chg',
        label: `Günlük değişim ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(1)}%`,
      },
    ].slice(0, 3);
  }
  if (!reasons.length) {
    reasons = [
      {
        id: 'live',
        label: 'Canlı kotasyon alındı — skor teknik bant + değerleme karışımı',
      },
    ];
  }

  return {
    quote,
    score,
    reasons,
    consensus: { mean, high, low, upsidePct, price },
    fundamentalsSymbol: ySym,
  };
}

export function OpportunitySheet({
  asset,
  open,
  onOpenChange,
}: OpportunitySheetProps) {
  const { addPosition, positions } = usePortfolio({ enabled: open });
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!open || !asset) {
      setData(null);
      setError(null);
      setAdded(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    trackEvent('opportunity_sheet_open', {
      symbol: asset.symbol,
      category: asset.category,
    });
    void loadSheet(asset)
      .then((d) => {
        if (cancelled) return;
        if (!d) setError('Veri alınamadı');
        else setData(d);
      })
      .catch(() => {
        if (!cancelled) setError('Veri alınamadı');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, asset]);

  function handleAdd(input: { quantity: number; buyPrice: number }) {
    if (!asset) return;
    const prevCount = positions.length;
    const isCrypto = asset.category === 'crypto';
    const isUs = asset.category === 'us';
    addPosition({
      symbol: isCrypto
        ? asset.quoteId.toUpperCase()
        : asset.category === 'bist'
          ? `${asset.symbol.toUpperCase()}.IS`
          : asset.symbol.toUpperCase(),
      name: data?.quote.name || asset.name,
      assetClass: isCrypto ? 'crypto' : 'bist',
      buyPrice: input.buyPrice,
      quantity: input.quantity,
      date: new Date().toISOString().slice(0, 10),
      currency: isCrypto || isUs ? 'USD' : 'TRY',
    });
    trackEvent('inventory_add', {
      symbol: asset.symbol,
      source: 'opportunity_sheet',
      was_empty: prevCount === 0,
      count_after: prevCount + 1,
    });
    if (prevCount === 0) {
      trackEvent('inventory_first_add', { symbol: asset.symbol });
    }
    setAdded(true);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-full border-[var(--border)] bg-[var(--popover-bg)] p-0 sm:max-w-md md:max-w-lg">
        <div className="flex h-full flex-col overflow-y-auto p-4 pb-8 sm:p-5">
          <SheetTitle className="sr-only">
            {asset ? `${asset.symbol} analiz karnesi` : 'Analiz karnesi'}
          </SheetTitle>

          {loading ? (
            <p className="py-12 text-center text-sm text-[var(--muted)]">
              Fırsat karnesi yükleniyor…
            </p>
          ) : error ? (
            <p className="py-12 text-center text-sm text-rose-400">{error}</p>
          ) : asset && data ? (
            <>
              <OpportunitySheetBody
                symbol={
                  asset.category === 'bist'
                    ? `${asset.symbol}.IS`
                    : asset.quoteId
                }
                displaySymbol={asset.symbol}
                score={data.score}
                reasons={data.reasons}
                consensus={data.consensus}
                onAdd={handleAdd}
              />
              {added ? (
                <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  Envantere eklendi.{' '}
                  <Link
                    href="/portfolio"
                    className="font-semibold underline underline-offset-2"
                    onClick={() => onOpenChange(false)}
                  >
                    Portföy Röntgeni’ne git
                  </Link>
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4 text-sm">
                <Link
                  href={asset.href}
                  className="text-[var(--accent)] hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Detay sayfası / grafik
                </Link>
                <Link
                  href="/firsatlar"
                  className="text-[var(--muted)] hover:text-[var(--foreground)]"
                  onClick={() => onOpenChange(false)}
                >
                  Skor özeti
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
