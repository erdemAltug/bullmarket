import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Avoid Turbopack panic on non-ASCII path segments (e.g. Masaüstü)
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'bullsye.app' },
      { protocol: 'https', hostname: 'www.bullsye.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/terminal',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [{ source: '/og-image.png', destination: '/og-image' }];
  },
  async headers() {
    return [
      {
        source: '/fonts/:file*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

export default nextConfig;
