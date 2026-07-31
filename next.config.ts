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
  // Keep visited/prefetched tab pages in the client router cache → instant back/forth
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

export default nextConfig;
