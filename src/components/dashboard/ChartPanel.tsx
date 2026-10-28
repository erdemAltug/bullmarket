'use client';

import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaChart,
  CandlestickChart,
  LineChart,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from 'lucide-react';
import { ChartTimeframeTabs } from '@/components/dashboard/ChartTimeframeTabs';
import {
  INDICATOR_META,
  type ChartType,
  type IndicatorKey,
} from '@/components/charts/ProChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useChartHistory } from '@/hooks/useMarketData';
import { isIntraday, type ChartTimeframe } from '@/lib/chart-timeframes';
import { cn } from '@/lib/utils';

// lightweight-charts touches window/canvas: load it only in the browser,
// and only when a chart is actually on screen.
const ProChart = dynamic(() => import('@/components/charts/ProChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

interface ChartPanelProps {
  title: string;
  symbol: string;
  source?: 'yahoo' | 'binance' | 'tefas';
  isPositive?: boolean;
  currencySymbol?: string;
  defaultTimeframe?: ChartTimeframe;
  height?: number;
  detailed?: boolean;
}

const PREF_KEY = 'bullsye_chart_prefs_v1';
const DEFAULT_INDICATORS: IndicatorKey[] = ['volume', 'sma20', 'sma50'];
const ALL_INDICATORS = Object.keys(INDICATOR_META) as IndicatorKey[];
const NO_INDICATORS: ReadonlySet<IndicatorKey> = new Set();

type Prefs = { type: ChartType; indicators: IndicatorKey[]; log: boolean };

function readPrefs(): Prefs | null {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      type: p.type === 'line' || p.type === 'area' ? p.type : 'candle',
      indicators: (p.indicators ?? DEFAULT_INDICATORS).filter((k): k is IndicatorKey =>
        ALL_INDICATORS.includes(k as IndicatorKey)
      ),
      log: Boolean(p.log),
    };
  } catch {
    return null;
  }
}

function writePrefs(p: Prefs) {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {
    /* private mode — preferences just don't persist */
  }
}

const TYPE_OPTIONS: { value: ChartType; label: string; Icon: typeof LineChart }[] = [
  { value: 'candle', label: 'Mum', Icon: CandlestickChart },
  { value: 'line', label: 'Çizgi', Icon: LineChart },
  { value: 'area', label: 'Alan', Icon: AreaChart },
];

function ChartPanelInner({
  title,
  symbol,
  source = 'yahoo',
  currencySymbol = '₺',
  defaultTimeframe = '1D',
  height = 380,
  detailed = true,
}: ChartPanelProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>(
    source === 'tefas' && isIntraday(defaultTimeframe) ? '3M' : defaultTimeframe
  );
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [active, setActive] = useState<IndicatorKey[]>(DEFAULT_INDICATORS);
  const [logScale, setLogScale] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = readPrefs();
    if (p) {
      setChartType(p.type);
      setActive(p.indicators);
      setLogScale(p.log);
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const save = useCallback(
    (next: Partial<Prefs>) => {
      writePrefs({ type: chartType, indicators: active, log: logScale, ...next });
    },
    [chartType, active, logScale]
  );

  const toggleIndicator = (k: IndicatorKey) => {
    const next = active.includes(k) ? active.filter((x) => x !== k) : [...active, k];
    setActive(next);
    save({ indicators: next });
  };

  const toggleFullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => undefined);
  };

  const indicatorSet = useMemo(() => new Set(active), [active]);
  const { data, isFetching, isError, error } = useChartHistory(symbol, timeframe, source);
  const points = data?.points ?? [];
  const intraday = isIntraday(timeframe);
  const chartHeight = fullscreen ? Math.max(320, Math.round(window.innerHeight * 0.62)) : height;

  return (
    <Card ref={shellRef} className={cn(fullscreen && 'overflow-auto rounded-none bg-[var(--background)]')}>
      <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="truncate">{title}</CardTitle>
        <div className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:pb-0">
          <ChartTimeframeTabs
            value={timeframe}
            onChange={setTimeframe}
            hideIntraday={source === 'tefas'}
          />
          {detailed ? (
            <>
              <div className="inline-flex shrink-0 rounded-lg border border-[var(--border)] p-0.5" role="radiogroup" aria-label="Grafik tipi">
                {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={chartType === value}
                    title={label}
                    onClick={() => {
                      setChartType(value);
                      save({ type: value });
                    }}
                    className={cn(
                      'inline-flex size-8 items-center justify-center rounded-md transition',
                      chartType === value
                        ? 'bg-[var(--surface)] text-[var(--foreground)]'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="sr-only">{label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition',
                  menuOpen
                    ? 'border-[var(--accent)]/50 text-[var(--foreground)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                İndikatör
                <span className="rounded bg-[var(--surface)] px-1 font-mono text-[10px]">{active.length}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogScale((v) => !v);
                  save({ log: !logScale });
                }}
                aria-pressed={logScale}
                className={cn(
                  'h-9 shrink-0 rounded-lg border px-3 font-mono text-xs font-semibold transition',
                  logScale
                    ? 'border-[var(--accent)]/50 text-[var(--foreground)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
                title="Logaritmik ölçek"
              >
                LOG
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                title={fullscreen ? 'Tam ekrandan çık' : 'Tam ekran'}
              >
                {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {detailed && menuOpen ? (
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-2">
            {ALL_INDICATORS.map((k) => {
              const meta = INDICATOR_META[k];
              const on = active.includes(k);
              const unavailable = meta.intradayOnly && !intraday;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleIndicator(k)}
                  aria-pressed={on}
                  title={unavailable ? 'Sadece gün içi zaman aralıklarında' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition',
                    on
                      ? 'border-[var(--foreground)]/25 text-[var(--foreground)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]',
                    unavailable && 'opacity-50'
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        ) : null}
        {points.length ? (
          <ProChart
            points={points}
            chartType={detailed ? chartType : 'area'}
            indicators={detailed ? indicatorSet : NO_INDICATORS}
            logScale={logScale}
            intraday={intraday}
            currencySymbol={currencySymbol}
            height={chartHeight}
          />
        ) : isFetching ? (
          <ChartSkeleton />
        ) : isError ? (
          <EmptyState icon={LineChart} title="Grafik yüklenemedi" description={error.message} />
        ) : (
          <EmptyState
            icon={LineChart}
            title="Grafik verisi yok"
            description="Bu zaman aralığı için veri bulunamadı."
          />
        )}
        <p className="mt-2 text-[10px] text-[var(--muted)]">
          {source === 'binance'
            ? 'Kaynak: Binance · gerçek zamanlıya yakın'
            : source === 'tefas'
              ? 'Kaynak: TEFAS · günlük pay değeri'
              : 'Kaynak: Yahoo Finance · borsa verisi 15 dk gecikmeli olabilir'}
          {' · '}sürükleyerek kaydır, tekerlek ya da iki parmakla yakınlaştır
        </p>
      </CardContent>
    </Card>
  );
}

export const ChartPanel = memo(ChartPanelInner);
