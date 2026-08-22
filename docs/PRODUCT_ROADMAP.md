# Bullsye — Ürün, SEO ve Gelir Yol Haritası

**Kapsam:** [bullsye.app/terminal](https://bullsye.app/terminal) ve çevresindeki ürün yüzeyi  
**Tarih:** 22 Ağustos 2026  
**Kaynaklar:** canlı terminal, mevcut kod/nav, Search Console (son ~6 ay), büyüme planı

---

## 0. Yönetici özeti

Bullsye, Türkiye’de **ücretsiz sabah karar terminali** olarak doğru nişte: BİST + kripto + fırsat skoru + alarm. Ürün “çok şey yapan dashboard”; büyüme henüz “çok az tıklanan snippet”.

Search Console (property: `https://bullsye.app/`):

| Metrik | Değer | Yorum |
|--------|--------|--------|
| Gösterim | ~2.640 | Google indeksliyor; Ağustos’ta günlük ~200–600 gösterim |
| Tıklama | **2** | Neredeyse sıfır talep yakalama |
| Ort. CTR | **%0,1** | Snippet (başlık/açıklama) veya niyet uyumsuzluğu |
| Ort. konum | **42,3** | 4–5. sayfa; tıklama için çok geride |
| Görünen sorgu | `analist tavsiyeleri ve hedef fiyatları` | Üründe `/targets` var; Google muhtemelen zayıf başlıklı sayfaları gösteriyor |

**Tek cümle teşhis:** Envanter (sayfa + özellik) enflasyonu var; **niyet–sayfa–snippet** hizası yok. Terminal SEO landing değil, *alışkanlık ürünü*. Organik 1 numara, terminal URL’sinden değil **sorgu başına bir kazanma sayfasından** gelir.

**90 günlük başarı:** 3 kümede (hedef fiyat, BİST canlı rutin, fırsat/tarama) en az 5 URL top-20; kayıtlı kullanıcıda D1 dönüş > %15; ücret henüz yok, **ücretlenebilir alışkanlık** kanıtı var.

---

## 1. Ürün gezisi — Terminal ne?

### 1.1 Kullanıcıya vaat

Sidebar ve landing aynı hikâyeyi söylüyor: *Hit the market* — BİST, NASDAQ, kripto, döviz; AI fırsat, sinyal, analist hedefi, temettü, portföy doktoru, alarm.

Terminal (`/terminal`) fiilen **kişisel sabah masası**:

1. Alışkanlık ipucu (10 dk rutin)
2. Ticker + emtia/kur şeridi
3. Günlük tarama özeti (skor, fırsat sayısı, genişlik)
4. Fırsat radarı kartları
5. Fear & Greed, günün radarı
6. BİST 100 grafik + FX
7. Market screener tablosu + watchlist
8. Haber / KAP, sinyal radarı, ekonomik takvim

Teknik: 15 sn HTTP polling (WebSocket yok — BİST/Yahoo için doğru). Kayıt: misafir tarama + hisse; derin AI/alarm için kayıt modalı (açık beta ücretsiz).

### 1.2 Güçlü yanlar

- **Karar odaklılık:** Ham kotasyon değil skor, bant, genişlik, alarm.
- **TR-first:** BİST + TL kur + KAP/haber + temettü.
- **Ücretsiz giriş:** Abonelik duvarı yok; kayıt = senkron ve derinlik.
- **İçerik iskeleti:** Blog + eğitim + FAQ schema + programatik `/bist/THYAO` tipi sayfalar.
- **YMYL duruşu:** Footer’da yatırım tavsiyesi değil uyarısı net.

### 1.3 Zayıf yanlar (ürün)

| Sorun | Neden önemli |
|-------|----------------|
| **Bilişsel yük** | 5 nav grubu, ~20 destinasyon. “Bugün ne bakayım?” cevabı gömülü. |
| **Terminal SEO başlığı** | `Terminal \| Bullsye` — Google’da tıklanmaz. GSC’deki analist sorgusu bu tür zayıf title’larla eşleşiyor olabilir. |
| **Crawl anında boş tablo** | “Yükleniyor… / Piyasa taranıyor…” — bot ve ilk boya zayıf. SSR/önbellekli özet yok. |
| **İngilizce kırıkları** | “Loading…”, “Watchlist”, “Fear & Greed”, “Overview” TR kullanıcıda güven kırar. |
| **Çift yüzey** | Overview’da screener + `/bist` + `/firsatlar` + `/signals` örtüşüyor. Hangisi “kaynak”? |
| **Skor şeffaflığı** | “AI fırsat skoru” iddiası YMYL’de metodoloji sayfası olmadan kırılgan. |
| **Paylaşım zayıf** | Share kart var; viral döngü (günün 3 fırsatı → sosyal) ürünleşmemiş. |
| **Mobil** | Alt bar 4–5 öğe; terminal kaydırma denizi. Sabah 10 dk iddiası mobilde kanıtlanmamış. |

### 1.4 Rakip çerçevesi (bilinçli kaçış)

Yarışılmayan: Investing, TradingView, Bigpara **marka araması**.  
Yarışılacak: “BİST 100 canlı nasıl bakılır”, “hisse hedef fiyat”, “temettü verimi”, “RSI alım sinyali”, “AI fırsat skoru”.

[Terminal](https://bullsye.app/terminal) bir *araç*; Google 1 numara olmak *araç sayfasının* değil **niyet sayfasının** işi.

---

## 2. Büyüme matematiği (GSC gerçeği)

```
Gösterim ↑  (Ağustos spike)     →  indeksleme çalışıyor
Konum ~42                       →  rekabet / thin content / yanlış kanonik
CTR %0,1                        →  title/description veya yanlış sayfa
Tıklama ≈ 0                     →  henüz iş modeli yok; trafik yoksa ücret yok
```

**Sonuç:** Önce tıklama (snippet + niyet), sonra oturum (ürün), sonra kayıt (alarm/skor), sonra para (Pro). Sıra tersine çevrilmez.

Görünen sorgu `analist tavsiyeleri ve hedef fiyatları` için **kazanan URL `/targets` olmalı**, `/terminal` değil. Terminal bu sorguda 42. sırada bile çıksa CTR ölür çünkü snippet “Terminal” der, “hedef fiyat” demez.

---

## 3. Ürün stratejisi — ne eklemeli, ne kesmeli

### 3.1 Kes / birleştir (önce bunu yap)

1. **Varsayılan sabah görünümü:** Terminal açılışında tek sütun: genişlik + top 5 fırsat + 1 alarm CTA. Screener, haber, takvim accordion veya “Düzenle” arkasında kalsın.
2. **Nav sadeleştirme (misafir):** Terminal, Fırsat, BİST, Sinyal, Öğren. Hedef / balina / kıyas / fon — kayıtlı veya “Analiz” menüsünde.
3. **TR copy kilidi:** Loading, Watchlist, Overview, Fear & Greed kullanıcıya Türkçe.
4. **Tek skor anlatısı:** Fırsat skoru = bir formül sayfası (`/egitim/...`) + her kartta 3 gerekçe satırı. “AI” iddiasını şeffaflaştır.

### 3.2 Eklenecek ürün (öncelik sırası)

**P0 — alışkanlık (2–4 hafta)**

| Özellik | Neden |
|---------|--------|
| Sabah özeti e-posta / push (kayıtlı) | D1 dönüş; alarmın kardeşi |
| “Bugünün 3 kartı” paylaşım görseli (otomatik OG) | Ücretsiz dağıtım |
| Alarm kur → e-posta gerçekten gelsin | Retention sözleşmesi |
| Terminal metadata | Aşağıdaki SEO maddesi |

**P1 — güven ve derinlik (1–2 ay)**

| Özellik | Neden |
|---------|--------|
| Skor geçmişi (7 gün sparkline) | “Neden 86?” tekrar gelir |
| Analist hedefi widget’ı sembol sayfasında | GSC sorgusunu `/targets` + `/bist/THYAO` ile yakala |
| Portföy doktoru özeti → kayıt | Dönüşüm |
| Search Console sorgusuna özel FAQ bloğu | CTR |

**P2 — genişleme (bilinçli ertele)**

- WebSocket / tick-by-tick (gerekmez)
- 10.000 hisse evreni (önce 500 likit + içerik)
- Sosyal feed, kopya trader
- “TradingView alternatifi” landing

### 3.3 Kuzey yıldızı metrikleri

| Funnel | Metrik | 90 gün hedef |
|--------|--------|----------------|
| Farkındalık | GSC tıklama / hafta | 200+ |
| Aktivasyon | Soft kayıt / organik oturum | ≥ %4 |
| Değer | Alarm veya watchlist ≥1 | Kayıtlıların %40’ı |
| Alışkanlık | D1 / D7 dönüş (kayıtlı) | %20 / %8 |
| Gelir (henüz ölçme, hazırla) | “Pro’ya tık” niyeti | Anket + waitlist |

---

## 4. SEO + içerik — nasıl 1 numara olunur

1 numara **tüm Google değil**; 3 kümede 1 numara.

### 4.1 Kazanılacak kümeler (sırayla)

**Küme A — Analist / hedef fiyat (GSC’de kıvılcım var)**  
Sorgular: analist hedef fiyat, hisse hedef fiyatı, THYAO hedef fiyat, kurum tavsiyesi.  
URL: `/targets` (hub) + `/bist/{sembol}` içinde hedef kutusu.  
Snippet: title’da “hedef fiyat” ve “ücretsiz” geçsin.  
İş: `/targets` title/description’ı sorguya kilitle; her BIST sembol sayfasına 1 konsensüs satırı + FAQ.

**Küme B — BİST canlı rutin (niyet = her sabah)**  
Sorgular: BİST 100 canlı, BIST ısı haritası, sabah borsa rutini.  
URL: `/bist`, `/bist/heatmap`, blog rutin yazıları — **terminal değil**.  
İş: Hub FAQ + canlı widget (botun gördüğü son skor/endeks, boş tablo değil).

**Küme C — Fırsat / tarama**  
Sorgular: BİST alım fırsatı, AI fırsat skoru, günlük hisse tarama.  
URL: `/firsatlar` + eğitim MD.  
İş: Metodoloji + bugünün top 5 (tarih damgalı, indexable özet).

**Küme D — Programatik (ölçek, 2. dalga)**  
`/bist/THYAO`, `/us/AAPL`, `/crypto/BTCUSDT`: fiyat + 1 grafik + 1 CTA + 4 FAQ. Evreni körlemesine şişirme; Search Console’da gösterim alan sembolleri güçlendir.

**Yapılmayacak:** “TradingView alternatif”, “Investing canlı” — marka vs marka, CTR ve bounce öldürür.

### 4.2 Snippet / CTR (hemen)

Bugünkü %0,1 CTR’nin yarısı başlıktandır.

| Sayfa | Şimdi (sorun) | Hedef title (örnek) |
|-------|----------------|---------------------|
| `/terminal` | Terminal \| Bullsye | index:follow ama **kanonik araç**; organik hedef değil. Title: `Canlı BİST Terminali: Fırsat Skoru, Radar ve Alarm \| Bullsye` |
| `/targets` | genel | `Analist Hedef Fiyatları (BİST) — Kurum Konsensüsü, Ücretsiz \| Bullsye` |
| `/firsatlar` | | `BİST Alım Fırsatı: Canlı AI Fırsat Skoru (0–100) \| Bullsye` |
| `/bist` | | `BİST 100 Canlı Hisse Fiyatları ve Tarama \| Bullsye` |

Description kuralı: sorgu kelimesi + somut çıktı + “ücretsiz” + 120–155 karakter. Sahte yıldız/rating schema yok.

### 4.3 İçerik makinesi (kalite > kadans)

Mevcut cron (Salı/Cuma AI yazı) **ince ve tekrarlı** riski taşır. Google E-E-A-T finans (YMYL) için kopya 1.200 kelimeyi cezalandırır.

Haftalık ritim (koru, sıkılaştır):

| Gün | Çıktı | Kural |
|-----|--------|--------|
| Pzt | 1 blog | Tek sorgu, formül/tablo, 1 tool CTA |
| Çrş | 1 eğitim | Tek kavram, 4 FAQ, toolCta |
| Cuma | 1 paylaşım kartı | UTM; GSC’de izle |
| Ayda 1 | GSC top 20 | Thin sayfa birleştir veya güçlendir |

**1 numara içeriği:** “nedir” değil “bugün nasıl bakılır + canlı araç”. Her yazıdan `/firsatlar` veya `/targets` veya `/alerts`.

Yazar varlığı: “Bullsye Araştırma Ekibi” + metodoloji + tarih. YMYL’de anonim AI ansiklopedisi kaybeder.

### 4.4 Teknik SEO checklist

- [ ] `/terminal` noindex değil (kullanıcı paylaşır) ama **iç link equity** `/bist`, `/targets`, `/firsatlar`’a aksın
- [ ] Sembol sayfalarında `dateModified` + FAQ JSON-LD (zaten var, dolu tut)
- [ ] İlk HTML’de en az 1 sayı (XU100 / top skor) — tam boş tablo crawl’ı öldürür
- [ ] Hreflang `tr`/`en` gerçek dil içeriğiyle (İngilizce thin ise kapat)
- [ ] Search Console: `/targets` için sorgu izle; tarama istatistiği 5xx (favicon/icon geçmiş hatalar)
- [ ] İç link: eğitim ↔ tool, blog ↔ sembol, hub ↔ 5 destek yazısı

---

## 5. İnsanları nasıl çekeriz (ücret ödemeden)

1. **Arama (asıl kanal):** Küme A–C. Bütçe yok; kadans + snippet.
2. **Ürün paylaşımı:** Her gün top 3 fırsat görseli (X, LinkedIn, Telegram). Metin: skor + gerekçe + link `/firsatlar?utm=`.
3. **Topluluk:** TR yatırımcı Telegram/Discord’da “sabah 8:45 tarama” ritüeli — spam liste değil, 5 satırlık özet.
4. **Kayıt kancası:** Terminal serbest; e-posta alarm ve skor geçmişi kayıt ister. Banner/toast yalnızca misafire (yapıldı).
5. **Güven:** KAP/haber + uyarı + metodoloji. Finans’ta tıklama, “kazandırırız” ile değil “şu 10 dakikada şuna bak” ile gelir.

---

## 6. Paraya giden yol (şimdi ücret alma)

Trafik 2 tıklamadayken fiyatlandırma intihardır. Sıra:

```
Gösterim → CTR → oturum → kayıt → D1 alarm/watchlist → D7 rutin
    → waitlist “Pro”
    → ücret
```

### 6.1 Ücretsiz katman (sürekli)

- Canlı BİST/kripto tarama, ısı, temel skor, eğitim/blog
- 1 watchlist, sınırlı alarm (ör. 3)
- Sabah özeti e-posta (alışkanlık; maliyet düşük)

### 6.2 Pro (ilk ücret, ~3–6 ay sonra, kanıtla)

Fiyat bandı (TR, 2026 hissi): **149–249 TL/ay** veya **1.490 TL/yıl**. Rakipler USD terminal; TR-first ucuz Pro kazanır.

Pro içeriği (yapay limit değil, gerçek maliyet/değer):

| Paket | Ne satılır |
|-------|------------|
| Alarm+ | Sınırsız fiyat/RSI/skor alarmı + e-posta/push |
| Derinlik | Skor 90 gün geçmişi, ihracat CSV, çoklu watchlist |
| Portföy | Portföy doktoru tam rapor, sektör yığılma |
| Masaüstü | Daha fazla tarama evreni / kaydedilmiş filtre |

**Satılmayan:** “AI garanti alım”, reklam, veri satışı (güven).

### 6.3 Gelir senaryoları (yön, vaat değil)

Varsayım: 90 günde 2.000 organik oturum/hafta, %4 kayıt → ~80 kayıt/hafta → 3 ayda ~800 kayıtlı, %8 D7 → ~64 alışkanlık.  
Pro dönüş %5 → ~32 ödeyen × 199 TL ≈ **6.4 bin TL/ay**. Küçük ama gerçek.  
1 yıl: tıklama 10x, kayıt kalitesi aynı → ~60k TL/ay civarı *ancak* içerik + ürün alışkanlığı tutulursa.

Bu sayılar planlama tavanı değil; **GSC tıklaması 2 iken tek gerçek KPI tıklama ve kayıt.**

### 6.4 Maliyet disiplini

- Yahoo/Binance polling + cache (15s) — doğru; WebSocket şimdi masraf.
- Gemini/Groq içerik cron — kalite kapısı olmadan spam riski; thin AI yazı sıralamayı yer.
- E-posta (Resend) alarm = Pro’nun COGS’u; ücretsizde kota.

---

## 7. 12 haftalık uygulama planı

### Hafta 1–2 — Snippet ve niyet

- `/targets`, `/firsatlar`, `/bist`, `/terminal` title/description
- `/targets` hub’a GSC sorgusuyla birebir H1 + FAQ
- Terminal varsayılan layout: fırsat + alarm öne
- TR copy taraması (Loading/Watchlist)

### Hafta 3–4 — Alışkanlık

- Kayıtlıya sabah özeti e-posta (top 5 skor)
- Paylaşım kartı otomasyonu (Cuma ritüeli her gün denenebilir)
- Alarm e-posta uçtan uca test

### Hafta 5–8 — İçerik 1 numara denemesi

- 8 yazı: hedef fiyat (2), BİST rutin (2), fırsat skoru (2), temettü (1), RSI (1)
- Her biri tool CTA; sembol iç link
- GSC: konum 40→25 hedefi bu kümede

### Hafta 9–12 — Dönüşüm ve Pro hazırlığı

- Portföy doktoru / skor geçmişi kayıt duvarı (içerik değil özellik)
- Waitlist: “Sınırsız alarm — açık beta bitince”
- Clarity: landing → kayıt → alarm hunisi
- Karar: Pro’yu aç / 6 hafta daha free tut

---

## 8. Karar kayıtları

| Karar | Durum |
|-------|--------|
| Ücret şimdi | Hayır |
| Terminal’i ana SEO sayfası yap | Hayır |
| WebSocket | Hayır (şimdi) |
| AI blog cron | Evet, kalite eşiğiyle |
| Marka vs Investing/TV | Hayır |
| İlk ücretli özellik | Alarm + skor geçmişi |

---

## 9. İlişkili dokümanlar

- Günlük free plan: [`docs/GROWTH_PLAN_DAILY_FREE.md`](./GROWTH_PLAN_DAILY_FREE.md)
- SEO/retention: [`docs/SEO_AND_RETENTION.md`](./SEO_AND_RETENTION.md)
- E-posta: [`docs/EMAIL.md`](./EMAIL.md)

---

*Bu belge ürün envanterini şişirmek için değil; gösterimi tıklamaya, tıklamayı rutine, rutini ücrete çevirmek için yazıldı.*
