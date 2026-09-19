# SEO Düzeltme Planı (GSC: konum ~43, CTR %0.1)

**Tarih:** 2026-09-19  
**Kaynak:** Search Console (son 3 ay) + kod audit  
**Hedef:** Kanibalizasyon / teknik gürültüyü temizle; CTR ve long-tail sıralama için zemin.

---

## Teşhis (özet)

| Sinyal | Yorum |
|--------|--------|
| ~7.1K gösterim, 10 tık, %0.1 TO | Keşif var; snippet veya konum tıklatmıyor |
| Ortalama konum 43 | Sayfa 4–5 bandı; ortalama platosu normal |
| ~2.7k indexable URL | pSEO iskeleti kurulu; otorite + unique intent eksik |

TradingView/Investing brand sorgularında üst sıra bekleme. Kazanım: `sembol + temettü/bilanço/hedef/karşılaştır`.

---

## Faz A — Teknik (bu sprint)

### A1. Intent başına farklı title
| Route | Title kuralı |
|-------|----------------|
| `/bist/{SYM}` | `{SYM} Analiz Skoru, Canlı Fiyat ve Grafik {year} \| Bullsye` |
| `/bist/{SYM}/hedef-fiyat` | `{SYM} Hedef Fiyat {year}, Analist Konsensüsü \| Bullsye` |
| `/bist/{SYM}/temettu` | (mevcut — OK) |
| `/bist/{SYM}/bilanco` | (mevcut — OK) |
| `/nasdaq/{SYM}` | `{SYM} NASDAQ Canlı Fiyat ve Analiz Skoru \| Bullsye` |
| `/kripto/{SYM}` | `{DISPLAY} Canlı Fiyat, Skor ve Grafik \| Bullsye` |

### A2. Sitemap duplicate kaldır
- Index’ten `sitemap-bist.xml` + `sitemap-nasdaq.xml` çıkar
- Sadece shard’lar: `sitemap-bist-1..3`, `sitemap-nasdaq-1`
- Eski URL’ler route olarak kalabilir (404 etme); index’te olmasın

### A3. FAQ JSON-LD kapsamı
- Root layout’tan sitewide `FAQPage` kaldır
- FAQ + SoftwareApplication yalnızca homepage (`(marketing)/page`)
- Hub FAQ’ları `HubSeoBlock` üzerinden kalsın

### A4. Default OG
- `/og-image.png` rewrite zaten `/api/og` (`next.config.ts`) — çalışıyor
- Marketing + root metadata tutarlı absolute OG URL
- NASDAQ / kripto sembol sayfalarına `/api/og?symbol=` ekle

---

## Faz B — GSC operasyon (manuel, kod yok)

1. Sorgular: konum **8–20**, gösterim >50 → title rewrite listesi
2. Sayfalar: CTR düşük + konum ≤15 → meta rewrite
3. Haftalık KPI: Top-20 URL sayısı, `/temettu`+`/bilanco`+`/karsilastir` tık payı  
   _(Ortalama konum tek başına takip etme)_

---

## Faz C — İçerik / CTR (sonraki)

- Hub gövdesi: F/K, temettü, halka arz — 400–800 kelime + tablo
- Compare çiftlerini sektörel büyüt (~48 → ~100+)
- Guest nav’da SEO hub linklerini aç (crawl path)
- Heatmap layout’a canonical + OG ekle

---

## Faz D — Otorite (sürekli)

- Haftalık 1–2 MD (egitim/blog) → tool CTA
- Skor OG paylaşımı (Discord / X / forum)
- Brand sorgularını kovalama; long-tail üret

---

## Uygulama checklist

- [x] Bu doküman
- [x] A1 title ayrımı
- [x] A2 sitemap index temizliği
- [x] A3 FAQ scope
- [x] A4 OG (nasdaq/kripto + homepage SchemaMarkup)
- [ ] Deploy sonrası GSC sitemap yeniden gönder
- [ ] 2 hafta sonra Top-20 / CTR kontrol

---

## Dosya haritası

```
docs/SEO_FIXES_2026-09.md
src/lib/seo/sitemaps.ts
src/app/layout.tsx
src/app/(marketing)/page.tsx
src/components/seo/SchemaMarkup.tsx
src/app/(dashboard)/bist/[symbol]/page.tsx
src/app/(dashboard)/bist/[symbol]/hedef-fiyat/page.tsx
src/app/(dashboard)/nasdaq/[symbol]/page.tsx
src/app/(dashboard)/kripto/[symbol]/page.tsx
```
