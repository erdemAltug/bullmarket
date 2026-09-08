# Bullsye — Envanter Aha PRD  
**Ürün:** bullsye.app · **Odak:** sayfa içi değer & akış (bildirimler kapsam dışı)  
**Tarih:** 8 Eylül 2026 · **Durum:** Ready for build (P0–P1)

---

## 0. Tek cümle konumlandırma

> **Grafiğe boğulma, kendi envanterini gör.**  
> Borsa portföyün, nakit yastığın ve AI fırsat radarı tek sayfada.

| Değil | Evet |
|-------|------|
| TradingView rakibi / mum terminali | Kişisel finans envanteri + karar bağlamı |
| “Al/sat sinyali sat” | Skor + konsensüs + *senin lotun* |
| Kayıtsız = boş ürün | Guest LocalStorage envanter; kayıt = senkron |

**Hook (landing + terminal üst şerit):**  
*Sermaye piyasası herkese aynı grafiği verir. Bullsye senin lotunu, maliyetini ve mevduatını yanına koyar.*

---

## 1. Sorun → Çözüm

### Sorun
Misafir `/terminal` veya Cmd+K ile girince: screener, radar, haber, takvim, grafik — **odak dağılır**. Envanter (`/portfolio`) ayrı sayfada; “neden buradayım?” 30 sn’de cevaplanmıyor.

### Çözüm (ürün kancası)
İlk etkileşim = **tek sembol → 3 kartlık Fırsat Karnesi**, sonra **guest envanter**, sonra soft gate. Derin terminal ikincil; **Envanter Dashboard** birincil sabah rutini.

### North-star outcome
Misafir 30 sn içinde: (1) bir hisse skorunu anladı, (2) lot/maliyet veya mevduat girdi, (3) Portföy Röntgeni gördü.  
DAU motoru: **her sabah envanter + röntgen + 1 contextual insight**.

---

## 2. Persona & Jobs-to-be-Done

| Persona | JTBD | Başarı anı |
|---------|------|------------|
| **Sabah gözlemcisi** (TR, BİST) | “Elimdeki ve izlediklerim bugün ne durumda?” | Röntgen + 1 insight < 20 sn |
| **Nakit yastıklı** | “Faiz vs hisse: hangisi önde?” | Mevduat vs portföy sayacı |
| **Meraklı ziyaretçi** | “THYAO’ya bakayım, abone olmadan” | 3 kart + “kaç lotun var?” CTA |

YMYL: her kartta *yatırım tavsiyesi değildir*; skor açıklaması somut metrik, emir dili yok.

---

## 3. User flows

### F1 — 30 sn Aha (guest, arama)

```
[Landing / Terminal]
    → Cmd+K veya arama: "THYAO"
    → OpportunitySheet (drawer/modal, grafik DEĞİL varsayılan)
         ├─ Card A: AI Fırsat Skoru 0–100 + 3 neden satırı
         ├─ Card B: 12ay konsensüs + upside bar
         └─ Card C: "Kaç lot? Maliyet?" → guest add
    → ilk varlık → PortfolioXray açılır (inline)
    → SoftGateBanner (2. varlık VEYA reload) — agresif popup YOK
```

### F2 — Guest envanter (LocalStorage)

```
addPosition (guest) → localStorage `bullsye_portfolio_v1`
    → Xray recompute
    → event: inventory_add (PostHog)
reload → hydrate guest
2. add VEYA session revive → SoftGateBanner
Google/email auth → merge guest → Neon (mevcut watchlist/alert merge pattern)
```

### F3 — Günlük DAU döngüsü (signed-in veya guest dolu)

```
/portfolio (veya Terminal üstünde Envanter özeti)
    → NetWorthStrip
    → VsDepositCounter ("hisse bu ay mevduatı ±X aştı")
    → Xray (nakit/hisse/mevduat + çeşitlilik)
    → InsightRail (max 3 contextual, companion kuralları)
    → Pozisyon listesi (ikincil)
```

---

## 4. Bilgi mimarisi & UI hiyerarşisi

### Sayfa önceliği (guest)
1. **Fırsat Karnesi** (arama sonucu)  
2. **Envanter / Röntgen** (`/portfolio` + terminal sticky özet)  
3. Fırsat masası / BİST hub (keşif)  
4. Mum grafik / screener (derinlik — collapse veya “Grafik göster”)

### Component tree (P0)

```
OpportunitySheet
├── ScoreCard          // 0–100 + ScoreReason[] (3 satır)
├── ConsensusCard      // mean / high / low / upside bar
└── MatchCTA           // lot + maliyet → usePortfolio.add

PortfolioXray
├── TotalValue
├── CashCushionBar     // % hisse / % nakit+mevduat
└── DiversificationScore // yoğunlaşma uyarısı

SoftGateBanner         // envanter kartının ÜSTÜNDE, dismiss 24h

InventoryDashboard (/portfolio redesign)
├── SoftGateBanner?
├── NetWorthStrip
├── VsDepositCounter
├── PortfolioXray
├── InsightRail        // buildCompanionNotes + yeni kurallar
└── PositionTable + AddForm
```

### Veri kaynakları
| Kart | Kaynak | Not |
|------|--------|-----|
| AI skor + 3 neden | `/api/smart-radar` veya scanner item + lokal reason builder | Nedenler deterministik; LLM yok |
| Konsensüs | `fetchFundamentals` / mevcut AnalystTargetCard | |
| Guest envanter | `usePortfolio` LocalStorage (zaten guest path var mı kontrol) | Yoksa genişlet |
| Vs mevduat | pozisyon PnL ay + depositRatePct | Basit annualize/30 |

---

## 5. Score reason kuralları (örnek THYAO)

Skor 0–100 mevcut fırsat algoritmasından; **neden satırları** ayrı kural seti (max 3):

1. Değer: F/K vs sektör peer medyanı → *"%24 F/K sektör iskontosu"*  
2. Akış: 48s hacim vs 20g ort → *"Son 48 saatte hacim kırılımı"*  
3. Hedef: (mean−price)/price → *"Konsensüs hedefe göre +%38 marj"*  

Eksik veri → satır atlanır; asla uydurma. Fallback: RSI bandı / 52w konum.

---

## 6. Soft gate kuralları

| Tetik | UI | Kopya |
|-------|-----|-------|
| 2. varlık eklendi | Banner üst envanter | “Rakamlarını cihazlar arasında kaybetmemek için Google ile tek tıkla kaydet” |
| Sayfa yenileme + guest ≥1 pozisyon | Aynı banner | Aynı |
| Dismiss | `localStorage bullsye_softgate_dismiss` 24s | |
| Asla | Tam ekran agresif modal, scroll trap | |

Kayıt sonrası: mevcut merge (`migrate anonymous watchlist/alerts`) + portfolio merge.

---

## 7. Metrikler (başarı)

| Metrik | Tanım | Hedef (90g) | Event |
|--------|--------|-------------|--------|
| **Search-to-Add** | Arama/sheet açan → envanter veya watchlist add | ≥ %18 | `search_open` → `inventory_add` \| `watchlist_add` |
| **D1 Retention** | Gün 0 envanter oluşturan → D1 geri | ≥ %25 | `inventory_first_add` + session D1 |
| **D7 Retention** | Aynı kohort D7 | ≥ %12 | |
| **Guest-to-Auth** | Guest envanter (≥1) → Google/email | ≥ %8 | `auth_success` + `had_guest_inventory` |
| **Xray view rate** | İlk add sonrası Xray görünür | ≥ %80 | `xray_view` |
| **Insight click** | InsightRail CTA tık | ≥ %10 session | `insight_click` |

North-star proxy: **Haftalık aktif envanter kullanıcısı** (WAIU) = en az 1 `/portfolio` veya Xray view / hafta.

---

## 8. Release planı

| Sprint | Teslim |
|--------|--------|
| **P0** | OpportunitySheet + ScoreReason + MatchCTA; guest add; PortfolioXray; SoftGateBanner |
| **P1** | InventoryDashboard layout; VsDepositCounter; InsightRail genişletme; PostHog funnel |
| **P2** | Terminal üst sticky “Envanter özeti”; grafik secondary; A/B soft gate kopyası |

Kapsam dışı (bilinçli): push/email bildirim, WebSocket, ücretli plan.

---

## 9. Riskler

| Risk | Mitigasyon |
|------|------------|
| Skor “tavsiye” algısı | Disclaimer + neden = gözlemlenebilir metrik |
| Guest veri kaybı | Soft gate + export JSON (P1) |
| Terminal kullanıcı kaybı | Derin araçlar collapsible, silinmez |
| SEO çatışması | Landing hook envanter; sembol sayfaları ayrı niyet |

---

## 10. Kabul kriterleri (P0)

1. Guest THYAO arar → 3 kart, mum varsayılan kapalı.  
2. Lot+maliyet ekler → Xray toplam / nakit oranı / çeşitlilik görünür.  
3. 2. varlık veya reload → SoftGateBanner; dismiss çalışır.  
4. Auth → guest pozisyonlar kaybolmaz.  
5. Hiçbir kart “al/sat” emri vermez.
