'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  PriceScaleMode,
  createChart,
  type IChartApi,
  type LogicalRange,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { HistoricalPricePoint } from '@/types';
import {
  bollingerSeries,
  emaSeries,
  macdSeries,
  rsiSeries,
  smaSeries,
  vwapSeries,
  type Series,
} from '@/lib/ta-series';

export type ChartType = 'candle' | 'line' | 'area';

export type IndicatorKey =
  | 'sma20'
  | 'sma50'
  | 'sma200'
  | 'ema21'
  | 'bb'
  | 'vwap'
  | 'volume'
  | 'rsi'
  | 'macd';

export const INDICATOR_META: Record<
  IndicatorKey,
  { label: string; color: string; pane: 'main' | 'sub'; intradayOnly?: boolean }
> = {
  sma20: { label: 'SMA 20', color: '#38bdf8', pane: 'main' },
  sma50: { label: 'SMA 50', color: '#a78bfa', pane: 'main' },
  sma200: { label: 'SMA 200', color: '#f59e0b', pane: 'main' },
  ema21: { label: 'EMA 21', color: '#f472b6', pane: 'main' },
  bb: { label: 'Bollinger', color: '#94a3b8', pane: 'main' },
  vwap: { label: 'VWAP', color: '#facc15', pane: 'main', intradayOnly: true },
  volume: { label: 'Hacim', color: '#64748b', pane: 'main' },
  rsi: { label: 'RSI 14', color: '#c084fc', pane: 'sub' },
  macd: { label: 'MACD', color: '#38bdf8', pane: 'sub' },
};

interface Bar {
  time: UTCTimestamp;
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ProChartProps {
  points: HistoricalPricePoint[];
  chartType: ChartType;
  indicators: ReadonlySet<IndicatorKey>;
  logScale: boolean;
  intraday: boolean;
  currencySymbol: string;
  height: number;
}

function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** lightweight-charts renders UTC; shift so the axis shows the viewer's local time. */
function toLocalTime(ts: number): UTCTimestamp {
  const offsetSec = -new Date(ts).getTimezoneOffset() * 60;
  return (Math.floor(ts / 1000) + offsetSec) as UTCTimestamp;
}

function toBars(points: HistoricalPricePoint[]): Bar[] {
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const out: Bar[] = [];
  let lastTime = -Infinity;
  for (const p of sorted) {
    if (!Number.isFinite(p.price) || p.price <= 0) continue;
    const time = toLocalTime(p.timestamp);
    if (time <= lastTime) continue; // strictly ascending, no duplicates
    lastTime = time;
    const close = p.price;
    const open = p.open && p.open > 0 ? p.open : close;
    const high = Math.max(p.high && p.high > 0 ? p.high : close, open, close);
    const low = Math.min(p.low && p.low > 0 ? p.low : close, open, close);
    out.push({ time, ts: p.timestamp, open, high, low, close, volume: p.volume ?? 0 });
  }
  return out;
}

function lineData(bars: Bar[], s: Series) {
  const out: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i < bars.length; i++) {
    const v = s[i];
    if (v != null && Number.isFinite(v)) out.push({ time: bars[i].time, value: v });
  }
  return out;
}

function fmtPrice(n: number): string {
  const digits = n >= 1000 ? 2 : n >= 1 ? 2 : 6;
  return n.toLocaleString('tr-TR', {
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  });
}

function fmtVol(n: number): string {
  return n.toLocaleString('tr-TR', { notation: 'compact', maximumFractionDigits: 1 });
}

function fmtDate(ts: number, intraday: boolean): string {
  return new Date(ts).toLocaleString('tr-TR', intraday
    ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProChart({
  points,
  chartType,
  indicators,
  logScale,
  intraday,
  currencySymbol,
  height,
}: ProChartProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);
  const bars = useMemo(() => toBars(points), [points]);
  const hasOhlc = useMemo(
    () => points.some((p) => p.open != null && p.high != null && p.low != null),
    [points]
  );
  const hasVolume = useMemo(() => bars.some((b) => b.volume > 0), [bars]);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const showRsi = indicators.has('rsi');
  const showMacd = indicators.has('macd');
  const effectiveType: ChartType = chartType === 'candle' && !hasOhlc ? 'area' : chartType;

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl || bars.length === 0) return;

    const text = cssVar('--muted', '#94a3b8');
    const grid = cssVar('--border', 'rgba(148,163,184,0.14)');
    const up = cssVar('--up', '#2dd4bf');
    const down = cssVar('--down', '#f43f5e');

    const base = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: text,
        fontSize: 11,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: text, style: LineStyle.Dashed, labelBackgroundColor: '#1e293b' },
        horzLine: { color: text, style: LineStyle.Dashed, labelBackgroundColor: '#1e293b' },
      },
      rightPriceScale: { borderColor: grid },
      timeScale: {
        borderColor: grid,
        timeVisible: intraday,
        secondsVisible: false,
        rightOffset: 4,
        barSpacing: 7,
        minBarSpacing: 0.5,
      },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    } as const;

    const charts: IChartApi[] = [];
    const panes: { chart: IChartApi; el: HTMLDivElement }[] = [];
    const subVisible = showRsi || showMacd;

    const main = createChart(mainEl, {
      ...base,
      width: mainEl.clientWidth,
      height,
      rightPriceScale: {
        borderColor: grid,
        mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
        scaleMargins: { top: 0.08, bottom: indicators.has('volume') && hasVolume ? 0.22 : 0.06 },
      },
      timeScale: { ...base.timeScale, visible: !subVisible },
      watermark: {
        visible: true,
        text: 'bullsye.app',
        color: 'rgba(148,163,184,0.07)',
        fontSize: 28,
        horzAlign: 'center',
        vertAlign: 'center',
      },
    });
    charts.push(main);
    panes.push({ chart: main, el: mainEl });

    const closes = bars.map((b) => b.close);
    const first = bars[0].close;
    const lastUp = bars[bars.length - 1].close >= first;
    const lineColor = lastUp ? up : down;

    if (effectiveType === 'candle') {
      const s = main.addCandlestickSeries({
        upColor: up,
        downColor: down,
        borderUpColor: up,
        borderDownColor: down,
        wickUpColor: up,
        wickDownColor: down,
        priceLineVisible: true,
      });
      s.setData(bars.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
    } else if (effectiveType === 'line') {
      const s = main.addLineSeries({ color: lineColor, lineWidth: 2 });
      s.setData(bars.map((b) => ({ time: b.time, value: b.close })));
    } else {
      const s = main.addAreaSeries({
        lineColor,
        lineWidth: 2,
        topColor: lastUp ? 'rgba(45,212,191,0.28)' : 'rgba(244,63,94,0.28)',
        bottomColor: 'rgba(0,0,0,0)',
      });
      s.setData(bars.map((b) => ({ time: b.time, value: b.close })));
    }

    const overlay = (s: Series, color: string, width: 1 | 2 = 1, style: LineStyle = LineStyle.Solid) => {
      const line = main.addLineSeries({
        color,
        lineWidth: width,
        lineStyle: style,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      line.setData(lineData(bars, s));
    };

    if (indicators.has('sma20')) overlay(smaSeries(closes, 20), INDICATOR_META.sma20.color);
    if (indicators.has('sma50')) overlay(smaSeries(closes, 50), INDICATOR_META.sma50.color);
    if (indicators.has('sma200')) overlay(smaSeries(closes, 200), INDICATOR_META.sma200.color);
    if (indicators.has('ema21')) overlay(emaSeries(closes, 21), INDICATOR_META.ema21.color);
    if (indicators.has('bb')) {
      const bb = bollingerSeries(closes, 20, 2);
      overlay(bb.upper, 'rgba(148,163,184,0.7)', 1, LineStyle.Dashed);
      overlay(bb.mid, 'rgba(148,163,184,0.45)', 1, LineStyle.Dotted);
      overlay(bb.lower, 'rgba(148,163,184,0.7)', 1, LineStyle.Dashed);
    }
    if (indicators.has('vwap') && intraday && hasVolume) {
      overlay(
        vwapSeries(bars.map((b) => ({ ...b, timestamp: b.ts }))),
        INDICATOR_META.vwap.color,
        2
      );
    }

    if (indicators.has('volume') && hasVolume) {
      const vol = main.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'vol',
        lastValueVisible: false,
        priceLineVisible: false,
      });
      vol.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      vol.setData(
        bars.map((b) => ({
          time: b.time,
          value: b.volume,
          color: b.close >= b.open ? 'rgba(45,212,191,0.35)' : 'rgba(244,63,94,0.35)',
        }))
      );
    }

    const subChart = (el: HTMLDivElement, h: number, last: boolean) => {
      const c = createChart(el, {
        ...base,
        width: el.clientWidth,
        height: h,
        timeScale: { ...base.timeScale, visible: last },
        rightPriceScale: { borderColor: grid, scaleMargins: { top: 0.1, bottom: 0.1 } },
      });
      charts.push(c);
      panes.push({ chart: c, el });
      return c;
    };

    if (showRsi && rsiRef.current) {
      const c = subChart(rsiRef.current, 110, !showMacd);
      const r = c.addLineSeries({
        color: INDICATOR_META.rsi.color,
        lineWidth: 1,
        priceLineVisible: false,
      });
      r.setData(lineData(bars, rsiSeries(closes, 14)));
      r.createPriceLine({ price: 70, color: 'rgba(244,63,94,0.6)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '' });
      r.createPriceLine({ price: 30, color: 'rgba(45,212,191,0.6)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '' });
    }

    if (showMacd && macdRef.current) {
      const c = subChart(macdRef.current, 120, true);
      const m = macdSeries(closes);
      const hist = c.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
      const histData: { time: UTCTimestamp; value: number; color: string }[] = [];
      for (let i = 0; i < bars.length; i++) {
        const v = m.hist[i];
        if (v != null) {
          histData.push({
            time: bars[i].time,
            value: v,
            color: v >= 0 ? 'rgba(45,212,191,0.5)' : 'rgba(244,63,94,0.5)',
          });
        }
      }
      hist.setData(histData);
      const ml = c.addLineSeries({ color: '#38bdf8', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      ml.setData(lineData(bars, m.macd));
      const sl = c.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      sl.setData(lineData(bars, m.signal));
    }

    // Keep all panes scrolled/zoomed together.
    let syncing = false;
    const unsubs: (() => void)[] = [];
    for (const src of charts) {
      const handler = (range: LogicalRange | null) => {
        if (syncing || !range) return;
        syncing = true;
        for (const dst of charts) if (dst !== src) dst.timeScale().setVisibleLogicalRange(range);
        syncing = false;
      };
      src.timeScale().subscribeVisibleLogicalRangeChange(handler);
      unsubs.push(() => src.timeScale().unsubscribeVisibleLogicalRangeChange(handler));
    }

    const timeIndex = new Map<number, number>();
    bars.forEach((b, i) => timeIndex.set(b.time as number, i));
    const onMove = (param: MouseEventParams<Time>) => {
      if (param.time == null) {
        setHoverIdx(null);
        return;
      }
      const i = timeIndex.get(param.time as number);
      setHoverIdx(i ?? null);
    };
    main.subscribeCrosshairMove(onMove);

    main.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      for (const p of panes) p.chart.applyOptions({ width: p.el.clientWidth });
    });
    ro.observe(mainEl);

    return () => {
      ro.disconnect();
      main.unsubscribeCrosshairMove(onMove);
      for (const u of unsubs) u();
      for (const c of charts) c.remove();
    };
  }, [bars, effectiveType, indicators, logScale, intraday, height, hasVolume, showRsi, showMacd]);

  if (bars.length === 0) return null;

  const idx = hoverIdx ?? bars.length - 1;
  const bar = bars[idx];
  const prev = idx > 0 ? bars[idx - 1].close : bar.open;
  const chg = prev > 0 ? ((bar.close - prev) / prev) * 100 : 0;
  const periodChg = bars[0].close > 0 ? ((bars[bars.length - 1].close - bars[0].close) / bars[0].close) * 100 : 0;
  const tone = (n: number) => (n >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]');

  return (
    <div className="w-full">
      <div className="mb-1 flex min-h-[1.25rem] flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] tabular-nums text-[var(--muted)] sm:text-xs">
        <span>{fmtDate(bar.ts, intraday)}</span>
        {effectiveType === 'candle' ? (
          <>
            <span>A <b className="font-medium text-[var(--foreground)]">{fmtPrice(bar.open)}</b></span>
            <span>Y <b className="font-medium text-[var(--foreground)]">{fmtPrice(bar.high)}</b></span>
            <span>D <b className="font-medium text-[var(--foreground)]">{fmtPrice(bar.low)}</b></span>
          </>
        ) : null}
        <span>
          K <b className="font-medium text-[var(--foreground)]">{currencySymbol}{fmtPrice(bar.close)}</b>
        </span>
        <span className={tone(chg)}>
          {chg >= 0 ? '+' : ''}
          {chg.toFixed(2)}%
        </span>
        {bar.volume > 0 ? <span>Hcm <b className="font-medium text-[var(--foreground)]">{fmtVol(bar.volume)}</b></span> : null}
        {hoverIdx == null ? (
          <span className={tone(periodChg)}>
            Dönem {periodChg >= 0 ? '+' : ''}
            {periodChg.toFixed(2)}%
          </span>
        ) : null}
      </div>
      <div ref={mainRef} style={{ height }} className="w-full" />
      {showRsi ? (
        <div className="mt-1 border-t border-[var(--border)]">
          <span className="block px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">RSI 14</span>
          <div ref={rsiRef} className="w-full" style={{ height: 110 }} />
        </div>
      ) : null}
      {showMacd ? (
        <div className="mt-1 border-t border-[var(--border)]">
          <span className="block px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">MACD 12 26 9</span>
          <div ref={macdRef} className="w-full" style={{ height: 120 }} />
        </div>
      ) : null}
    </div>
  );
}
