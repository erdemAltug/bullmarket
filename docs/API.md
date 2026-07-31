# BullMarket — API Reference

Base path: `/api`. All handlers return JSON.

## Response Envelope

```ts
type ApiResponse<T> =
  | { success: true; data: T; cached?: boolean }
  | { success: false; error: string };
```

---

## `GET /api/fundamentals`

Yahoo `quoteSummary` scorecard for one symbol.

| Query | Required | Description |
|-------|----------|-------------|
| `symbol` | yes | e.g. `THYAO.IS` |

**Data:** `StockFundamentals` (F/K, PD/DD, 52w, ROE, mcap)

---

## `GET /api/news`

Google News RSS proxy (BİST / Crypto / Macro). Cached 120s.

---

## `GET /api/signals`

RSI(14) + SMA(50) crossover scan.

| Query | Required | Description |
|-------|----------|-------------|
| `symbols` | yes | Comma list, max 8 |

---

## `GET /api/calendar`

Curated economic calendar events (TCMB, CPI, Fed, …).

---

## `GET /api/history`


OHLC close series for charts (Yahoo or Binance).

| Query | Type | Default | Description |
|-------|------|---------|-------------|
| `symbol` | string | — | Required. e.g. `XU100.IS` or `BTCUSDT` |
| `source` | `yahoo` \| `binance` | `yahoo` | Data provider |
| `timeframe` | `1D` \| `5D` \| `1M` \| `6M` \| `1Y` \| `YTD` \| `ALL` | `1D` | Range + interval mapping |

**Data:** `{ symbol, timeframe, points: HistoricalPricePoint[] }`

TTL: 30s for 1D/5D, 120s otherwise.

---

## `GET /api/bist`

BİST quotes and optional index snapshot via Yahoo Finance.

| Query | Type | Default | Description |
|-------|------|---------|-------------|
| `symbols` | string | `XU100.IS,THYAO.IS,GARAN.IS,ASELS.IS` | Comma-separated Yahoo symbols |
| `history` | `1d` \| `5d` \| `1mo` | — | Optional sparkline history for first symbol |

**Data:** `Quote[]` or `{ quotes: Quote[]; history?: HistoricalPricePoint[] }`

---

## `GET /api/crypto`

Binance 24h tickers (USDT pairs).

| Query | Type | Default | Description |
|-------|------|---------|-------------|
| `symbols` | string | `BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT` | Comma-separated Binance symbols |
| `orderbook` | string | — | Optional symbol for depth (`limit=10`) |

**Data:** `{ tickers: CryptoTicker[]; orderbook?: OrderBook }`

---

## `GET /api/fx`

TCMB daily FX + gold (Gram Altın derived when available).

| Query | Type | Default | Description |
|-------|------|---------|-------------|
| `codes` | string | `USD,EUR,GBP` | Currency codes |

**Data:** `{ rates: FxRate[]; updatedAt: string }`

---

## Cache Headers

Handlers may set `Cache-Control: public, s-maxage=15, stale-while-revalidate=30`.
Server-side `node-cache` remains the primary rate-limit shield.
