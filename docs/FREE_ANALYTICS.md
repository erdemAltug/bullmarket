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

## PostHog panoları (kod olarak)

`scripts/posthog-dashboards.ts` üç pano kurar: **Büyüme**, **Ürün kullanımı**,
**E-posta & dönüşüm** (25 grafik). Tekrar çalıştırmak güvenlidir; eksik grafikleri ekler.

1. PostHog → Settings → Personal API keys → yeni anahtar
   (scope: Insight **write**, Dashboard **write**, Query **read**; proje: Bullsye)
2. Çalıştır (anahtar sadece bu komutta kalır, dosyaya yazılmaz):

   ```bash
   POSTHOG_PERSONAL_API_KEY=phx_xxx npm run analytics:dashboards
   ```

   PowerShell: `$env:POSTHOG_PERSONAL_API_KEY="phx_xxx"; npm run analytics:dashboards`

### Event sözlüğü

| Event | Ne zaman | Önemli alanlar |
|---|---|---|
| `signup_completed` | Yeni hesap (Google dahil), ilk oturumda bir kez | `path` |
| `landing_signup_click` | Ana sayfa kayıt butonu | `where` |
| `watchlist_add` / `watchlist_remove` | İzleme listesi | `symbol`, `source` |
| `alert_create` | Alarm kuruldu | `kind`, `symbol`, `storage` |
| `alert_email_sent` | Alarm e-postası gitti (sunucu) | `source`: cron / tab |
| `inventory_add` | Envantere pozisyon | `symbol`, `source` |
| `digest_subscribe` / `digest_unsubscribe` | Sabah özeti | — |
| `digest_sent` | Sabah özeti gönderimi (sunucu) | `subscribers`, `sent` |
| `softgate_view` / `_click` / `_dismiss` | Kayıt banner A/B | `variant` |
| `pro_waitlist_join` | Pro bekleme listesi | `source` |
| `search_open` / `search_select` | Arama | — |
