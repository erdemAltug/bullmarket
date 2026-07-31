import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #064e3b 0%, #050508 55%, #09090b 100%)',
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -2,
            fontFamily: 'system-ui, sans-serif',
            textShadow: '0 0 24px rgba(16,185,129,0.55)',
          }}
        >
          BY
        </div>
      </div>
    ),
    { ...size }
  );
}
