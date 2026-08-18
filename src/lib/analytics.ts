import posthog from 'posthog-js';

type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

/** Fire product analytics (PostHog + Clarity custom tags). */
export function trackEvent(event: string, props: AnalyticsProps = {}) {
  if (typeof window === 'undefined') return;

  try {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      posthog.capture(event, props);
    }
  } catch {
    /* ignore */
  }

  try {
    if (typeof window.clarity === 'function') {
      window.clarity('event', event);
      for (const [key, value] of Object.entries(props)) {
        if (value == null) continue;
        window.clarity('set', key, String(value));
      }
    }
  } catch {
    /* ignore */
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', event, props);
  }
}
