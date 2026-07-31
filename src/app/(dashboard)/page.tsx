'use client';

import { useMemo, useState } from 'react';
import { AIDailyVisionPanel } from '@/components/dashboard/AIDailyVisionPanel';
import { AIPotentialRadar } from '@/components/dashboard/AIPotentialRadar';
import { MarketSentimentMeter } from '@/components/dashboard/MarketSentimentMeter';
import { AlertModal } from '@/components/alerts/AlertModal';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import {
  ComparisonModal,
  ComparisonTrigger,
} from '@/components/dashboard/ComparisonModal';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import {
  CalendarTickerBanner,
  EconomicCalendar,
} from '@/components/dashboard/EconomicCalendar';
import { FearGreedIndex } from '@/components/dashboard/FearGreedIndex';
import { FxConverter } from '@/components/dashboard/FxConverter';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { ShareCardButton } from '@/components/dashboard/ShareCardButton';
import { AISignalRadar } from '@/components/dashboard/AISignalRadar';
import { SmartRadar } from '@/components/dashboard/SmartRadar';
import { StockScorecard } from '@/components/dashboard/StockScorecard';
import { TickerTape } from '@/components/dashboard/TickerTape';
import { WatchlistTable } from '@/components/dashboard/WatchlistTable';
import { MarketScannerTable } from '@/components/dashboard/MarketScannerTable';
import { DynamicTitle } from '@/components/shared/DynamicTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlerts } from '@/hooks/useAlerts';
import {
  DEFAULT_WIDGET_ORDER,
  useDashboardLayout,
} from '@/hooks/useDashboardLayout';
import { useBist, useCrypto, useFx } from '@/hooks/useMarketData';
import { useMarketScanner } from '@/hooks/useMarketScanner';
import { useWatchlist } from '@/hooks/useWatchlist';
import {
  buildDailyVision,
  buildPotentialCards,
  computeMarketSentiment,
} from '@/lib/ai-opportunity';
import type { DashboardWidgetId } from '@/types';
import { formatPrice } from '@/lib/utils';

const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  'fear-greed': 'Fear & Greed',
  'smart-radar': 'Günün Radarı',
  metrics: 'Metrikler',
  'chart-fx': 'Grafik & FX',
  watchlist: 'Watchlist',
  news: 'Haberler',
  signals: 'Sinyal Radarı',
  calendar: 'Ekonomik Takvim',
};

export default function OverviewPage() {
  const { symbols, removeSymbol } = useWatchlist();
  const layout = useDashboardLayout();

  const bistSymbols = useMemo(
    () =>
      symbols
        .filter((s) => s.endsWith('.IS') || s.startsWith('XU'))
        .join(','),
    [symbols]
  );
  const cryptoSymbols = useMemo(() => {
    const list = symbols.filter((s) => s.endsWith('USDT'));
    return list.length ? list.join(',') : undefined;
  }, [symbols]);

  const bist = useBist(bistSymbols || undefined);
  const crypto = useCrypto(cryptoSymbols);
  const fx = useFx();
  const scanner = useMarketScanner();
  const { alerts } = useAlerts();

  const [alertTarget, setAlertTarget] = useState<{
    symbol: string;
    displaySymbol: string;
    price: number;
    changePercent: number;
  } | null>(null);
  const [scoreSymbol, setScoreSymbol] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const quotes = bist.data?.quotes ?? [];
  const tickers = crypto.data?.tickers ?? [];
  const rates = fx.data?.rates ?? [];

  const index = quotes.find((q) => q.symbol.includes('XU100'));
  const btc = tickers.find((t) => t.symbol === 'BTCUSDT');
  const usd = rates.find((r) => r.code === 'USD');

  const activeAlerts = useMemo(
    () => new Set(alerts.filter((a) => a.triggered).map((a) => a.displaySymbol)),
    [alerts]
  );

  const marketItems = scanner.data ?? [];
  const dailyVision = useMemo(
    () => (marketItems.length ? buildDailyVision(marketItems) : null),
    [marketItems]
  );
  const potentialCards = useMemo(
    () => buildPotentialCards(marketItems, 6),
    [marketItems]
  );
  const sentiment = useMemo(
    () => (marketItems.length ? computeMarketSentiment(marketItems) : null),
    [marketItems]
  );

  const tapeItems = [
    ...quotes.map((q) => {
      const display = q.symbol.replace('.IS', '');
      return {
        symbol: display,
        price: q.price,
        changePercent: q.changePercent,
        alertActive: activeAlerts.has(display),
      };
    }),
    ...tickers.map((t) => {
      const display = t.symbol.replace('USDT', '');
      return {
        symbol: display,
        price: t.price,
        changePercent: t.changePercent,
        alertActive: activeAlerts.has(display),
      };
    }),
  ];

  const watchRows = [
    ...quotes.map((q) => ({
      symbol: q.symbol,
      name: q.name,
      price: q.price,
      changePercent: q.changePercent,
      currency: q.currency,
    })),
    ...tickers.map((t) => ({
      symbol: t.symbol,
      name: t.symbol.replace('USDT', '/USDT'),
      price: t.price,
      changePercent: t.changePercent,
      currency: 'USD',
    })),
  ];

  const signalSymbols = useMemo(() => {
    const fromWatch = symbols.filter(
      (s) => s.endsWith('.IS') || s.endsWith('USDT')
    );
    if (fromWatch.length) return fromWatch;
    return ['THYAO.IS', 'GARAN.IS', 'ASELS.IS', 'BTCUSDT'];
  }, [symbols]);

  function renderWidget(id: DashboardWidgetId) {
    switch (id) {
      case 'fear-greed':
        return <FearGreedIndex />;
      case 'smart-radar':
        return <SmartRadar symbols={signalSymbols} />;
      case 'metrics':
        return (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {index ? (
              <div className="relative">
                <div className="absolute right-2 top-2 z-10">
                  <ShareCardButton
                    title="BİST 100"
                    price={index.price}
                    changePercent={index.changePercent}
                    currency={index.currency}
                  />
                </div>
                <MetricCard
                  title="BİST 100"
                  value={index.price}
                  changePercent={index.changePercent}
                  currency={index.currency}
                  onClick={() =>
                    setAlertTarget({
                      symbol: index.symbol,
                      displaySymbol: 'XU100',
                      price: index.price,
                      changePercent: index.changePercent,
                    })
                  }
                />
              </div>
            ) : null}
            {btc ? (
              <div className="relative">
                <div className="absolute right-2 top-2 z-10">
                  <ShareCardButton
                    title="Bitcoin"
                    price={btc.price}
                    changePercent={btc.changePercent}
                    currency="USD"
                  />
                </div>
                <MetricCard
                  title="Bitcoin"
                  value={btc.price}
                  changePercent={btc.changePercent}
                  currency="USD"
                  onClick={() =>
                    setAlertTarget({
                      symbol: btc.symbol,
                      displaySymbol: 'BTC',
                      price: btc.price,
                      changePercent: btc.changePercent,
                    })
                  }
                />
              </div>
            ) : null}
            {usd ? (
              <MetricCard
                title="USD/TRY"
                value={usd.forexSelling}
                currency="TRY"
                subtitle={fx.data?.updatedAt}
              />
            ) : null}
          </div>
        );
      case 'chart-fx':
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartPanel
              title="BİST 100"
              symbol="XU100.IS"
              source="yahoo"
              isPositive={(index?.changePercent ?? 0) >= 0}
            />
            <Card>
              <CardHeader>
                <CardTitle>FX & Gold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rates.map((r) => (
                  <div
                    key={r.code}
                    className="flex items-center justify-between border-b border-zinc-800 py-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{r.code}</p>
                      <p className="text-xs text-zinc-500">{r.name}</p>
                    </div>
                    <div className="text-right text-sm tabular-nums">
                      <p>{formatPrice(r.forexSelling, 'TRY')}</p>
                      <p className="text-xs text-zinc-500">
                        Alış {formatPrice(r.forexBuying, 'TRY')}
                      </p>
                    </div>
                  </div>
                ))}
                {!rates.length && (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    {fx.isLoading
                      ? 'Loading…'
                      : fx.error?.message ?? 'No FX data'}
                  </p>
                )}
                {rates.length ? <FxConverter rates={rates} /> : null}
              </CardContent>
            </Card>
          </div>
        );
      case 'watchlist':
        return (
          <div className="space-y-4">
            <MarketScannerTable
              items={scanner.data ?? []}
              isLoading={scanner.isLoading}
              error={scanner.error?.message}
              title="Market Screener Terminal"
            />
            <div>
              <h2 className="mb-3 text-sm font-medium text-zinc-400">
                Kişisel Watchlist — BİST satırı → Temel Analiz Karnesi
              </h2>
              <WatchlistTable
                rows={watchRows}
                onRowClick={(row) => {
                  if (
                    row.symbol.endsWith('.IS') &&
                    !row.symbol.includes('XU')
                  ) {
                    setScoreSymbol(row.symbol);
                  }
                }}
                onAlert={(row) =>
                  setAlertTarget({
                    symbol: row.symbol,
                    displaySymbol: row.symbol
                      .replace('.IS', '')
                      .replace('USDT', ''),
                    price: row.price,
                    changePercent: row.changePercent,
                  })
                }
                onRemove={removeSymbol}
              />
            </div>
          </div>
        );
      case 'news':
        return <NewsFeed />;
      case 'signals':
        return (
          <AISignalRadar
            marketItems={scanner.data ?? []}
            isLoading={scanner.isLoading}
            freeCount={3}
          />
        );
      case 'calendar':
        return <EconomicCalendar />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <DynamicTitle
        symbol="XU100"
        price={index?.price}
        changePercent={index?.changePercent}
        currencySymbol="₺"
      />
      <CalendarTickerBanner />
      <TickerTape items={tapeItems} />

      <AIDailyVisionPanel
        report={dailyVision}
        loading={scanner.isLoading}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <AIPotentialRadar
          cards={potentialCards}
          loading={scanner.isLoading}
        />
        <div className="xl:sticky xl:top-4">
          <MarketSentimentMeter
            reading={sentiment}
            loading={scanner.isLoading}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Piyasa özeti, radar ve kişisel paneller
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ComparisonTrigger onClick={() => setCompareOpen(true)} />
          <Button
            type="button"
            variant={layout.editing ? 'default' : 'outline'}
            onClick={() => layout.setEditing(!layout.editing)}
          >
            {layout.editing ? 'Bitir' : 'Düzenle'}
          </Button>
          {layout.editing ? (
            <Button type="button" variant="ghost" onClick={layout.reset}>
              Sıfırla
            </Button>
          ) : null}
        </div>
      </div>

      {layout.editing ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          {DEFAULT_WIDGET_ORDER.map((id) => {
            const on = !layout.hidden.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => layout.toggleHidden(id)}
                className={`rounded-md border px-2 py-1 text-xs ${
                  on
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-zinc-700 text-zinc-500'
                }`}
              >
                {on ? '✓ ' : ''}
                {WIDGET_LABELS[id]}
              </button>
            );
          })}
          <p className="w-full text-[11px] text-zinc-600">
            Sürüklemek için tutamacı kullanın · gizle/göster için rozetlere tıklayın
          </p>
        </div>
      ) : null}

      <DashboardCanvas
        ids={layout.visible}
        editing={layout.editing}
        onReorder={layout.move}
        render={renderWidget}
      />

      <StockScorecard
        symbol={scoreSymbol}
        open={Boolean(scoreSymbol)}
        onOpenChange={(o) => !o && setScoreSymbol(null)}
      />
      <ComparisonModal open={compareOpen} onOpenChange={setCompareOpen} />
      {alertTarget ? (
        <AlertModal
          open={Boolean(alertTarget)}
          onOpenChange={(o) => !o && setAlertTarget(null)}
          symbol={alertTarget.symbol}
          displaySymbol={alertTarget.displaySymbol}
          currentPrice={alertTarget.price}
          changePercent={alertTarget.changePercent}
        />
      ) : null}
    </div>
  );
}
