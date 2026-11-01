"""Builds Google Ads Editor import files for Bullsye search campaigns.

    python scripts/ads/build-google-ads.py   ->  docs/ads/*.csv

Fails if any headline > 30, description > 90 or path > 15 characters.
Copy rules: no buy/sell calls, no return promises, no "tavsiye"/"kazanç" claims.
"""
import csv
import os
import sys

SITE = "https://bullsye.app"
CAMPAIGN = "Bullsye | Arama | TR"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "ads")


def utm(path, group):
    sep = "&" if "?" in path else "?"
    return (
        f"{SITE}{path}{sep}utm_source=google&utm_medium=cpc"
        f"&utm_campaign=arama_tr&utm_content={group}"
    )


GROUPS = [
    {
        "name": "Hedef fiyat - genel", "slug": "hedef_genel", "url": "/targets",
        "path": ("hedef-fiyat", "bist"),
        "kw": ["hisse hedef fiyatları", "analist hedef fiyat", "bist hedef fiyat",
               "hisse hedef fiyat listesi", "aracı kurum hedef fiyatları", "hedef fiyat 2026"],
        "h": ["BİST Analist Hedef Fiyatları", "Kurum Konsensüsü Tek Sayfada",
              "Ücretsiz, Kayıt Gerekmez", "Ortalama, En Yüksek, En Düşük",
              "Hedefe Kalan Mesafe %", "Her Gün Güncellenir", "Bullsye BİST Terminali",
              "Hisse Hedef Fiyat Listesi"],
        "d": ["Analist konsensüs hedef fiyatlarını ve hedefe kalan mesafeyi tek ekranda gör.",
              "Ortalama, en yüksek ve en düşük hedef fiyat. Bilgi amaçlıdır, tavsiye değildir.",
              "Takip ettiğin hisse eşiği aşınca e-posta alarmı kur. Kredi kartı gerekmez."],
    },
    {
        "name": "Hedef fiyat - sembol", "slug": "hedef_sembol",
        "path": ("hedef-fiyat", ""),
        "symbols": ["THYAO", "ASELS", "GARAN", "AKBNK", "BIMAS", "EREGL", "KCHOL", "SISE",
                    "TUPRS", "FROTO", "PGSUS", "YKBNK", "ISCTR", "SAHOL", "TCELL", "KONTR"],
        "h": ["{SYM} Analist Hedef Fiyatı", "Kurum Konsensüsü Tek Sayfada",
              "Ücretsiz, Kayıt Gerekmez", "Hedefe Kalan Mesafe %",
              "Canlı Fiyat ve Analiz Skoru", "{SYM} için Alarm Kur", "Bullsye BİST Terminali"],
        "d": ["{SYM} için analist hedef fiyatları, konsensüs ve canlı fiyat tek sayfada.",
              "Hedefe kalan mesafe, analiz skoru ve grafik. Bilgi amaçlıdır, tavsiye değildir.",
              "{SYM} eşiği aşınca e-posta alarmı al. Kayıt ücretsiz, kredi kartı gerekmez."],
    },
    {
        "name": "Hisse tarama", "slug": "tarama", "url": "/firsatlar",
        "path": ("tarama", "bist"),
        "kw": ["bist hisse tarama", "ücretsiz hisse tarama", "borsa tarama programı",
               "hisse tarayıcı", "bist tarama", "günlük hisse tarama", "hisse skor"],
        "h": ["Ücretsiz BİST Hisse Tarama", "Her Hisseye 0–100 Skor",
              "F/K, Hacim ve Bant Bir Arada", "Kayıt Olmadan Kullan",
              "Günün Öne Çıkan Skorları", "Sabah 10 Dakikada Piyasa",
              "Bullsye BİST Terminali", "Tarama + Alarm + Takip"],
        "d": ["Yüzlerce BİST hissesi canlı metriklerle 0–100 skora iner. Ücretsiz, kayıtsız.",
              "F/K, hacim ve gün içi bant tek tabloda. Skorlar bilgilendirme amaçlıdır.",
              "Günün en yüksek skorları hafta içi 08:30'da e-postanda. Ücretsiz hesap aç."],
    },
    {
        "name": "Alarm ve takip", "slug": "alarm", "url": "/",
        "path": ("alarm", "takip"),
        "kw": ["borsa alarm uygulaması", "hisse fiyat alarmı", "hisse takip uygulaması",
               "borsa takip programı", "hisse takip listesi", "bist fiyat alarmı"],
        "h": ["Hisse Fiyat Alarmı, Ücretsiz", "Eşik Aşılınca E-posta Al",
              "Sekme Kapalıyken de Çalışır", "BİST, NASDAQ ve Kripto", "Kendi İzleme Listen",
              "Her Sabah 08:30 Özet", "Bullsye Takip Terminali", "Kredi Kartı Gerekmez"],
        "d": ["Fiyat, % hareket veya RSI eşiğin aşılınca e-posta al. BİST, NASDAQ ve kripto.",
              "İzleme listen, alarmların ve portföyün tek yerde. Google ile 10 saniyede kayıt.",
              "Her sabah 08:30'da günün öne çıkan skorları e-postanda. İstediğin an çık."],
    },
    {
        "name": "Temettü", "slug": "temettu", "url": "/bist/yuksek-temettu-verenler-2026",
        "path": ("temettu", "2026"),
        "kw": ["temettü veren hisseler 2026", "en yüksek temettü veren hisseler",
               "temettü hisseleri listesi", "bist temettü verimi"],
        "h": ["Temettü Veren Hisseler 2026", "Temettü Verimine Göre Liste",
              "Ücretsiz, Kayıt Gerekmez", "BİST Temettü Verimi",
              "Canlı Fiyat ve Analiz Skoru", "Bullsye BİST Terminali"],
        "d": ["BİST'te temettü verimi en yüksek hisseler canlı fiyatla tek listede. Ücretsiz.",
              "Verim, fiyat ve analiz skoru bir arada. Bilgi amaçlıdır, tavsiye değildir.",
              "Takip ettiğin temettü hisseleri için fiyat alarmı kur. Kayıt ücretsiz."],
    },
    {
        "name": "Isı haritası", "slug": "isi_haritasi", "url": "/bist/heatmap",
        "path": ("isi-haritasi", "bist"),
        "kw": ["bist ısı haritası", "borsa ısı haritası", "bist 100 ısı haritası",
               "borsa istanbul heatmap"],
        "h": ["Canlı BİST Isı Haritası", "Sektörler Tek Bakışta", "Ücretsiz, Kayıt Gerekmez",
              "BİST 100 Canlı Görünüm", "Bullsye BİST Terminali", "Yükselen ve Düşenler"],
        "d": ["BİST hisselerini sektör ve günlük değişime göre canlı ısı haritasında gör.",
              "Piyasanın genel yönü tek ekranda. Hisseye tıkla, skor ve hedef fiyatı aç.",
              "Takip listeni oluştur, eşik aşılınca e-posta al. Kredi kartı gerekmez."],
    },
    {
        "name": "F/K düşük", "slug": "fk", "url": "/bist/f-k-en-dusuk-hisseler",
        "path": ("fk", "bist"),
        "kw": ["f/k oranı düşük hisseler", "fk oranı en düşük hisseler",
               "düşük f/k hisseler bist"],
        "h": ["F/K Oranı En Düşük Hisseler", "BİST Çarpan Listesi", "Ücretsiz, Kayıt Gerekmez",
              "F/K, PD/DD ve Analiz Skoru", "Bullsye BİST Terminali", "Canlı Fiyatla Güncel"],
        "d": ["BİST'te F/K oranı en düşük hisseler canlı fiyat ve analiz skoruyla tek listede.",
              "Çarpanlar bilgi amaçlıdır; tek başına karar gerekçesi değildir. Ücretsiz.",
              "İlgini çeken hisseyi izleme listene ekle, eşik aşılınca e-posta al."],
    },
]

NEGATIVES = [
    "forex", "kaldıraç", "vadeli", "bonus", "deneme bonusu", "bahis", "kumar",
    "kredi", "iş ilanı", "maaş", "staj", "investing", "tradingview", "midas",
    "garanti kazanç", "kesin kazanç", "sinyal grubu", "vip sinyal", "telegram sinyal",
    "hesap aç", "hesap açma", "pdf", "excel", "indir", "apk",
]

errors = []


def check(text, limit, where):
    if len(text) > limit:
        errors.append(f"{where}: {len(text)}>{limit}: {text}")
    return text


def ad_row(group, url, p1, p2, heads, descs):
    hs = [check(h, 30, group) for h in heads]
    ds = [check(d, 90, group) for d in descs]
    return ([CAMPAIGN, group, url, check(p1, 15, group), check(p2, 15, group)]
            + hs + [""] * (15 - len(hs)) + ds + [""] * (4 - len(ds)))


kw_rows, ad_rows = [], []
for g in GROUPS:
    if g.get("symbols"):
        for sym in g["symbols"]:
            ag = f"Hedef fiyat - {sym}"
            url = utm(f"/bist/{sym}/hedef-fiyat", g["slug"])
            low = sym.lower()
            for kw, mt in [(f"{low} hedef fiyat", "Phrase"), (f"{low} hedef fiyat", "Exact"),
                           (f"{low} hedef fiyatı", "Phrase"), (f"{low} analist hedef", "Phrase")]:
                kw_rows.append([CAMPAIGN, ag, kw, mt, url])
            ad_rows.append(ad_row(
                ag, url, g["path"][0], low,
                [h.replace("{SYM}", sym) for h in g["h"]],
                [d.replace("{SYM}", sym) for d in g["d"]],
            ))
    else:
        url = utm(g["url"], g["slug"])
        for kw in g["kw"]:
            for mt in ("Phrase", "Exact"):
                kw_rows.append([CAMPAIGN, g["name"], kw, mt, url])
        ad_rows.append(ad_row(g["name"], url, g["path"][0], g["path"][1], g["h"], g["d"]))

if errors:
    print("Character limit errors:\n" + "\n".join(errors))
    sys.exit(1)

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "google-ads-keywords.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Campaign", "Ad Group", "Keyword", "Criterion Type", "Final URL"])
    w.writerows(kw_rows)
with open(os.path.join(OUT, "google-ads-negatives.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Campaign", "Keyword", "Criterion Type"])
    w.writerows([[CAMPAIGN, n, "Campaign Negative Phrase"] for n in NEGATIVES])
with open(os.path.join(OUT, "google-ads-rsa.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Campaign", "Ad Group", "Final URL", "Path 1", "Path 2"]
               + [f"Headline {i}" for i in range(1, 16)]
               + [f"Description {i}" for i in range(1, 5)])
    w.writerows(ad_rows)

print(f"{len(ad_rows)} ad groups/ads, {len(kw_rows)} keywords, {len(NEGATIVES)} negatives")
