---
title: 'BİST 100 hisse analiz rehberi: Nicel ve Temel Metriklerle Portföy İcrası'
slug: bist-100-hisse-analiz-rehberi
description: >-
  BİST 100 hisse analiz rehberi ile rasyo analizi, ATR tabanlı stop kurgusu ve
  nicel tarama metodolojisini profesyonel düzeyde uygulayın.
date: '2026-10-20'
category: BIST
tags:
  - BİST
  - XU100
  - analiz
  - screener
readTime: 8
author: Bullsye Research Team
keywords:
  - BİST 100 hisse analiz rehberi
  - bist 100 hisse analizi
  - hisse senedi değerleme yöntemleri
  - bist borsa tarama
  - teknik ve temel analiz
  - borsa istanbul hisse seçimi
  - hisse değerleme rasyoları
publishedAt: '2026-10-20'
updatedAt: '2026-10-20'
readingMinutes: 8
toolCta:
  href: /bist
  label: BİST Canlı
  blurb: >-
    Makaledeki yöntemi canlı veriyle doğrulayın — skor, seviye ve alarm aynı
    terminalde.
faqs:
  - question: >-
      BİST 100 hisse analizinde enflasyon muhasebesi (TMS 29) çarpanları nasıl
      etkiler?
    answer: >-
      TMS 29 uygulaması, parasal olmayan varlıkların bilançoda düzeltilmesiyle
      özkaynakları ve amortisman giderlerini artırır; bu durum F/K çarpanını
      geçici olarak yukarı çekerken net borç/FAVÖK ve PD/DD rasyolarını tarihsel
      ortalamalardan saptırabilir.
  - question: >-
      Borsa İstanbul'da likidite riski analiz edilirken hangi metrikler
      izlenmelidir?
    answer: >-
      Ortalama günlük işlem hacmi (ADTV), tahtadaki ilk beş kademe derinliği ve
      fiili dolaşım piyasa değeri izlenmelidir. BİST 100 hisselerinde gün içi
      spread marjının %0,30'un altında kalması sağlıklı emir icrası için temel
      eşiktir.
  - question: >-
      ATR tabanlı stop-loss seviyesi BİST 100 hisselerinde nasıl optimize
      edilir?
    answer: >-
      14 günlük Average True Range (ATR) göstergesi günlük grafikte hesaplanır;
      giriş fiyatından 1,5 x ATR veya 2,0 x ATR mesafe çıkarılarak piyasa
      gürültüsünden arındırılmış dinamik bir zarar kes noktası belirlenir.
  - question: BİST 100 analizinde sektörel rotasyon nasıl tespit edilir?
    answer: >-
      XBANK (Bankacılık), XUSIN (Sınai) ve XGMYO (Gayrimenkul) endekslerinin
      BİST 100 endeksine göre rölatif güç (RS) oranları 20 ve 50 günlük
      hareketli ortalamalarla izlenerek sermaye akışının yönü tespit edilir.
canonical: 'https://bullsye.app/blog/bist-100-hisse-analiz-rehberi'
pool: borsa
seedQuery: BİST 100 hisse analiz rehberi
---
## BİST 100 Analiz Mekaniği ve Piyasa Mimarisi

BİST 100 hisse analiz rehberi, Borsa İstanbul'da işlem gören en likit yüz şirketin finansal tablolarını, piyasa çarpanlarını ve fiyat hareketlerini nicel verilerle modelleyen sistematik bir metodolojidir. Bu süreç, enflasyon düzeltmesi, sektörel rasyo kıyaslamaları ve volatilite filtrelerini harmanlayarak yerel sermaye piyasalarında sermaye koruma ve asimetrik risk-getiri dengesi oluşturmayı hedefler.

Borsa İstanbul pay piyasasında işlem gören BİST 100 endeksi, piyasa değeri ve günlük işlem hacmi en yüksek 100 payın fiili dolaşımdaki kısımlarının ağırlıklandırılmasıyla hesaplanır. Bu piyasa yapısında kurumsal yabancı takas oranı, yerli bireysel yatırımcı fon akımları ve Türkiye Cumhuriyet Merkez Bankası (TCMB) politika faiz patikası, hisse fiyatlamalarında birincil makro sürücüler olarak öne çıkar. Analiz süreci sadece tekil bir grafiğe bakmak değil; makroekonomik eğilimlerden şirket bilançosuna, oradan da mikroyapı likiditesine uzanan çok katmanlı bir filtreleme protokolüdür.

Sistematik bir analiz kurgusunda şirketler, ait oldukları ana sektör endeksleri (XBANK, XUSIN, XHOLD, XUTEK) çerçevesinde ayrıştırılmalıdır. Bir sınai şirketinin sermaye yoğun yapısı ve net işletme sermayesi döngüsü, bir bankacılık kuruluşunun net faiz marjı (NIM) ve sermaye yeterlilik rasyosu (SYR) ile aynı filtrelerden geçirilemez. Bu nedenle BİST 100 analizinde temel adım, sektörel bazda standardize edilmiş rasyoları kullanmak ve şirketin operasyonel nakit üretme kabiliyetini doğrulamaktır.

## Temel ve Değerleme Hesaplamaları: F/K, FD/FAVÖK ve Değerleme Modelleri

BİST 100 hisselerinin değerlemesinde tek bir çarpan üzerinden sonuca varmak yapısal hatalara yol açar. Sermaye yapısı borçlu olan veya döngüsel sektörlerde yer alan şirketlerin analizinde Firma Değeri / FAVÖK (EV/EBITDA) ve Fiyat/Kazanç-Büyüme (PEG) rasyoları birincil doğrulama araçlarıdır. Matematiksel hesaplama adımları şu formüller üzerinden yürütülür:

$$\text{Firma Değeri (FD)} = \text{Piyasa Değeri} + \text{Net Finansal Borç} - \text{Nakit ve Benzerleri}$$

$$\text{FD / FAVÖK} = \frac{\text{Piyasa Değeri} + \text{Toplam Finansal Borç} - \text{Nakit}}{\text{Faiz, Amortisman ve Vergi Öncesi Kâr (Son 12 Ay)}}$$

$$\text{PEG Oranı} = \frac{\text{F/K}}{\text{Yıllık Hisse Başı Kâr Büyüme Oranı (\%)}}$$

PEG oranının 1,0 değerinin altında olması, hisse senedinin kâr büyümesine kıyasla iskontolu işlem gördüğünü ifade ederken; 1,5 üzerindeki değerler kâr artış hızının fiyatın gerisinde kaldığını gösterir. Bunun yanı sıra enflasyon muhasebesi uygulanan dönemlerde Net İşletme Sermayesi / Satışlar rasyosunun negatif trende girmesi, operasyonel nakit akışının bozulduğuna işaret eden kritik bir öncü göstergedir.

Özkaynak kârlılığı (ROE) DuPont analizi yöntemiyle parçalanmalıdır. DuPont modeli, kârlılığın salt net kâr marjından mı, yoksa aşırı finansal kaldıraç kullanımından mı kaynaklandığını ortaya koyar. Borçluluk çarpanı aşırı yüksek olan şirketlerde kârlılık artışı sürdürülebilir bir değer yaratmaz; bilakis faiz artırım döngülerinde finansman giderleri operasyonel kârı hızla eritebilir. Analistler, şirketlerin serbest nakit akımı (FCF) verimini risksiz faiz oranıyla karşılaştırarak risksiz getiri üzerinde spread aramalıdır.


💡 **İpucu:** Canlı skor için [fırsat masası](https://bullsye.app/firsatlar) · kurum hedefleri için [analist hedef fiyatları](https://bullsye.app/targets).

## Türkiye Piyasa Dinamikleri: BİST Bağlamı ve Makro Değişkenler

Borsa İstanbul dinamikleri, gelişmiş ülke piyasalarından belirgin ayrışmalar sergiler. Yüksek enflasyon ortamında hisse senetleri reel varlık koruma kalkanı işlevi görürken, reel faizlerin pozitife döndüğü dezenflasyonist dönemlerde hisse değerlemelerinde iskonto oranları yükselir. Bu durum, analistlerin İndirgenmiş Nakit Akımları (İNA) modellerinde kullandıkları Ağırlıklı Ortalama Sermaye Maliyeti (AOSM) girdisini doğrudan yukarı taşır.

BİST 100 endeksindeki hacim yoğunlaşması, genellikle ilk 10 ila 15 büyük şirket üzerinde toplanır. Bu ağırlık yapısı, endeksin genel yönü ile medyan hisse performansı arasında derin sapmalara yol açabilir. BİST 100 genelinde işlem yaparken endeks mühendisliğinin etkilerini bertaraf etmek adına Eşit Ağırlıklı BİST 100 (XU100EQ) veya BİST Tüm (XTUMY) endeks korelasyonları takip edilmelidir. Sektörel geçişlerde şirketlerin nakit temettü dağıtma alışkanlıkları ve temettü verimleri de portföy savunması açısından kritik öneme sahiptir; bu aşamada düzenli nakit akışı sağlayan şirketleri [Temettü masası](https://bullsye.app/dividends) üzerinden incelemek stratejik avantaj sunar.

Yabancı takas oranının seyri ve CDS (Kredi Temerrüt Takası) primleri, BİST 100'ün çarpan genişlemesi yaşayıp yaşamayacağını belirler. Ülke risk primi 300 baz puanın altına gerilediğinde bankacılık ve holding hisseleri öncülüğünde çoklu çarpan artışı (multiple expansion) görülürken, CDS yükselişlerinde döviz pozisyonu pozitif olan ihracatçı sanayi şirketleri defansif liman olarak öne çıkar.

## Adım Adım İcra Süreci: Zaman Dilimleri, Emir Tipleri ve Giriş Mimarisi

Sistematik analizden kurgulanan bir hipotezin piyasada icra edilmesi, kesin kurallara bağlanmış operasyonel adımlar gerektirir. BİST 100 hisselerinde başarılı bir işlem kurgusu şu sırayla hayata geçirilir:

1. **Zaman Dilimi Ayrıştırması:** Makro trend analizi ve yapısal destek/direnç tespiti için Haftalık ve Günlük grafikler kullanılır. Pozisyon giriş zamanlaması ve likidite arayışı için 240 dakikalık (4-Saatlik) ve 60 dakikalık (1-Saatlik) periyotlar referans alınır.
2. **Likidite ve Spread Analizi:** İşleme girmeden önce tahtanın ilk 5 kademe derinliği ve ortalama spread kontrol edilir. Spread marjı %0,25'ten yüksek olan yan tahta BİST 100 hisselerinde piyasa emri kullanılmamalı, mutlaka Limit Emir tercih edilmelidir.
3. **Kırılım ve Onay (Retest) Teyidi:** Konsolidasyon bölgelerinin kırılımlarında hacim ortalaması incelenir. 20 günlük ortalama işlem hacminin en az %50 üzerinde gerçekleşmeyen fiyat kırılımları doğrudan işleme giriş gerekçesi sayılmaz; hacimli onay (retest) mumu beklenir.
4. **Zarar Kes (Stop-Loss) ve Kâr Al (Take-Profit) Tanımlama:** Pozisyona girmeden önce çıkış noktaları matematiksel olarak belirlenir. Zarar kes emri sisteme Şartlı Emir (Stop-Limit) olarak girilerek olası gün içi sert flaş düşüşlerde kontrolsüz kayıplar engellenir.

💡 **İpucu:** Canlı skor için [fırsat masası](https://bullsye.app/firsatlar) · kurum hedefleri için [analist hedef fiyatları](https://bullsye.app/targets).

## BİST İşlemlerinde Yanlış Sinyaller, Tuzaklar ve Korunma Yolları

Borsa İstanbul işlemlerinde en sık karşılaşılan tuzaklardan biri, seans açılışlarındaki boşluklu (gap) hareketlerdir. Özellikle vadeli piyasa (VİOP) verileri doğrultusunda spot piyasada sabah saat 10:00 seans açılışında oluşan aşırı alıcılı açılışlar, gün içi dağıtım amacıyla kullanılabilmektedir. Açılışın ilk 15 dakikasında oluşan fiyat hareketinin yönüne körü körüne kapılmak yerine, ilk yarım saatlik denge fiyat aralığının (Opening Range) aşılması beklenmelidir.

Bir diğer önemli risk, devre kesici mekanizmasının tetiklendiği panik anlarıdır. Bir payda taban serileri başladığında veya devre kesici çalıştığında piyasa yapıcı likiditesi aniden çekilir. Bu anlarda portföy riski kontrolsüz şekilde artabileceğinden, stop seviyeleri gün içi devre kesici marjlarına bırakılmadan ATR tabanlı seviyelerde otomatik emirlerle korunmalıdır.

Finansal tablolarda yer alan tek seferlik kur farkı kârları veya duran varlık yeniden değerleme kazançları da yatırımcıları yanıltan temel analiz tuzaklarındandır. Esas faaliyetlerden gelmeyen, nakit karşılığı bulunmayan muhasebesel net kâr patlamaları, F/K rasyosunu suni olarak düşürür. Bu durum hisseyi ucuz gibi gösterse de operasyonel nakit akışı negatif olan şirketler bir sonraki çeyrekte hızla iskonto yemeye mahkumdur.

## Risk Parametreleri ve Pozisyon Boyutlandırma Modeli

Sermaye yönetimi, analiz kalitesinden bağımsız olarak hayatta kalmayı belirleyen ana unsurdur. Borsa İstanbul'da tek bir işlemde toplam portföy sermayesinin %1 ila %2'sinden fazlası riske atılmamalıdır. Dinamik oynaklığa uyum sağlamak için pozisyon büyüklüğü 14 periyotluk Average True Range (ATR) metriğiyle belirlenir.

| Parametre | Tavsiye Edilen Eşik Değeri | Açıklama |
| :--- | :--- | :--- |
| **İşlem Başına Risk (R)** | Portföyün %1,0 - %1,5'i | Tek bir pozisyonda kabul edilen maksimum nominal kayıp miktarı. |
| **Stop Mesafesi (ATR)** | 1,5 x ATR - 2,0 x ATR | Günlük grafikteki piyasa volatilitesine göre dinamik zarar kes aralığı. |
| **Minimum Risk/Ödül (R:R)** | 1 : 2,0 | Riske edilen her 1 TL için hedeflenen minimum brüt kâr potansiyeli. |
| **Maksimum Sektör Ağırlığı** | Toplam portföyün %25'i | Sistematik sektörel risk yoğunlaşmasını engelleme limiti. |
| **Nakit Rezerv Oranı** | %10 - %20 | Oynaklık dönemlerinde asimetrik alım fırsatlarını değerlendirme rezervi. |

Pozisyon büyüklüğü matematiksel formülü:

$$\text{Lot Miktarı} = \frac{\text{Toplam Sermaye} \times \text{Risk Yüzdesi (\%)}}{\text{Giriş Fiyatı} - \text{Stop Fiyatı}}$$

Örneğin 500.000 TL büyüklüğündeki bir portföyde risk toleransı %1 (5.000 TL) olarak belirlenmişse ve hissede giriş fiyatı 100 TL, ATR tabanlı stop seviyesi 95 TL (5 TL risk) ise alınabilecek maksimum lot adedi 1.000 lot ile sınırlandırılmalıdır. Fiyat hareketinin dalga boyu arttıkça formül otomatik olarak lot adedini düşürerek portföy oynaklığını dengeler.

## Bullsye Terminali ile Çoklu Doğrulama ve Filtreleme

Analiz sürecini optimize etmek ve binlerce veri noktası arasında zaman kaybetmemek için entegre tarama araçları kullanılmalıdır. [BİST 100 canlı tarama](https://bullsye.app/bist) motoru; değerleme çarpanları, teknik momentum göstergeleri ve hacim sıçramalarını eş zamanlı filtreleyerek işlem adayı evrenini daraltır. Böylece analist, subjektif duygulardan arınmış objektif veri setleri üzerinden hisse havuzu oluşturabilir.

Filtrelenen adayların piyasa konsensüsü ile uyumunu denetlemek adına [Analist tavsiyeleri ve hedef fiyatları](https://bullsye.app/targets) modülü devreye sokulmalıdır. Aracı kurum araştırma birimlerinin hedef fiyatları ile mevcut piyasa fiyatı arasındaki iskonto marjı incelenerek kurumsal beklentilerin yönü doğrulanır. Eğer bir şirket güçlü temel metriklere sahip olmasına rağmen aracı kurum raporlarında sürekli negatif revizyon alıyorsa, henüz kamuya yansımamış sektörel baskılar göz önünde bulundurulmalıdır.

Son aşamada, nicel skorlama algoritmalarıyla teknik teyit eşleştirilir. Yüksek F/K veya düşük özkaynak kârlılığına sahip hisseler güçlü bir ralli yapsa dahi temel filtrelerden geçemeyeceği için elenir. Kurumsal düzeyde analiz, teknik formasyonları mutlaka operasyonel verilerle teyit etme disiplini gerektirir.

## Kurumsal İşlem Kontrol Listesi ve Nihai Strateji Çerçevesi

Disiplinli bir BİST 100 hisse analizi ve emir icrası için işlem öncesi aşağıdaki kontrol listesi eksiksiz tamamlanmalıdır:

- [ ] **Makro ve Sektör Uyumu:** Şirketin sektörü (XBANK, XUSIN vb.) endekse göre pozitif rölatif güç gösteriyor mu?
- [ ] **Temel Rasyo Filtresi:** FD/FAVÖK ve F/K çarpanları sektör medyanının altında veya makul büyüme bandında (PEG < 1,5) mı?
- [ ] **Bilanço Sağlığı:** Net Borç / FAVÖK oranı 3,0 eşiğinin altında mı ve operasyonel nakit akışı net kârı destekliyor mu?
- [ ] **Likidite Kontrolü:** İlgili payın ortalama günlük hacmi portföy büyüklüğüne kıyasla rahat çıkış imkanı tanıyor mu?
- [ ] **Dinamik Stop Seviyesi:** 14 günlük ATR metriğine dayalı zarar kes noktası belirlendi ve sisteme şartlı emir olarak girildi mi?
- [ ] **Risk/Ödül Oranı:** Kurgulanan kâr hedefi, göze alınan zararın en az 2 katı (1:2 R:R) potansiyele sahip mi?

Borsa İstanbul'da kalıcı getiri sağlamanın yolu piyasa tahminciliği yapmak değil, asimetrik risk profiline sahip olasılıkları tespit edip sermayeyi katı kurallarla yönetmektir. Nicel metrikleri temel bilanço gerçekleriyle birleştiren yatırımcılar, makro oynaklık döngülerinde sermayelerini eritmeyip uzun vadeli bileşik getiri gücünden azami ölçüde faydalanırlar.
