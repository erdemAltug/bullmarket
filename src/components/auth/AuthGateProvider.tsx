'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { trackEvent } from '@/lib/analytics';

type AuthTab = 'login' | 'register';

interface OpenAuthOptions {
  tab?: AuthTab;
  feature?: string;
  headline?: string;
  subtitle?: string;
}

interface AuthGateContextValue {
  openAuth: (opts?: OpenAuthOptions) => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>('register');
  const [headline, setHeadline] = useState<string | undefined>();
  const [subtitle, setSubtitle] = useState<string | undefined>();

  const openAuth = useCallback((opts?: OpenAuthOptions) => {
    setTab(opts?.tab ?? 'register');
    setHeadline(opts?.headline);
    setSubtitle(opts?.subtitle);
    if (opts?.feature) {
      trackEvent('feature_gate_clicked', { feature: opts.feature });
    }
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openAuth }), [openAuth]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AuthModal
        open={open}
        onOpenChange={setOpen}
        defaultTab={tab}
        headline={headline}
        subtitle={subtitle}
        growthMode
      />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error('useAuthGate must be used within AuthGateProvider');
  }
  return ctx;
}
