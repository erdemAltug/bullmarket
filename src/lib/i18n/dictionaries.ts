import type { Language } from '@/lib/preferences';

export type Dictionary = {
  nav: {
    overview: string;
    opportunities: string;
    bist: string;
    heatmap: string;
    us: string;
    funds: string;
    crypto: string;
    fx: string;
    rates: string;
    compare: string;
    signals: string;
    targets: string;
    smartMoney: string;
    portfolio: string;
    portfolioAudit: string;
    alerts: string;
    dividends: string;
    academy: string;
    blog: string;
  };
  navGroups: {
    terminal: string;
    markets: string;
    analysis: string;
    learn: string;
    account: string;
  };
  header: {
    tagline: string;
    preferences: string;
    language: string;
    theme: string;
    currency: string;
  };
  themeDark: string;
  themeLight: string;
  themeTerminal: string;
  common: {
    loading: string;
    clickForAlert: string;
    tickers: string;
    noOrderBook: string;
  };
};

const tr: Dictionary = {
  nav: {
    overview: 'Piyasa özeti',
    opportunities: 'AI Fırsatlar',
    bist: 'BİST',
    heatmap: 'Isı Haritası',
    us: 'NASDAQ / ABD',
    funds: "Fonlar & ETF'ler",
    crypto: 'Kripto',
    fx: 'Döviz',
    rates: 'Faiz & Kredi',
    compare: '1v1 Kıyasla',
    signals: 'AI Sinyalleri',
    targets: 'Hedef Fiyatlar',
    smartMoney: 'Balina & Takas',
    portfolio: 'Envanter',
    portfolioAudit: 'AI Portföy Doktoru',
    alerts: 'Alarmlar',
    dividends: 'Temettü Karnesi',
    academy: 'Eğitim Hub',
    blog: 'Blog',
  },
  navGroups: {
    terminal: 'Terminal',
    markets: 'Piyasalar',
    analysis: 'Analiz',
    learn: 'Öğren',
    account: 'Hesabım',
  },
  header: {
    tagline: 'BİST · NASDAQ · Kripto · Döviz',
    preferences: 'Tercihler',
    language: 'Dil',
    theme: 'Tema',
    currency: 'Para Birimi',
  },
  themeDark: 'Koyu Cam',
  themeLight: 'Açık',
  themeTerminal: 'Terminal',
  common: {
    loading: 'Yükleniyor…',
    clickForAlert: 'Alarm kurmak için tıklayın',
    tickers: 'Kaset',
    noOrderBook: 'Emir defteri yok',
  },
};

const en: Dictionary = {
  nav: {
    overview: 'Dashboard',
    opportunities: 'AI Opportunities',
    bist: 'BIST',
    heatmap: 'Heatmap',
    us: 'NASDAQ / US',
    funds: 'Funds & ETFs',
    crypto: 'Crypto',
    fx: 'FX',
    rates: 'Rates & credit',
    compare: '1v1 Compare',
    signals: 'AI Signals',
    targets: 'Price Targets',
    smartMoney: 'Smart Money',
    portfolio: 'Portfolio',
    portfolioAudit: 'Portfolio Audit',
    alerts: 'Alerts',
    dividends: 'Dividend Desk',
    academy: 'Academy',
    blog: 'Blog',
  },
  navGroups: {
    terminal: 'Terminal',
    markets: 'Markets',
    analysis: 'Analysis',
    learn: 'Learn',
    account: 'Account',
  },
  header: {
    tagline: 'BIST · NASDAQ · Crypto · FX',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    currency: 'Currency',
  },
  themeDark: 'Dark Glass',
  themeLight: 'Light',
  themeTerminal: 'Terminal',
  common: {
    loading: 'Loading…',
    clickForAlert: 'Click to set an alert',
    tickers: 'Tickers',
    noOrderBook: 'No order book',
  },
};

const de: Dictionary = {
  nav: {
    overview: 'Übersicht',
    opportunities: 'KI-Chancen',
    bist: 'BIST',
    heatmap: 'Heatmap',
    us: 'NASDAQ / US',
    funds: 'Fonds & ETFs',
    crypto: 'Krypto',
    fx: 'Devisen',
    rates: 'Zinsen & Kredit',
    compare: '1v1 Vergleich',
    signals: 'KI-Signale',
    targets: 'Kursziele',
    smartMoney: 'Smart Money',
    portfolio: 'Portfolio',
    portfolioAudit: 'Portfolio-Check',
    alerts: 'Alarme',
    dividends: 'Dividenden',
    academy: 'Akademie',
    blog: 'Blog',
  },
  navGroups: {
    terminal: 'Terminal',
    markets: 'Märkte',
    analysis: 'Analyse',
    learn: 'Lernen',
    account: 'Konto',
  },
  header: {
    tagline: 'BIST · NASDAQ · Krypto · Devisen',
    preferences: 'Einstellungen',
    language: 'Sprache',
    theme: 'Design',
    currency: 'Währung',
  },
  themeDark: 'Dunkles Glas',
  themeLight: 'Hell',
  themeTerminal: 'Terminal',
  common: {
    loading: 'Laden…',
    clickForAlert: 'Klicken für Alarm',
    tickers: 'Ticker',
    noOrderBook: 'Kein Orderbuch',
  },
};

const es: Dictionary = {
  nav: {
    overview: 'Resumen',
    opportunities: 'Oportunidades IA',
    bist: 'BIST',
    heatmap: 'Mapa de calor',
    us: 'NASDAQ / EE.UU.',
    funds: 'Fondos y ETFs',
    crypto: 'Cripto',
    fx: 'Divisas',
    rates: 'Tipos y crédito',
    compare: 'Comparar 1v1',
    signals: 'Señales IA',
    targets: 'Precios objetivo',
    smartMoney: 'Smart Money',
    portfolio: 'Cartera',
    portfolioAudit: 'Auditoría',
    alerts: 'Alertas',
    dividends: 'Dividendos',
    academy: 'Academia',
    blog: 'Blog',
  },
  navGroups: {
    terminal: 'Terminal',
    markets: 'Mercados',
    analysis: 'Análisis',
    learn: 'Aprender',
    account: 'Cuenta',
  },
  header: {
    tagline: 'BIST · NASDAQ · Cripto · Divisas',
    preferences: 'Preferencias',
    language: 'Idioma',
    theme: 'Tema',
    currency: 'Moneda',
  },
  themeDark: 'Vidrio oscuro',
  themeLight: 'Claro',
  themeTerminal: 'Terminal',
  common: {
    loading: 'Cargando…',
    clickForAlert: 'Clic para crear alerta',
    tickers: 'Tickers',
    noOrderBook: 'Sin libro de órdenes',
  },
};

export const dictionaries: Record<Language, Dictionary> = { tr, en, de, es };

export function getDictionary(lang: Language): Dictionary {
  return dictionaries[lang] ?? dictionaries.tr;
}
