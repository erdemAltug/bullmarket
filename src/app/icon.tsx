import { ImageResponse } from 'next/og';

/** ≥48px recommended for Google Search favicon. */
export const size = { width: 96, height: 96 };
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
          background: '#181c25',
          borderRadius: 20,
          border: '3px solid rgba(20,184,166,0.5)',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
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
