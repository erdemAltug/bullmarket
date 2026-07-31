import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050508',
          borderRadius: 8,
          border: '1px solid rgba(16,185,129,0.35)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: -1,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          BY
        </div>
      </div>
    ),
    { ...size }
  );
}
