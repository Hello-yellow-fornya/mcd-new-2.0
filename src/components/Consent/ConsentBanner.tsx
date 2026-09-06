'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGtm, OPEN_CONSENT_EVENT, pushConsentUpdate, readConsent, writeConsent } from '@/lib/analytics';
import styles from './ConsentBanner.module.css';

/**
 * The consent banner (§0, appendix §8): the 1.0 banner restyled in 2.0
 * colours. Two equal choices, no dark patterns, reopened from "Cookie
 * settings" in the footer. Accepting loads GTM; declining loads nothing.
 */
export function ConsentBanner({ gtmId }: { gtmId?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
  }, []);

  function choose(all: boolean) {
    const consent = writeConsent(all ? 'granted' : 'denied', all ? 'granted' : 'denied');
    pushConsentUpdate(consent);
    if (all && gtmId) loadGtm(gtmId);
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div className={styles.banner} role="dialog" aria-modal="false" aria-labelledby="consent-h" aria-describedby="consent-p" data-testid="consent-banner">
      <div className={styles.card}>
        <p id="consent-h" className={styles.h}>
          Cookies, briefly.
        </p>
        <p id="consent-p" className={styles.p}>
          The site works without them. If you say yes, we also measure visits and calls with Google Analytics and Google Ads. Nothing is set until you choose.{' '}
          <Link href="/cookies/">What each one does</Link>.
        </p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.yes}`} onClick={() => choose(true)}>
            Yes, measure visits
          </button>
          <button type="button" className={`${styles.btn} ${styles.no}`} onClick={() => choose(false)}>
            No, just the essentials
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link that reopens the banner. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Cookie settings
    </button>
  );
}
