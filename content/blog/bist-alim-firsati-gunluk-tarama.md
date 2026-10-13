---
title: 'BİST alım fırsatı günlük tarama: Net giriş noktası ve derin rehber'
slug: bist-alim-firsati-gunluk-tarama
description: >-
  BİST alım fırsatı günlük tarama, RSI, MACD ve ATR kombinasyonu ile kısa vadeli
  alım sinyalleri üretir ve risk yönetimiyle yüksek doğruluk sağlar.
date: '2026-10-13'
category: Teknik Analiz
tags:
  - fırsat skoru
  - BİST
  - tarama
  - RSI
readTime: 8
author: Bullsye Research Team
keywords:
  - BİST alım fırsatı günlük tarama
  - RSI
  - MACD
  - ATR
  - Bullsye
  - Teknik analiz
  - Risk yönetimi
publishedAt: '2026-10-13'
updatedAt: '2026-10-13'
readingMinutes: 8
toolCta:
  href: /firsatlar
  label: Fırsat Masası
  blurb: >-
    Makaledeki yöntemi canlı veriyle doğrulayın — skor, seviye ve alarm aynı
    terminalde.
faqs:
  - question: RSI nedir ve nasıl hesaplanır?
    answer: >-
      RSI, 14 günlük ortalama kazanç ve kayıp oranını ölçer. RS = AU ÷ AD; RSI =
      100 - (100 ÷ (1 + RS)). 30 altı aşırı satım, 70 üstü aşırı alım olarak
      yorumlanır.
  - question: MACD sinyali nasıl yorumlanır?
    answer: >-
      MACD, 12‑gün EMA - 26‑gün EMA. Sinyal hattı 9‑gün EMA. Alım sinyali, MACD
      sıfır çizgisini yukarıdan keserken oluşur.
  - question: ATR stop‑loss nasıl belirlenir?
    answer: >-
      ATR 14‑gün döneminde en yüksek, en düşük ve kapanış farkının üssel
      ortalaması. Stop‑loss, ATR 1.5‑2 katı kadar konularak volatiliteye karşı
      koruma sağlar.
  - question: Risk yönetimi için pozisyon boyutu nasıl hesaplanır?
    answer: >-
      Lot = (Risk Miktarı ÷ Stop‑Loss Uzaklığı). Örneğin, 10.000₺ sermaye, %1
      risk ve 100₺ stop‑loss için 0.1 lot açılır.
canonical: 'https://bullsye.app/blog/bist-alim-firsati-gunluk-tarama'
pool: teknik
seedQuery: BİST alım fırsatı günlük tarama
---
## Tanım

BİST alım fırsatı taraması, günlük kapanış verilerine dayalı olarak RSI, MACD ve ATR göstergelerinin eşleşmesini inceler. Göstergelerin kısa vadeli momentum ve volatilite ölçümleri, yatırımcıya giriş sinyali üretir. Bu metodoloji, düşük riskle yüksek doğruluk hedefler.

RSI, 14 günlük ortalama kazanç ve kayıp oranını ölçer; 30 altı alım, 70 üstü satım sinyali verir. MACD, iki üssel hareketli ortalama farkını gösterir; sıfır çizgisiyle kesişim alım fırsatı yaratır. ATR, volatiliteyi ölçer, stop‑loss ayarı sağlar.

Bu üç gösterge kombinasyonu, kısa vadeli trend dönüşlerini belirlemek için kullanılır. RSI 30‑70 aralığında, MACD sıfır çizgisini aşarken, ATR 1‑2 katı stop‑loss ile risk sınırlanır. Uygulamada, alım sinyali verildiğinde, pozisyon açılır ve risk kontrolü sağlanır.

BİST alım fırsatı taraması, RSI, MACD ve ATR kombinasyonu ile kısa vadeli alım sinyalleri üretir ve risk yönetimiyle yüksek doğruluk sağlar.

## Formül / hesap

RSI hesaplanırken önce ortalama kazanç (AU) ve ortalama kayıp (AD) bulunur. AU = (önceki AU × 13 + son kazanç) ÷ 14; AD = (önceki AD × 13 + son kayıp) ÷ 14. Bu değerler RS = AU ÷ AD oluşturur.

RSI = 100 - (100 ÷ (1 + RS)). Bu formül, 0‑100 aralığında momentum gücünü gösterir. 30 altı aşırı satım, 70 üstü aşırı alım olarak yorumlanır. BİST alım taramasında, RSI 30‑70 aralığında olduğunda alım sinyali güçlü kabul edilir.

MACD hesaplamasında 12‑gün ve 26‑gün üssel hareketli ortalamalar (EMA) kullanılır. MACD = EMA(12) - EMA(26). Sinyal hattı, MACD'nin 9‑gün EMA'sıdır. Alım sinyali, MACD'nin sinyal hattını yukarıdan kesmesiyle oluşur.

ATR, 14‑gün döneminde en yüksek, en düşük ve kapanış fiyatlarının farkı üzerinden hesaplanır. ATR = (H1-L1, H1-C1, L1-C1) 14‑günlük üssel ortalama. Bu değer, volatiliteyi ölçer ve stop‑loss ayarında kullanılır.

BİST alım taramasında, RSI 30‑70, MACD sıfır çizgisini yukarıdan keserken, ATR 1‑2 katı stop‑loss ile risk kontrol edilir. Bu kombinasyon, kısa vadeli alım fırsatlarını belirler ve yatırımcıya net giriş noktası sunar.

Formüller, günlük kapanış verileri üzerinden otomatik olarak hesaplanır. Bu sayede, manuel hesaplama hatası ortadan kalkar ve işlem süreci hız kazanır. Ayrıca, algoritmik sistemler sayesinde gerçek zamanlı alım sinyalleri elde edilir.


💡 **İpucu:** Canlı skor için [fırsat masası](https://bullsye.app/firsatlar) · kurum hedefleri için [analist hedef fiyatları](https://bullsye.app/targets).

## Piyasa bağlamı

BİST, Türkiye'nin en büyük borsasıdır ve günlük işlem hacmi yüksekliğinden dolayı alım fırsatları yoğun olarak ortaya çıkar. NASDAQ veya kripto piyasaları gibi farklı volatilite profillerine sahip olsa da, BİST üzerinde kullanılan göstergeler benzer performans gösterir.

BİST'in sektörel dağılımı, teknoloji, finans, sağlık ve enerji gibi alanlarda yoğunlaşır. Bu sektörler, makroekonomik haberler ve şirket raporlarıyla birlikte teknik göstergelerle desteklenir. Yatırımcılar, sektör trendlerini takip ederek daha doğru alım sinyalleri elde eder.

NASDAQ, BİST'e göre daha yüksek likiditeye sahiptir ve fiyat hareketleri genellikle daha hızlıdır. Ancak, BİST'in düşük işlem maliyetleri ve yerel haber akışı, teknik analiz için avantaj sağlar. Kripto piyasaları ise 24/7 işlem yapar; bu da volatiliteyi artırır.

BİST üzerinde yapılan günlük tarama, özellikle piyasa açılışından önceki 30 dakikalık volatiliteyi değerlendirir. Bu süre zarfında, açılış fiyatı ve önceki kapanış arasındaki fark, RSI ve MACD sinyallerini güçlendirir. Yatırımcılar, bu kısa periyotlarda alım fırsatlarını yakalar.

Nasıl bir piyasa koşulu ideal? Yüksek likidite, orta düzey volatilite ve belirgin trend sinyalleri. BİST bu kriterleri karşılayan sektörlerde güçlü alım fırsatları sunar. Diğer piyasalarda benzer teknik göstergelerle aynı strateji uygulanabilir.

BİST, Borsa İstanbul, Türkiye ekonomisinin önemli göstergelerinden biridir. Ekonomik veriler, faiz oranları ve döviz kurları, teknik göstergelerle birlikte analiz edilmelidir. Bu çok katmanlı yaklaşım, alım sinyallerinin doğruluğunu artırır.

## Adım adım icra

İlk adım, Bullsye platformunda BİST verilerini günlük 1‑saat zaman diliminde indirir. Ardından, RSI 14, MACD 12/26/9 ve ATR 14 parametreleriyle göstergeler hesaplanır. Tüm veriler otomatik olarak güncellenir.

İkinci adım, alım sinyali üretmek için RSI 30‑70 aralığında, MACD sıfır çizgisini yukarıdan kesen ve ATR 1‑2 katı stop‑loss ayarı belirlenir. Bu koşullar karşılandığında, Bullsye alım sinyali oluşturur.

Üçüncü adım, alım emrini açarken lot büyüklüğü risk parametrelerine göre ayarlanır. Örneğin, %1.5 ATR stop‑loss ile 1% risk, 2% risk gibi farklı seçenekler sunulur. Lot büyüklüğü, hesaplanan risk miktarı üzerinden belirlenir.

Dördüncü adım, stop‑loss ve kar hedefi belirlenir. Stop‑loss, ATR 1.5‑2 katı kadar uzaklıkta konulur. Kar hedefi, 2‑3 kat ATR veya 1.5‑2% risk/kar oranı ile belirlenir. Bu sayede risk/kar dengesi korunur.

Beşinci adım, emir zamanlamasıdır. Günlük tarama, açılış sonrası ilk 30 dakikada sinyal üretir. Emir, açılış fiyatına yakın bir seviyede verilir. Bu zamanlama, volatilitenin yüksek olduğu dönemde risk azaltır.

Altıncı adım, pozisyon kapama stratejisidir. Kar hedefe ulaşıldığında, otomatik olarak pozisyon kapatılır veya manuel müdahale yapılır. Stop‑loss gerçekleştiğinde, pozisyon kapatılır ve zarar sınırlanır. Bu strateji, kayıpları minimize eder ve uzun vadeli performansı artırır.

💡 **İpucu:** Canlı skor için [fırsat masası](https://bullsye.app/firsatlar) · kurum hedefleri için [analist hedef fiyatları](https://bullsye.app/targets).

## Yanlış sinyal ve tuzaklar

RSI aşırı alım bölgesinde 70 üstü değerler, sahte alım sinyali yaratabilir. Bu durumda, MACD sıfır çizgisini aşağıdan keserse bile, gerçek trend düşüş olabilir. Dolayısıyla, çoklu filtre kullanmak önemlidir.

MACD sinyalleri, düşük volatilite dönemlerinde gürültülü olabilir. 14‑gün ATR değeri düşükse, MACD değişimleri gerçek trend değişikliği olmayabilir. Bu nedenle, ATR ile birlikte sinyal doğrulaması yapılmalıdır.

Stop‑loss ayarı, volatiliteyi yetersiz hesaba katarsa, sık sık stop‑loss tetiklenebilir. ATR 1.5 katı standart olsa da, volatilite artışı durumunda 2 katı daha güvenli olabilir. Aksi takdirde, küçük fiyat hareketleri zarar yaratır.

Sinyal radarı, gerçek zamanlı verileri gösterir ve alım/ satım sinyallerini zaman damgasıyla listeler. Kullanıcı, her sinyalin RSI, MACD ve ATR değerlerini inceleyebilir. Bu özellik, doğrulama sürecini hızlandırır.

Yüksek likiditeye sahip olmayan hisselerde, slippage risk artar. Bu, alım fiyatının beklenenden yüksek çıkmasına neden olur. Strateji, likidite analizi ve slippage toleransı ile uyumlu olmalıdır.

Bullsye, sinyallerini geçmiş verilerle test ederken, gerçek zamanlı performansı da izlemelidir. Gerçek zamanlı test, geçmiş performansın yanı sıra, piyasa koşullarını da yansıtır. Bu nedenle, demo hesabında test edilmesi önerilir.

## Risk ve pozisyon boyutu

Risk yönetimi, günlük alım taramasında kritik öneme sahiptir. %1.5‑3 ATR stop‑loss, 1% risk/kar oranı ve 3‑5 pozisyon sınırı gibi parametreler, toplam sermaye riskini kontrol altında tutar.

Pozisyon boyutu, risk parametrelerine göre hesaplanır: Lot = (Risk Miktarı ÷ Stop‑Loss Uzaklığı). Örneğin, 10.000₺ sermaye ile %1 risk, 100₺ stop‑loss için 0.1 lot açılır.

Risk parametreleri tablosu: | Göstergen | Eşik | |-----------|-------| | RSI | 30/70 | | ATR Stop | %1.5–3 | | Pozisyon Sınırı | 3 |

Bu tablo, günlük alım stratejisinde risk kontrolünü sağlar. RSI 30‑70 aralığında, ATR 1.5‑3 katı stop‑loss ile risk 1% altında tutulur. Pozisyon sınırı, toplam sermayenin 10%'i aşmamalıdır.

Risk toleransı, yatırımcının psikolojisi ve sermaye büyüklüğüne göre belirlenir. Düşük riskli yatırımcılar, %1 risk ve 1.5 ATR stop‑loss tercih ederken, agresif yatırımcılar %3 risk ve 2 ATR kabul edebilir.

Pozisyon boyutu hesaplaması, sermaye büyüklüğü ve risk parametreleriyle uyumlu olmalıdır. Günlük alım stratejisinde, risk 1% altında tutulur ve pozisyonlar toplam sermayenin 10%'i sınırlandırılır.

## Bullsye terminalinde doğrulama

Bullsye, alım sinyallerini doğrudan terminal üzerinden görselleştirir. Dashboard’da, RSI, MACD ve ATR göstergeleri, sinyal yoğunluğu ve risk parametreleri gösterilir. Bu sayede, yatırımcı hızlı karar alabilir.

Sinyal radarı, gerçek zamanlı verileri gösterir ve alım/ satım sinyallerini zaman damgasıyla listeler. Kullanıcı, her sinyalin RSI, MACD ve ATR değerlerini inceleyebilir. Bu özellik, doğrulama sürecini hızlandırır.

[Fırsat skoru (0–100)](https://bullsye.app/firsatlar) 0‑100 aralığında puanlanır. 80‑90 aralığında yüksek, 70‑79 orta, 60‑69 düşük ve 50‑59 çok düşük olarak sınıflandırılır. Kullanıcı, bu puanları alım kararına göre filtreleyebilir.

[Fırsat skoru nasıl okunur](https://bullsye.app/egitim/teknik-analiz/ai-firsat-skoru-nasil-okunur) 0‑100 aralığında puanlanır. 80‑90 aralığında yüksek, 70‑79 orta, 60‑69 düşük ve 50‑59 çok düşük olarak sınıflandırılır. Kullanıcı, bu puanları alım kararına göre filtreleyebilir.

Fırsat masası, canlı skorları ve tarihsel performansı gösterir. Analist hedef fiyatları, temel analizle desteklenir. Kullanıcı, Bullsye ile strateji oluşturabilir ve portföyünü optimize edebilir.

Bullsye terminali, sinyal doğrulama ve risk yönetimi için entegre araçlar sunar. Stop‑loss ve kar hedefleri, otomatik olarak hesaplanır ve kullanıcıya bildirim gönderilir. Bu, işlem sürecini sorunsuzlaştırır.

Demo hesabı, gerçek zamanlı test için ideal bir ortamdır. Gerçek sermayeyle test etmek, psikolojik faktörleri de değerlendirir. Bullsye, demo hesabında strateji performansını izler ve raporlar.

## Kontrol listesi + sonuç

Kontrol listesi, alım sinyali üretmeden önce tüm parametrelerin doğruluğunu kontrol eder. RSI, MACD ve ATR değerleri, stop‑loss ve kar hedefi, lot büyüklüğü ve risk oranı doğrulanır.

Sinyal radarı, gerçek zamanlı verileri ve geçmiş performansı gösterir. Fırsat skorları, 80‑90 aralığında yüksek sinyaller için tercih edilir. Demo hesabında test edilmesi önerilir.

Risk yönetimi, günlük alım stratejisinde %1 risk ve 1.5 ATR stop‑loss ile başlar. Pozisyon sınırı 3, toplam sermayenin 10%'i aşmamalıdır. Bu yapı, uzun vadeli kârlılığı destekler.

Sonuç olarak, BİST alım fırsatı günlük tarama, teknik göstergelerle desteklenen sistematik bir yaklaşımdır. Uygulama, risk kontrolü, gerçek zamanlı doğrulama ve demo testleriyle güvenilir bir işlem planı sunar.

Bu rehber, yatırımcılara net giriş noktası, risk yönetimi ve stratejik planlama sunar. Her adım, veri odaklı kararlar almayı ve uzun vadeli büyümeyi hedefler.
