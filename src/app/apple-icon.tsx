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
          background: 'linear-gradient(145deg, #134e4a 0%, #181c25 55%, #12151c 100%)',
          borderRadius: 40,
        }}
      >
        <svg width="110" height="110" viewBox="0 0 32 32" fill="none">
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
    ),
    { ...size }
  );
}
