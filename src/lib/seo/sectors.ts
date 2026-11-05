/**
 * Curated sector baskets for the sector ranking pages. Tickers that the scan
 * doesn't cover simply don't appear, so a stale ticker never breaks a page.
 */
export interface SectorDef {
  slug: string;
  name: string;
  /** Lower-case noun used in sentences: "banka hisseleri". */
  noun: string;
  blurb: string;
  symbols: string[];
}

export const BIST_SECTORS: SectorDef[] = [
  {
    slug: 'banka-hisseleri',
    name: 'Banka',
    noun: 'banka hisseleri',
    blurb: 'Faiz kararları, kredi büyümesi ve aktif kalitesi banka hisselerini doğrudan etkiler. Bankaları değerlendirirken F/K ile birlikte PD/DD ve özkaynak kârlılığına bakılır.',
    symbols: ['AKBNK', 'GARAN', 'ISCTR', 'YKBNK', 'HALKB', 'VAKBN', 'TSKB', 'SKBNK', 'ALBRK', 'QNBTR', 'QNBFB', 'ICBCT', 'KLNMA'],
  },
  {
    slug: 'holding-hisseleri',
    name: 'Holding',
    noun: 'holding hisseleri',
    blurb: 'Holdingler birçok sektördeki iştiraklerinin toplam değerini yansıtır. Net aktif değerine göre iskonto oranı en çok izlenen göstergedir.',
    symbols: ['KCHOL', 'SAHOL', 'DOHOL', 'AGHOL', 'ALARK', 'TKFEN', 'NTHOL', 'GSDHO', 'GLYHO', 'POLHO', 'BERA', 'TAVHL'],
  },
  {
    slug: 'enerji-hisseleri',
    name: 'Enerji',
    noun: 'enerji hisseleri',
    blurb: 'Elektrik üretimi, dağıtımı ve yenilenebilir enerji şirketleri. Elektrik fiyatları, kur ve yatırım harcamaları sektörün ana belirleyicileridir.',
    symbols: ['AKSEN', 'ENJSA', 'ZOREN', 'AYDEM', 'ODAS', 'CWENE', 'SMRTG', 'GWIND', 'EUPWR', 'AKFYE', 'ALFAS', 'YEOTK', 'NATEN', 'AYEN', 'BIOEN', 'CANTE', 'ESEN', 'TUPRS', 'ENERY', 'ASTOR'],
  },
  {
    slug: 'demir-celik-hisseleri',
    name: 'Demir-Çelik ve Metal',
    noun: 'demir-çelik hisseleri',
    blurb: 'Küresel çelik fiyatları, enerji maliyetleri ve ihracat talebi demir-çelik şirketlerinin kârlılığını belirler.',
    symbols: ['EREGL', 'KRDMD', 'ISDMR', 'CEMTS', 'KCAER', 'BRSAN', 'BURCE', 'TUCLK', 'OZRDN', 'ASUZU'],
  },
  {
    slug: 'havacilik-hisseleri',
    name: 'Havacılık ve Ulaştırma',
    noun: 'havacılık hisseleri',
    blurb: 'Yolcu sayısı, yakıt fiyatları ve döviz kuru havacılık şirketlerinin ana gündemidir. Turizm sezonu da güçlü bir mevsimsellik yaratır.',
    symbols: ['THYAO', 'PGSUS', 'TAVHL', 'CLEBI', 'PASEU', 'RYSAS'],
  },
  {
    slug: 'savunma-hisseleri',
    name: 'Savunma Sanayii',
    noun: 'savunma hisseleri',
    blurb: 'Kamu ve ihracat siparişleri savunma şirketlerinin büyümesini belirler. Sipariş bakiyesi en çok izlenen veridir.',
    symbols: ['ASELS', 'SDTTR', 'OTKAR', 'KATMR', 'ONRYT', 'PAPIL', 'ALTNY'],
  },
  {
    slug: 'teknoloji-hisseleri',
    name: 'Teknoloji ve Yazılım',
    noun: 'teknoloji hisseleri',
    blurb: 'Yazılım, donanım ve bilişim hizmetleri şirketleri. Büyüme hızı ve tekrarlayan gelir oranı değerlemeyi belirler.',
    symbols: ['LOGO', 'KAREL', 'NETAS', 'INDES', 'ARDYZ', 'LINK', 'MIATK', 'ALCTL', 'KFEIN', 'FONET', 'ESCOM', 'DGATE', 'MTRKS', 'ARENA', 'DESPC', 'KONTR', 'REEDR', 'VBTYZ'],
  },
  {
    slug: 'perakende-gida-hisseleri',
    name: 'Perakende ve Gıda',
    noun: 'perakende ve gıda hisseleri',
    blurb: 'Market zincirleri, gıda ve içecek üreticileri. Enflasyon, tüketici harcamaları ve maliyet yönetimi öne çıkan konulardır.',
    symbols: ['BIMAS', 'MGROS', 'SOKM', 'CRFSA', 'MAVI', 'BIZIM', 'ULKER', 'TATGD', 'CCOLA', 'AEFES', 'BANVT', 'PETUN', 'PNSUT', 'KERVT', 'TUKAS', 'TBORG', 'KNFRT'],
  },
  {
    slug: 'gyo-hisseleri',
    name: 'Gayrimenkul (GYO)',
    noun: 'GYO hisseleri',
    blurb: 'Gayrimenkul yatırım ortaklıkları; konut satışları, kira gelirleri ve faiz ortamına duyarlıdır. Net aktif değerine göre iskonto sıkça izlenir.',
    symbols: ['EKGYO', 'ISGYO', 'TRGYO', 'ALGYO', 'KLGYO', 'OZKGY', 'SNGYO', 'ZRGYO', 'PAGYO', 'HLGYO', 'DZGYO', 'VKGYO', 'YGGYO', 'RYGYO', 'AVPGY', 'TSGYO', 'KZBGY', 'PSGYO'],
  },
  {
    slug: 'otomotiv-hisseleri',
    name: 'Otomotiv',
    noun: 'otomotiv hisseleri',
    blurb: 'Araç üreticileri, distribütörler ve yan sanayi. İç pazar satışları, ihracat ve kredi koşulları belirleyicidir.',
    symbols: ['FROTO', 'TOASO', 'DOAS', 'OTKAR', 'TTRAK', 'ASUZU', 'KARSN', 'BFREN', 'EGEEN', 'JANTS', 'FMIZP', 'GOODY', 'BRISA'],
  },
  {
    slug: 'cimento-hisseleri',
    name: 'Çimento ve İnşaat Malzemesi',
    noun: 'çimento hisseleri',
    blurb: 'İnşaat faaliyeti, enerji maliyetleri ve ihracat çimento şirketlerinin kârlılığını etkiler.',
    symbols: ['AKCNS', 'CIMSA', 'OYAKC', 'NUHCM', 'BUCIM', 'AFYON', 'BTCIM', 'GOLTS', 'KONYA', 'BSOKE', 'ADANA'],
  },
  {
    slug: 'sigorta-hisseleri',
    name: 'Sigorta',
    noun: 'sigorta hisseleri',
    blurb: 'Sigorta ve emeklilik şirketleri; prim üretimi, hasar oranları ve faiz gelirleriyle izlenir.',
    symbols: ['AKGRT', 'ANSGR', 'TURSG', 'AGESA', 'ANHYT', 'RAYSG'],
  },
  {
    slug: 'kimya-hisseleri',
    name: 'Kimya ve Petrokimya',
    noun: 'kimya hisseleri',
    blurb: 'Petrokimya, gübre ve özel kimya üreticileri. Hammadde fiyatları ve küresel talep belirleyicidir.',
    symbols: ['SASA', 'PETKM', 'ALKIM', 'GUBRF', 'BAGFS', 'HEKTS', 'KMPUR', 'DYOBY', 'AKSA', 'EGGUB'],
  },
  {
    slug: 'telekom-hisseleri',
    name: 'Telekomünikasyon',
    noun: 'telekom hisseleri',
    blurb: 'Mobil ve sabit hat operatörleri. Abone büyümesi, fiyat ayarlamaları ve yatırım harcamaları öne çıkar.',
    symbols: ['TCELL', 'TTKOM'],
  },
];

export const US_SECTORS: SectorDef[] = [
  {
    slug: 'teknoloji-devleri',
    name: 'Teknoloji Devleri',
    noun: 'teknoloji devleri',
    blurb: 'Apple, Microsoft, Alphabet, Amazon, Meta ve diğer büyük teknoloji şirketleri. ABD endekslerinin en büyük ağırlıklarını oluşturur.',
    symbols: ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'TSLA', 'ORCL', 'CRM', 'ADBE', 'IBM'],
  },
  {
    slug: 'yari-iletken-hisseleri',
    name: 'Yarı İletken',
    noun: 'yarı iletken hisseleri',
    blurb: 'Çip tasarımcıları ve üreticileri. Yapay zeka yatırımları sektörün büyümesini sürüklüyor.',
    symbols: ['NVDA', 'AMD', 'AVGO', 'TSM', 'INTC', 'QCOM', 'MU', 'ARM', 'SMCI', 'MRVL', 'ASML', 'AMAT', 'LRCX', 'KLAC', 'TXN', 'ON'],
  },
  {
    slug: 'banka-hisseleri',
    name: 'ABD Bankaları',
    noun: 'ABD banka hisseleri',
    blurb: 'Büyük ABD bankaları ve yatırım bankaları. Fed faiz kararları ve kredi kalitesi en önemli gündemdir.',
    symbols: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'SCHW', 'USB', 'PNC', 'HOOD'],
  },
  {
    slug: 'enerji-hisseleri',
    name: 'ABD Enerji',
    noun: 'ABD enerji hisseleri',
    blurb: 'Petrol, doğalgaz ve rafineri şirketleri ile yenilenebilir enerji üreticileri.',
    symbols: ['XOM', 'CVX', 'COP', 'SLB', 'PSX', 'OXY', 'EOG', 'MPC', 'VLO', 'FSLR', 'ENPH', 'NEE', 'SEDG'],
  },
  {
    slug: 'saglik-hisseleri',
    name: 'Sağlık ve İlaç',
    noun: 'sağlık hisseleri',
    blurb: 'İlaç, biyoteknoloji ve sağlık hizmetleri şirketleri. Klinik çalışma sonuçları ve regülasyon önemli etkenlerdir.',
    symbols: ['UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'NVO', 'AMGN', 'HUM', 'CVS', 'BMY', 'GILD', 'MRNA', 'TMO'],
  },
];
