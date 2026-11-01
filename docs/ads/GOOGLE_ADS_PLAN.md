# Google Ads — Arama kampanyası planı

**Hedef:** Niş, yüksek niyetli aramalardan ölçülebilir kayıt toplamak.
**Ölçü:** Kayıt başına maliyet (CPA). İlk 4 hafta ölçmek için; ölçeklemek sonra.

## 0. Önce bunlar (yoksa reklam boşa gider)

- [ ] `npm run db:push` → `feat/terminal-v2` merge → deploy (kayıt/alarm event'leri canlıda olmalı)
- [ ] **Finansal hizmet doğrulaması (Türkiye):** Türkiye, Google'ın finansal hizmet
      doğrulaması listesinde (SPK, BDDK, TCMB; uygulama 1 Kasım 2023'ten beri).
      Bullsye lisanslı bir finans kuruluşu değil; finans arayan kullanıcıları hedeflediği için
      Google büyük ihtimalle doğrulama ister. Lisanssız reklamverenler başvuruyu Google'ın
      ortağı **G2RS** üzerinden yapar. Reklamlar onaylanmazsa Ads panelinde
      "Financial services verification" uyarısı çıkar → oradan başvur.
      Kaynak: https://support.google.com/adspolicy/answer/15332527?co=GENIE.CountryCode%3DTR
- [ ] Gizlilik sayfasına Google Ads çerezlerini ekle (sitede onay penceresi hazır)

## 1. Hesap ve dönüşüm (bir kerelik)

1. ads.google.com → hesap aç → **Uzman modu** (Smart kampanya önerisini atla)
2. Hedefler → Dönüşümler → **Yeni dönüşüm → Web sitesi → Manuel kurulum**
   - Ad: `Kayıt`, Kategori: **Kayıt (Sign-up)**, Değer: kullanma, Sayım: **Bir**
   - Kurulumda verilen **AW-XXXXXXXXX** (dönüşüm kimliği) ve **etiketi** al
3. Vercel → Environment Variables (Production):
   - `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX`
   - `NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=<etiket>`
   - Yeniden deploy. Bundan sonra:
     - Sitede çerez onay penceresi çıkar (varsayılan: reklam çerezleri kapalı)
     - Yeni kayıt (`signup_completed`, Google ile kayıt dahil) Google Ads'e dönüşüm olarak gider

## 2. Kampanyayı içe aktar

Dosyalar `docs/ads/` altında, `python scripts/ads/build-google-ads.py` ile üretilir
(karakter sınırlarını kontrol eder):

| Dosya | İçerik |
|---|---|
| `google-ads-keywords.csv` | 22 reklam grubu, 124 anahtar kelime (Phrase + Exact) |
| `google-ads-rsa.csv` | Her gruba bir duyarlı arama reklamı (başlık ≤30, açıklama ≤90) |
| `google-ads-negatives.csv` | 25 negatif kelime (forex, bonus, kredi, sinyal grubu, rakip markalar…) |

**Google Ads Editor** (ücretsiz masaüstü uygulaması) → hesabı indir → *Hesap → İçe aktar →
Dosyadan* → sırayla üç dosya → *İncele* → *Yayınla*. Kampanya yoksa Editor oluşturur;
ayarlarını içe aktardıktan sonra yap:

| Ayar | Değer |
|---|---|
| Tür | Yalnızca **Arama** (Display ağı ve Arama ortakları **kapalı**) |
| Konum | Türkiye · *Bu konumda bulunan kişiler* |
| Dil | Türkçe |
| Bütçe | Günlük **150 TL** ile başla |
| Teklif | İlk 2 hafta **Tıklamaları artır** + TBM sınırı **8 TL**; ~30 kayıt dönüşümünden sonra **Dönüşümleri artır** |
| Zamanlama | Tüm gün (sabah 07–10 ve akşam 19–23 en değerli; 2. haftadan sonra ayarla) |
| Cihaz | Hepsi açık; mobil CPA belirgin kötüyse mobilde −%30 |

## 3. Reklam grupları ve hedef sayfalar

| Grup | Örnek kelimeler | Hedef sayfa |
|---|---|---|
| Hedef fiyat – genel | hisse hedef fiyatları, analist hedef fiyat | `/targets` |
| Hedef fiyat – THYAO … KONTR (16 grup) | thyao hedef fiyat | `/bist/THYAO/hedef-fiyat` |
| Hisse tarama | bist hisse tarama, ücretsiz hisse tarama | `/firsatlar` |
| Alarm ve takip | borsa alarm uygulaması, hisse fiyat alarmı | `/` (ana sayfa) |
| Temettü | temettü veren hisseler 2026 | `/bist/yuksek-temettu-verenler-2026` |
| Isı haritası | bist ısı haritası | `/bist/heatmap` |
| F/K düşük | f/k oranı düşük hisseler | `/bist/f-k-en-dusuk-hisseler` |

Tüm linklerde `utm_source=google&utm_medium=cpc&utm_campaign=arama_tr&utm_content=<grup>`
var → PostHog'da **Kampanya kaynakları (UTM)** ve **Kayıt hunisi** grafiklerinde ayrışır.

## 4. Metin kuralları (onay için)

- ❌ "al", "sat", "kazandırır", "garanti", "en iyi hisse", "tavsiye", "sinyal"
- ✅ "ücretsiz", "kayıt gerekmez", "e-posta alarmı", "bilgi amaçlıdır, tavsiye değildir"
- Yeni metin eklerken `scripts/ads/build-google-ads.py` içine yaz ve yeniden üret.

## 5. İlk 4 hafta ritmi

| Ne zaman | Yap |
|---|---|
| Her gün (ilk hafta) | Arama terimleri raporu → alakasızları negatife ekle |
| Haftada bir | Grup bazında: tıklama, TBM, kayıt, CPA. CPA'sı 2× ortalamanın üstündeki grubu durdur |
| 2. hafta sonu | Kazanan 2–3 gruba bütçe kaydır; kaybedenleri kapat |
| 4. hafta sonu | Karar: CPA kabul edilebilir mi → bütçeyi artır / kanalı değiştir |

Başlangıç beklentisi (tahmin, garanti değil): niş finans kelimelerinde TBM ~2–8 TL,
siteye gelen ziyaretçinin %3–8'i kayıt → kayıt başına ~50–200 TL.
