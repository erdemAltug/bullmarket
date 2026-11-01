/**
 * Google Ads conversion helpers. Everything no-ops unless
 * NEXT_PUBLIC_GOOGLE_ADS_ID (AW-…) is set, and ad cookies stay off until the
 * visitor accepts them (Consent Mode v2, KVKK).
 */

export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || '';
const SIGNUP_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL?.trim() || '';

export const CONSENT_KEY = 'bullsye:ads-consent';
export type AdsConsent = 'granted' | 'denied';

type Gtag = (...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === 'undefined') return null;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof g === 'function' ? g : null;
}

export function readAdsConsent(): AdsConsent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setAdsConsent(value: AdsConsent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* private mode */
  }
  gtag()?.('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

/** Fires the Google Ads sign-up conversion (once per new account). */
export function reportSignupConversion() {
  if (!ADS_ID || !SIGNUP_LABEL) return;
  gtag()?.('event', 'conversion', { send_to: `${ADS_ID}/${SIGNUP_LABEL}` });
}
