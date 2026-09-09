# Programmatic SEO & ISR growth architecture

## Route matrix (BİST)

```
/bist/[symbol]                 → karne & skor
/bist/[symbol]/hedef-fiyat    → analist konsensüs
/bist/[symbol]/temettu        → verim + DRIP
/bist/[symbol]/bilanco        → F/K & rasyo
/karsilastir/[a]-vs-[b]        → peer X vs Y
```

Hubs: `/bist/f-k-en-dusuk-hisseler`, `/bist/yuksek-temettu-verenler-2026`,
`/bist/halka-arz-takvimi`, `/nasdaq/yapay-zeka-hisseleri`,
`/kripto/balina-hareketleri-ve-trendler`.

## ISR policy

| Surface | `generateStaticParams` | `dynamicParams` | `revalidate` |
|---------|------------------------|-----------------|--------------|
| Popular top 100 | yes | true | 300–86400 |
| Long-tail | on-demand | true | 86400 |

Constants: `src/lib/seo/matrix.ts`.

## Zero-cost data path

```
Nightly / first-hit
  Yahoo EOD + quoteSummary
    → appCache (`analysis:`, `history:`, fundamentals)
    → ISR HTML (CDN)

Detail pages MUST prefer cache hits; never fan-out live Yahoo in render loops.
Batch future: write EOD JSON/SQLite → read-only at request time.
```

Universe: `scanner-universe` + `long-tail-bist.ts` → `SEO_BIST_TICKERS`.

## Sitemaps

Index: `/sitemap.xml` → `sitemap-main.xml`, `sitemap-bist-1.xml`…,
`sitemap-nasdaq-1.xml`…, `sitemap-crypto.xml`, `sitemap-karsilastir.xml`.

Chunk size: `SITEMAP_CHUNK_SIZE` (1000).

## Viral OG

`GET /api/og/bist/[symbol]?page=karne|temettu|bilanco` — `next/og` (Satori),
Node runtime. Share CTA: `ShareScorecardButton`.

## Growth widgets

- `SymbolSocialProof` — stable daily interest band (hash; label honesty)
- `StickyInventoryWidget` — lot/cost → guest portfolio
- `SymbolMatrixNav` — internal link juice across 4 intents
