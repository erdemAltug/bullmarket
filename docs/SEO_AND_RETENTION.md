# SEO & On-Site Retention — Bullsye

## Goal

Search’ten gelen ziyaretçiyi **terminal alışkanlığına** çevirmek: içerik → canlı araç CTA → ertesi gün rutin.

## Content pipeline

| Path | Role |
|------|------|
| `content/egitim/*.md` | Eğitim dersleri (frontmatter + `##` bölümler) |
| `content/blog/*.md` | Blog yazıları |
| `src/lib/content/load-md.ts` | gray-matter + section parser |
| `src/content/academy.ts` | Statik TS + MD merge (`mergeBySlug`) |
| `src/content/types.ts` | Paylaşılan tipler (client-safe) |

Yeni yazı eklemek: ilgili klasöre `.md` koy → build/sitemap otomatik alır. Aynı `slug` hem TS hem MD’de varsa **MD kazanır**.

### Frontmatter (örnek)

```yaml
---
slug: ornek-ders
category: teknik-analiz          # sadece egitim
categoryTitle: Teknik Analiz & AI Sinyalleri
title: ...
description: ...
keywords: [a, b]
level: orta                      # egitim
tags: [a]                        # blog
publishedAt: '2026-08-02'
updatedAt: '2026-08-02'
readingMinutes: 6
toolCta:
  href: /firsatlar
  label: ...
  blurb: ...
faqs:
  - question: ...
    answer: ...
---

## Bölüm başlığı

Paragraf...

- madde
```

## Hub SEO (crawlable)

Client hub sayfalarının layout’una `HubSeoBlock` eklendi:

- `/bist` → BİST rehber + FAQ JSON-LD + iç linkler
- `/signals` → sinyal okuma + eğitim/blog köprüleri
- `/fon` → TEFAS/ETF + ders linki

## Retention loop

1. **SEO landing** (egitim/blog/hub FAQ)
2. **Tool CTA** (`toolCta` → `/firsatlar`, `/signals`, `/fon`, heatmap…)
3. **Daily ritual** (blog: 10 dk rutin) + Fırsat streak/FOMO
4. **Return path** (Overview genişlik + radar)

Her yeni MD’de mutlaka `toolCta` olsun; çıplak makale bırakmayın.

## Priority keywords (TR)

- AI fırsat skoru / fırsat radarı
- BİST canlı / ısı haritası
- ücretsiz AI sinyal / RSI
- TEFAS fon / ETF seçimi
- piyasa genişliği / boğa eğilimi
- günlük borsa rutini

## Do / Don’t

- Do: gerçek araçlara link, FAQ schema, haftalık 1–2 MD
- Don’t: sahte fiyat, vendor marka (Yahoo vb.) kullanıcı metninde, CTA’sız uzun yazı
