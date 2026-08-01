import type { Language } from '@/lib/preferences';

export type Dictionary = {
  nav: {
    overview: string;
    bist: string;
    heatmap: string;
    us: string;
    crypto: string;
    fx: string;
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
    overview: 'Overview',
    bist: 'BİST',
    heatmap: 'Isı Haritası',
    us: 'NASDAQ / ABD',
    crypto: 'Crypto',
    fx: 'Döviz',
    compare: '1v1 Kıyasla',
    signals: 'AI Sinyalleri',
    targets: 'Hedef Fiyatlar',
    smartMoney: 'Balina & Takas',
    portfolio: 'Portföyüm',
    portfolioAudit: 'Portföy Analizi',
    alerts: 'Alarmlar',
    dividends: 'Temettü Karnesi',
    academy: 'Eğitim Hub',
    blog: 'Blog',
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
    tickers: 'Tickers',
    noOrderBook: 'Emir defteri yok',
  },
};

const en: Dictionary = {
  nav: {
    overview: 'Overview',
    bist: 'BIST',
    heatmap: 'Heatmap',
    us: 'NASDAQ / US',
    crypto: 'Crypto',
    fx: 'FX',
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
    bist: 'BIST',
    heatmap: 'Heatmap',
    us: 'NASDAQ / US',
    crypto: 'Krypto',
    fx: 'Devisen',
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
    bist: 'BIST',
    heatmap: 'Mapa de calor',
    us: 'NASDAQ / EE.UU.',
    crypto: 'Cripto',
    fx: 'Divisas',
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
