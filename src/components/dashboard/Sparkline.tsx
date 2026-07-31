'use client';

import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  positive?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  positive = true,
  className,
  width = 96,
  height = 28,
}: SparklineProps) {
  if (!data.length) {
    return <div className={cn('mx-auto', className)} style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const pts = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1 || 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const stroke = positive ? '#34d399' : '#fb7185';
  const fillId = `sp-${positive ? 'up' : 'dn'}-${data[0]?.toFixed(4)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('mx-auto overflow-visible', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#${fillId})`}
        points={`${pad},${height - pad} ${pts} ${width - pad},${height - pad}`}
      />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}
