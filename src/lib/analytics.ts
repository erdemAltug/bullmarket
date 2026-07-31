type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void;
    posthog?: { capture: (event: string, props?: AnalyticsProps) => void };
  }
}

/** Fire product analytics (Clarity custom tags + optional PostHog). */
export function trackEvent(event: string, props: AnalyticsProps = {}) {
  if (typeof window === 'undefined') return;

  try {
    window.posthog?.capture(event, props);
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
