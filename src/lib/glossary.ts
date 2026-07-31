export const TERM_GLOSSARY: Record<
  string,
  { term: string; short: string }
> = {
  fk: {
    term: 'F/K',
    short:
      "Şirketin 1 TL'lik kârı için kaç TL ödediğinizi gösterir. Düşük olması genelde hissenin ucuz olduğuna işaret edebilir.",
  },
  pddd: {
    term: 'PD/DD',
    short:
      'Piyasa değerinin defter değerine oranıdır. 1’in altı genelde iskontolu, yüksek oranlar primli fiyatlamaya işaret edebilir.',
  },
  rsi: {
    term: 'RSI',
    short:
      '14 günlük Göreli Güç Endeksi. 30 altı aşırı satım, 70 üstü aşırı alım bölgesi olarak okunur.',
  },
  sma50: {
    term: 'SMA 50',
    short:
      'Son 50 günün ortalama fiyatıdır. Fiyatın üstüne çıkması kısa-orta vadeli momentum güçlenmesine işaret edebilir.',
  },
  sma200: {
    term: 'SMA 200',
    short:
      'Uzun vadeli trend çizgisidir. Fiyatın üzerinde kalması genelde yükseliş trendini destekler.',
  },
  beta: {
    term: 'Beta',
    short:
      'Hissenin piyasaya göre ne kadar oynak olduğunu gösterir. 1’den yüksek = piyasadan daha volatil.',
  },
  volume: {
    term: 'Hacim',
    short:
      'İşlem gören lot/adet. Ani hacim artışı genelde kırılım veya haber akışına eşlik eder.',
  },
  roe: {
    term: 'ROE',
    short:
      'Özsermaye kârlılığı: şirketin özsermayesiyle ne kadar kâr ürettiğini gösterir.',
  },
  mcap: {
    term: 'Piyasa Değeri',
    short:
      'Hisse fiyatı × dolaşımdaki pay adedi. Şirketin toplam borsa değeridir.',
  },
  yield: {
    term: 'Temettü Verimi',
    short:
      'Yıllık temettünün hisse fiyatına oranıdır. Pasif gelir odaklı yatırımcılar için kritik metriktir.',
  },
  peg: {
    term: 'PEG',
    short:
      'F/K’nın büyüme hızına bölünmüş halidir. 1 civarı dengeli, çok yüksek oranlar pahalı büyümeye işaret edebilir.',
  },
};

export type TermKey = keyof typeof TERM_GLOSSARY;
