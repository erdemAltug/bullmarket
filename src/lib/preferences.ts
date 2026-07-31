export type Language = 'tr' | 'en' | 'de' | 'es';
export type AppCurrency = 'TRY' | 'USD' | 'EUR';
export type AppTheme = 'dark' | 'light' | 'terminal';

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'tr', label: 'Türkçe', flag: 'TR' },
  { value: 'en', label: 'English', flag: 'EN' },
  { value: 'de', label: 'Deutsch', flag: 'DE' },
  { value: 'es', label: 'Español', flag: 'ES' },
];

export const CURRENCIES: {
  value: AppCurrency;
  label: string;
  symbol: string;
}[] = [
  { value: 'TRY', label: 'TRY', symbol: '₺' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
];

export const THEMES: { value: AppTheme; labelKey: string }[] = [
  { value: 'dark', labelKey: 'themeDark' },
  { value: 'light', labelKey: 'themeLight' },
  { value: 'terminal', labelKey: 'themeTerminal' },
];

export const LOCALE_MAP: Record<Language, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
};

export const PREF_KEYS = {
  lang: 'bullsye_lang',
  currency: 'bullsye_currency',
  theme: 'bullsye_theme',
} as const;

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function setPrefCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
