'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { Quote } from '@/types';
import { formatCompact, formatPercent, formatPrice } from '@/lib/utils';

interface HeatNode {
  name: string;
  size: number;
  changePercent: number;
  price: number;
  volume?: number;
  trailingPE?: number;
  marketCap?: number;
  fill: string;
  [key: string]: string | number | undefined;
}

function heatColor(change: number): string {
  if (change >= 3) return '#16a34a';
  if (change >= 1) return '#22c55e';
  if (change > 0) return '#4ade80';
  if (change === 0) return '#3f3f46';
  if (change > -1) return '#f87171';
  if (change > -3) return '#ef4444';
  return '#b91c1c';
}

function toNodes(quotes: Quote[], sizeBy: 'marketCap' | 'volume'): HeatNode[] {
  return quotes
    .map((q) => {
      const size =
        sizeBy === 'marketCap'
          ? q.marketCap || q.volume || Math.abs(q.price) || 1
          : q.volume || q.marketCap || Math.abs(q.price) || 1;
      return {
        name: q.symbol.replace('.IS', ''),
        size,
        changePercent: q.changePercent,
        price: q.price,
        volume: q.volume,
        trailingPE: q.trailingPE,
        marketCap: q.marketCap,
        fill: heatColor(q.changePercent),
      };
    })
    .filter((n) => n.size > 0);
}

function CustomContent(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  changePercent?: number;
  fill?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name, changePercent, fill } = props;
  if (width < 36 || height < 28) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill, stroke: '#09090b', strokeWidth: 2 }}
        rx={4}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 6}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        fontWeight={600}
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="rgba(255,255,255,0.85)"
        fontSize={11}
      >
        {formatPercent(changePercent ?? 0)}
      </text>
    </g>
  );
}

interface HeatmapTreemapProps {
  quotes: Quote[];
  sizeBy: 'marketCap' | 'volume';
}

export function HeatmapTreemap({ quotes, sizeBy }: HeatmapTreemapProps) {
  const data = toNodes(quotes, sizeBy);

  return (
    <div className="h-[560px] w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="#09090b"
          fill="#18181b"
          content={<CustomContent />}
          isAnimationActive={false}
        >
          <Tooltip
            content={({ payload }) => {
              const item = payload?.[0]?.payload as HeatNode | undefined;
              if (!item) return null;
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
                  <p className="mb-1 font-semibold text-zinc-100">{item.name}</p>
                  <p>Fiyat: {formatPrice(item.price, 'TRY')}</p>
                  <p>Değişim: {formatPercent(item.changePercent)}</p>
                  <p>
                    F/K:{' '}
                    {item.trailingPE != null
                      ? item.trailingPE.toFixed(2)
                      : '—'}
                  </p>
                  <p>
                    Hacim:{' '}
                    {item.volume != null ? formatCompact(item.volume) : '—'}
                  </p>
                  <p>
                    Piyasa değ.:{' '}
                    {item.marketCap != null
                      ? formatCompact(item.marketCap)
                      : '—'}
                  </p>
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
