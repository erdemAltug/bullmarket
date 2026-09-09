# Free analytics pipeline (Bullsye)

Sıfır lisans maliyetiyle `/bist/[symbol]` gelişmiş analitik.

## Sources

| Domain | Source | Cost |
|--------|--------|------|
| EOD price / FX | Yahoo Finance (`fetchHistory`, `TRY=X`) | Free |
| Fundamentals / targets | Yahoo `quoteSummary` | Free |
| Peers | `lib/sector-peers.ts` + fundamentals | Free |
| TÜFE | `lib/analysis/tr-tufe-index.ts` (EVDS-ready table) | Free |

## Flow

```
Client SymbolAnalysisView
  → GET /api/analysis?symbol=THYAO.IS
    → appCache key `analysis:symbol:{yahoo}` TTL 86400
    → buildSymbolAnalysisBundle()
        history 1Y + TRY=X + fundamentals + ≤3 peers
```

## Modules

- A Real return (TL / USD / TÜFE) — recharts line
- B Health radar — 5 axes from ROE/growth/PE discount/SMA/RSI
- C Peer bars — PE, PB, 1Y, dividend yield
- D Dividend + DRIP slider (yield proxy years)
- E Analyst target gauge
- F SMA + Fib levels + one-line summary

## UI

`SymbolAnalysisIsland` → dynamic `ssr:false` + skeleton. Mobile: horizontal tabs. Each module footer: inventory add + terminal alert link.

## Honesty

Temettü yıllık çubukları ve TÜFE tablosu yaklaşık / proxy; UI `sourceNote` ile işaretlenir. Canlı lisanslı Level-2 veri yok.
