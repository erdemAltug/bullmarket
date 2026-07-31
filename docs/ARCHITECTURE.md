# BullMarket — Architecture

## Overview

Personal financial monitoring platform for **BİST**, **global stocks**, **crypto**, and **FX/gold**.

```text
External Sources → Next.js Route Handlers (+ cache) → React Query → Dashboard UI
```

| Layer | Responsibility |
|-------|----------------|
| External APIs | Yahoo Finance, Binance, TCMB |
| Route Handlers | Normalize, rate-limit shield, TTL cache |
| React Query | Client polling (`refetchInterval: 15s`) |
| UI | Metric cards, charts, watchlists, ticker |

## Directory Layout

```text
src/
├── app/
│   ├── api/
│   │   ├── bist/route.ts
│   │   ├── crypto/route.ts
│   │   └── fx/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── bist/page.tsx
│   │   └── crypto/page.tsx
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── cache.ts
│   ├── utils.ts
│   └── api/
│       ├── yahoo.ts
│       ├── binance.ts
│       └── tcmb.ts
└── types/
    └── index.ts
```

## Data Flow

1. Client hooks call `/api/*` via React Query.
2. Route handler checks `appCache` (NodeCache, default TTL **15s**).
3. On miss: adapter fetches external source → normalize → cache → JSON.
4. Client refetches every **15s**; UI derives up/down from `changePercent`.

## Caching Strategy

| Key pattern | TTL | Source |
|-------------|-----|--------|
| `bist:quote:{symbol}` | 15s | Yahoo |
| `bist:index` | 30s | Yahoo |
| `crypto:tickers` | 15s | Binance |
| `fx:rates` | 60s | TCMB |

Redis (`ioredis`) is optional later; `node-cache` is the default singleton in `lib/cache.ts`.

## Conventions

- Strict TypeScript; shared shapes in `types/index.ts`.
- Adapters never import UI; routes only talk to `lib/api/*`.
- All API responses: `{ success: boolean, data?: T, error?: string }`.
- Diffs over rewrites; keep modules small and single-purpose.
