'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { AuthGateProvider } from '@/components/auth/AuthGateProvider';
import { ProRequestProvider } from '@/components/pro/ProRequest';
import { AuthToast } from '@/components/layout/AuthToast';
import { PreferencesProvider } from '@/components/providers/PreferencesProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            refetchInterval: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <PostHogProvider>
        <PreferencesProvider>
          <AuthGateProvider>
            <ProRequestProvider>
              {children}
              <AuthToast />
            </ProRequestProvider>
          </AuthGateProvider>
        </PreferencesProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
