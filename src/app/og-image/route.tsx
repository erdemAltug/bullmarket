import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(145deg, #134e4a 0%, #12151c 42%, #181c25 100%)',
          color: '#e8edf5',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              border: '3px solid rgba(45,212,191,0.55)',
              background: '#181c25',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="#2dd4bf"
                strokeWidth="1.75"
                opacity="0.35"
              />
              <circle
                cx="16"
                cy="16"
                r="7.5"
                stroke="#2dd4bf"
                strokeWidth="1.75"
                opacity="0.7"
              />
              <circle cx="16" cy="16" r="3" fill="#2dd4bf" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              BULLS
              <span style={{ color: '#2dd4bf' }}>YE</span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 6,
                color: 'rgba(45,212,191,0.85)',
              }}
            >
              HIT THE MARKET
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 34,
            fontWeight: 700,
            maxWidth: 900,
            lineHeight: 1.25,
          }}
        >
          Canlı Borsa · AI Sinyaller · Analist Hedefleri
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 22,
            color: '#94a3b8',
            maxWidth: 860,
          }}
        >
          BİST 100, NASDAQ ve Kripto için ücretsiz yapay zeka analiz terminali
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: '#64748b',
          }}
        >
          bullsye.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
