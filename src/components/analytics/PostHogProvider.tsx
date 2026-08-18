'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { authClient } from '@/lib/auth/client';

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
