# BullMarket — Data Flow

```text
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Yahoo Finance   │   │ Binance REST    │   │ TCMB today.xml  │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         ▼                     ▼                     ▼
   lib/api/yahoo.ts      lib/api/binance.ts     lib/api/tcmb.ts
         │                     │                     │
         └──────────┬──────────┴──────────┬──────────┘
                    ▼                     ▼
            app/api/bist            app/api/crypto
            app/api/fx
                    │
                    ▼
              lib/cache.ts  (NodeCache TTL 15–60s)
                    │
                    ▼
         hooks/useMarketData.ts  (React Query 15s)
                    │
                    ▼
    MetricCard · PriceChart · WatchlistTable · TickerTape
```

## Polling

| Client | Interval | Server cache |
|--------|----------|--------------|
| `useBist` | 15s | 15s |
| `useCrypto` | 15s | 15s |
| `useFx` | 15s | 60s |

Duplicate client polls within TTL hit `cached: true` and skip upstream calls.
