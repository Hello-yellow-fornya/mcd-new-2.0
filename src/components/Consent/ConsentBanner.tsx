'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGtm, OPEN_CONSENT_EVENT, pushConsentUpdate, readConsent, writeConsent } from '@/lib/analytics';
import styles from './ConsentBanner.module.css';

/**
 * The consent banner (§0, appendix §8), in the standard form: what is
 * essential, what is optional, and two equal choices with no dark patterns.
 * Reopened from "Cookie settings" in the footer. Accepting loads GTM;
 * declining loads nothing.
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
          Cookies on this site
        </p>
        <p id="consent-p" className={styles.p}>
          We use essential cookies to make this site work. We would also like to set optional cookies to measure how the site is used and to improve
          it. We will not set optional cookies unless you accept them. <Link href="/cookies/">Read our cookie policy</Link>.
        </p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.yes}`} onClick={() => choose(true)}>
            Accept all cookies
          </button>
          <button type="button" className={`${styles.btn} ${styles.no}`} onClick={() => choose(false)}>
            Reject optional cookies
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
