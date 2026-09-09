import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { fetchQuotes } from '@/lib/api/yahoo';
import { socialProofFor } from '@/lib/seo/social-proof';
import { toYahooSymbol } from '@/lib/seo/symbols';

/** Scorecard OG — next/og (Satori). Node runtime: Edge bundle limit. */
export const runtime = 'nodejs';
export const revalidate = 300;

type Props = { params: Promise<{ symbol: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const symbol = (await params).symbol.toUpperCase().replace(/\.IS$/i, '');
  const page = new URL(request.url).searchParams.get('page') || 'karne';
  const yahoo = toYahooSymbol(symbol);

  let price = '—';
  let change = '0.00%';
  let positive = true;
  let name = symbol;
  try {
    const [q] = await fetchQuotes([yahoo]);
    if (q) {
      name = (q.name || symbol).slice(0, 28);
      price = `₺${q.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
      change = `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%`;
      positive = q.changePercent >= 0;
    }
  } catch {
    /* decorative fallback */
  }

  const proof = socialProofFor(symbol);
  const accent = positive ? '#34d399' : '#fb7185';
  const pageLabel =
    page === 'temettu'
      ? 'Temettü karnesi'
      : page === 'bilanco'
        ? 'Bilanço karnesi'
        : page === 'hedef-fiyat'
          ? 'Hedef fiyat'
          : 'Analiz karnesi';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(145deg, #050508 0%, #0a0a12 45%, #071a14 100%)',
          padding: 52,
          fontFamily: 'system-ui, sans-serif',
          color: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>
              BULLSYE
            </span>
            <span style={{ fontSize: 18, color: '#a1a1aa' }}>{pageLabel}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#064e3b',
              color: '#34d399',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            BY
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
            {symbol}
          </span>
          <span style={{ fontSize: 26, color: '#a1a1aa' }}>{name}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 700 }}>{price}</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: accent }}>
              {change}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 16, color: '#71717a' }}>
              24s ilgi · {proof.views24h.toLocaleString('tr-TR')} inceleme
            </span>
            <span style={{ fontSize: 16, color: '#71717a' }}>
              Envanter bandı · {proof.inventoryHolders}
            </span>
          </div>
          <span style={{ fontSize: 18, color: '#52525b' }}>
            bullsye.app/bist/{symbol}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
