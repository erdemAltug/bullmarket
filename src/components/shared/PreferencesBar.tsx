'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Languages, Moon, Palette, Sun, Terminal } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeCookieSync, usePreferences } from '@/components/providers/PreferencesProvider';
import {
  CURRENCIES,
  LANGUAGES,
  THEMES,
  type AppCurrency,
  type AppTheme,
  type Language,
} from '@/lib/preferences';
import { cn } from '@/lib/utils';

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'light') return <Sun className="size-3.5" />;
  if (theme === 'terminal') return <Terminal className="size-3.5" />;
  return <Moon className="size-3.5" />;
}

function Segmented({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]'
      )}
    >
      {active ? <Check className="size-3" /> : null}
      {children}
    </button>
  );
}

export function PreferencesBar() {
  const { language, setLanguage, currency, setCurrency, t } = usePreferences();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentTheme = (theme || resolvedTheme || 'dark') as AppTheme;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const themeLabel = (key: string) => {
    if (key === 'themeDark') return t.themeDark;
    if (key === 'themeLight') return t.themeLight;
    return t.themeTerminal;
  };

  return (
    <div className="relative" ref={ref}>
      <ThemeCookieSync />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t.header.preferences}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 text-xs font-medium text-[var(--foreground)] backdrop-blur-md transition-colors hover:border-[var(--accent)]/40',
          open && 'border-[var(--accent)]/50'
        )}
      >
        <Languages className="size-3.5 text-[var(--accent)]" />
        <span className="hidden sm:inline">{language.toUpperCase()}</span>
        <span className="text-[var(--muted)]">·</span>
        <span>{currency}</span>
        <Palette className="size-3.5 text-[var(--muted)]" />
      </button>

      {open ? (
        <div className="absolute right-0 z-[80] mt-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--popover-bg)] p-3 shadow-2xl backdrop-blur-xl">
          <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t.header.preferences}
          </p>

          <div className="space-y-3">
            <Segmented label={t.header.language}>
              {LANGUAGES.map((l) => (
                <Chip
                  key={l.value}
                  active={language === l.value}
                  title={l.label}
                  onClick={() => setLanguage(l.value as Language)}
                >
                  {l.flag}
                </Chip>
              ))}
            </Segmented>

            <Segmented label={t.header.theme}>
              {THEMES.map((th) => (
                <Chip
                  key={th.value}
                  active={currentTheme === th.value}
                  onClick={() => setTheme(th.value)}
                >
                  <ThemeIcon theme={th.value} />
                  <span className="hidden xs:inline sm:inline">
                    {themeLabel(th.labelKey)}
                  </span>
                </Chip>
              ))}
            </Segmented>

            <Segmented label={t.header.currency}>
              {CURRENCIES.map((c) => (
                <Chip
                  key={c.value}
                  active={currency === c.value}
                  onClick={() => setCurrency(c.value as AppCurrency)}
                >
                  {c.symbol} {c.label}
                </Chip>
              ))}
            </Segmented>
          </div>
        </div>
      ) : null}
    </div>
  );
}
