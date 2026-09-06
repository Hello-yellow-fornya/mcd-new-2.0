'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isLegalPath, loadGtm, pushConsentDefaults, readConsent, track } from '@/lib/analytics';

/**
 * Sets consent defaults, loads GTM only when consent was given, sends a
 * page_view on every route change, and turns tel: clicks into phone_click
 * events. Legal pages get the page view and nothing else (appendix §8).
 */
export function Analytics({ gtmId }: { gtmId?: string }) {
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    pushConsentDefaults();
    const consent = readConsent();
    if (gtmId && consent && (consent.analytics === 'granted' || consent.ads === 'granted')) loadGtm(gtmId);
  }, [gtmId]);

  useEffect(() => {
    track('page_view', { page_path: pathname, page_title: document.title, legal: isLegalPath(pathname) });
  }, [pathname]);

  useEffect(() => {
    if (isLegalPath(pathname)) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (!a) return;
      const where =
        a.closest('[data-placement]')?.getAttribute('data-placement') ||
        (a.closest('[data-hero]') ? 'hero' : null) ||
        (a.closest('[data-band]') ? 'band' : null) ||
        (a.closest('[data-drawer]') ? 'drawer' : null) ||
        (a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : null) ||
        a.closest('section')?.id ||
        'body';
      track('phone_click', { phone: a.getAttribute('href')?.replace('tel:', ''), placement: where, cta: a.dataset.cta, page_path: pathname });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  return null;
}
