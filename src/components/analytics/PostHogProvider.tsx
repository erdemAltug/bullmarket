'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { authClient } from '@/lib/auth/client';

const SIGNUP_KEY = 'bullsye:signup-tracked';
/** Accounts created this recently count as a fresh sign-up (covers Google redirects). */
const SIGNUP_WINDOW_MS = 30 * 60_000;

function PostHogIdentify() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    const user = session?.user;
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });
      const created = new Date(
        (user as { createdAt?: string | Date }).createdAt ?? 0
      ).getTime();
      try {
        if (
          Date.now() - created < SIGNUP_WINDOW_MS &&
          localStorage.getItem(SIGNUP_KEY) !== user.id
        ) {
          localStorage.setItem(SIGNUP_KEY, user.id);
          posthog.capture('signup_completed', {
            path: window.location.pathname,
          });
        }
      } catch {
        /* private mode */
      }
      return;
    }
    posthog.reset();
  }, [isPending, session?.user?.id, session?.user?.email, session?.user?.name]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
