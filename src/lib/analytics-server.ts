import 'server-only';

const HOST = 'https://eu.i.posthog.com';

/**
 * Server-side PostHog capture for things no browser sees (cron e-mails).
 * Uses the public project token; silently no-ops when it is not set.
 */
export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Record<string, string | number | boolean | null> = {}
): Promise<void> {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
  if (!token) return;
  try {
    await fetch(`${HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: token,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: 'bullsye-server' },
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* analytics must never break the cron */
  }
}
