import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = (searchParams.get('symbol') || 'BULL').toUpperCase();
  const price = searchParams.get('price') || '—';
  const change = searchParams.get('change') || '0.00%';
  const positive = !change.trim().startsWith('-');
  const accent = positive ? '#34d399' : '#fb7185';
  const label = searchParams.get('label') || 'Bullseye Terminal';

  // Decorative sparkline points
  const spark = [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 35, 42];
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const w = 420;
  const h = 80;
  const points = spark
    .map((v, i) => {
      const x = (i / (spark.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #050508 0%, #0a0a12 50%, #071a14 100%)',
          padding: 56,
          fontFamily: 'system-ui, sans-serif',
          color: '#fafafa',
          border: '1px solid #27272a',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#064e3b',
                border: '1px solid rgba(16,185,129,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              BE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>
                BULLSEYE
              </span>
              <span style={{ fontSize: 12, color: '#71717a', letterSpacing: 3 }}>
                {label}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              color: accent,
              border: `1px solid ${accent}55`,
              background: `${accent}22`,
              padding: '8px 14px',
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {change}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 28, color: '#a1a1aa', fontWeight: 600 }}>
            {symbol}
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              color: accent,
              lineHeight: 1,
            }}
          >
            {price}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <svg width={w} height={h} style={{ display: 'flex' }}>
            <polyline
              fill="none"
              stroke={accent}
              strokeWidth="3"
              points={points}
            />
          </svg>
          <span style={{ fontSize: 14, color: '#52525b' }}>bullseye.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
