'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ADS_ID, CONSENT_KEY, readAdsConsent, setAdsConsent } from '@/lib/ads';

const noopSubscribe = () => () => {};

/**
 * Google Ads tag with Consent Mode v2: ad cookies are denied by default and
 * only granted after the visitor accepts. Renders nothing without an AW- id.
 */
export function GoogleAds() {
  const stored = useSyncExternalStore(noopSubscribe, readAdsConsent, () => 'denied' as const);
  const [answered, setAnswered] = useState(false);
  if (!ADS_ID) return null;

  function choose(value: 'granted' | 'denied') {
    setAdsConsent(value);
    setAnswered(true);
  }

  return (
    <>
      <Script id="google-ads-consent" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('${CONSENT_KEY}')==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});}}catch(e){}
gtag('js',new Date());gtag('config','${ADS_ID}');`}
      </Script>
      <Script
        id="google-ads-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
      />

      {stored === null && !answered ? (
        <div
          role="dialog"
          aria-label="Çerez tercihi"
          className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl md:bottom-4"
        >
          <p className="text-sm leading-relaxed">
            Reklamlarımızın işe yarayıp yaramadığını ölçmek için Google reklam
            çerezlerini kullanmak istiyoruz. Siteyi kullanmak için gerekli değildir.{' '}
            <Link href="/gizlilik" className="text-[var(--accent)] underline">
              Gizlilik
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => choose('granted')}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#042f2e] hover:brightness-110"
            >
              Kabul et
            </button>
            <button
              type="button"
              onClick={() => choose('denied')}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
            >
              Reddet
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
