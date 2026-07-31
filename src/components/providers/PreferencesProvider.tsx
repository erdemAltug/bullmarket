'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import {
  LOCALE_MAP,
  PREF_KEYS,
  readCookie,
  setPrefCookie,
  type AppCurrency,
  type Language,
} from '@/lib/preferences';

interface FxSnapshot {
  usdTry: number;
  eurTry: number;
}

interface PreferencesContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: AppCurrency;
  setCurrency: (curr: AppCurrency) => void;
  t: Dictionary;
  locale: string;
  /** Convert amount from source currency into display currency, then format */
  formatPrice: (amount: number, fromCurrency?: AppCurrency | string) => string;
  convertAmount: (amount: number, from: AppCurrency | string) => number;
  ready: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

function normalizeCurrency(c?: string): AppCurrency {
  const u = (c || 'TRY').toUpperCase();
  if (u === 'USD' || u === 'EUR' || u === 'TRY') return u;
  return 'TRY';
}

function PreferencesInner({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');
  const [currency, setCurrencyState] = useState<AppCurrency>('TRY');
  const [fx, setFx] = useState<FxSnapshot>({ usdTry: 34, eurTry: 37 });
  const [ready, setReady] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search)
      .get('lang')
      ?.toLowerCase();
    const fromUrl =
      urlLang === 'tr' || urlLang === 'en' || urlLang === 'de' || urlLang === 'es'
        ? (urlLang as Language)
        : null;

    const savedLang =
      fromUrl ||
      (localStorage.getItem(PREF_KEYS.lang) as Language | null) ||
      (readCookie(PREF_KEYS.lang) as Language | null) ||
      'tr';
    const savedCurr =
      (localStorage.getItem(PREF_KEYS.currency) as AppCurrency | null) ||
      (readCookie(PREF_KEYS.currency) as AppCurrency | null) ||
      'TRY';
    const savedTheme =
      localStorage.getItem(PREF_KEYS.theme) ||
      readCookie(PREF_KEYS.theme) ||
      'dark';

    if (['tr', 'en', 'de', 'es'].includes(savedLang)) {
      setLanguageState(savedLang as Language);
      document.documentElement.lang = savedLang;
      if (fromUrl) {
        localStorage.setItem(PREF_KEYS.lang, fromUrl);
        setPrefCookie(PREF_KEYS.lang, fromUrl);
      }
    }
    if (['TRY', 'USD', 'EUR'].includes(savedCurr)) {
      setCurrencyState(savedCurr as AppCurrency);
    }
    if (['dark', 'light', 'terminal'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    setReady(true);
  }, [setTheme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/fx?codes=USD,EUR');
        const json = await res.json();
        if (!json.success || cancelled) return;
        const rates = json.data?.rates as
          | { code: string; forexSelling?: number; forexBuying?: number }[]
          | undefined;
        const usd = rates?.find((r) => r.code === 'USD');
        const eur = rates?.find((r) => r.code === 'EUR');
        setFx({
          usdTry: usd?.forexSelling || usd?.forexBuying || 34,
          eurTry: eur?.forexSelling || eur?.forexBuying || 37,
        });
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(PREF_KEYS.lang, lang);
    setPrefCookie(PREF_KEYS.lang, lang);
    document.documentElement.lang = lang;
  }, []);

  const setCurrency = useCallback((curr: AppCurrency) => {
    setCurrencyState(curr);
    localStorage.setItem(PREF_KEYS.currency, curr);
    setPrefCookie(PREF_KEYS.currency, curr);
  }, []);

  const toTry = useCallback(
    (amount: number, from: AppCurrency) => {
      if (from === 'TRY') return amount;
      if (from === 'USD') return amount * fx.usdTry;
      return amount * fx.eurTry;
    },
    [fx]
  );

  const fromTry = useCallback(
    (amountTry: number, to: AppCurrency) => {
      if (to === 'TRY') return amountTry;
      if (to === 'USD') return amountTry / fx.usdTry;
      return amountTry / fx.eurTry;
    },
    [fx]
  );

  const convertAmount = useCallback(
    (amount: number, fromCurrency: AppCurrency | string = 'TRY') => {
      const from = normalizeCurrency(fromCurrency);
      if (from === currency) return amount;
      return fromTry(toTry(amount, from), currency);
    },
    [currency, fromTry, toTry]
  );

  const formatPrice = useCallback(
    (amount: number, fromCurrency: AppCurrency | string = 'TRY') => {
      const converted = convertAmount(amount, fromCurrency);
      return new Intl.NumberFormat(LOCALE_MAP[language], {
        style: 'currency',
        currency,
        maximumFractionDigits: converted >= 1000 ? 2 : 4,
      }).format(converted);
    },
    [convertAmount, currency, language]
  );

  const value = useMemo<PreferencesContextType>(
    () => ({
      language,
      setLanguage,
      currency,
      setCurrency,
      t: getDictionary(language),
      locale: LOCALE_MAP[language],
      formatPrice,
      convertAmount,
      ready,
    }),
    [
      language,
      setLanguage,
      currency,
      setCurrency,
      formatPrice,
      convertAmount,
      ready,
    ]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light', 'terminal']}
      storageKey={PREF_KEYS.theme}
      disableTransitionOnChange
    >
      <PreferencesInner>{children}</PreferencesInner>
    </NextThemesProvider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}

/** Persist theme cookie whenever next-themes changes */
export function ThemeCookieSync() {
  const { theme, resolvedTheme } = useTheme();
  useEffect(() => {
    const t = theme || resolvedTheme;
    if (!t) return;
    setPrefCookie(PREF_KEYS.theme, t);
    localStorage.setItem(PREF_KEYS.theme, t);
  }, [theme, resolvedTheme]);
  return null;
}
