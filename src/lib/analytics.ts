/**
 * Tracking and consent (§0, appendix §8), 2.0's own GTM container. Nothing loads before consent: the page
 * pushes consent defaults (all denied) and buffers events in window.dataLayer;
 * Google Tag Manager is only injected once the visitor grants a category.
 * GA4 and Google Ads live inside GTM and follow consent mode v2.
 */

export const CONSENT_COOKIE = 'mcd2_consent';
export const CONSENT_VERSION = 1;
export const OPEN_CONSENT_EVENT = 'mcd:open-consent';

export type ConsentChoice = 'granted' | 'denied';
export type Consent = { v: number; analytics: ConsentChoice; ads: ConsentChoice; at: string };

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    __mcdGtmLoaded?: boolean;
  }
}

/** Legal pages carry page views only (appendix §8). */
export const LEGAL_PATHS = ['/privacy-policy/', '/terms/', '/complaints/', '/cookies/'];

export function isLegalPath(pathname: string): boolean {
  return LEGAL_PATHS.includes(pathname.endsWith('/') ? pathname : `${pathname}/`);
}

export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!m) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(m[1])) as Consent;
    return parsed.v === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: ConsentChoice, ads: ConsentChoice): Consent {
  const consent: Consent = { v: CONSENT_VERSION, analytics, ads, at: new Date().toISOString() };
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${maxAge}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  return consent;
}

function dataLayer(): DataLayerEvent[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/** gtag-shaped command (an array) so GTM's consent mode reads it. */
function gtag(...args: unknown[]) {
  dataLayer().push(args as unknown as DataLayerEvent);
}

export function pushConsentDefaults() {
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });
}

export function pushConsentUpdate(consent: Consent) {
  gtag('consent', 'update', {
    ad_storage: consent.ads,
    ad_user_data: consent.ads,
    ad_personalization: consent.ads,
    analytics_storage: consent.analytics,
  });
  track('consent_update', { analytics: consent.analytics, ads: consent.ads });
}

/** Injects the GTM loader once. Called only after a grant. */
export function loadGtm(id: string) {
  if (!id || window.__mcdGtmLoaded) return;
  window.__mcdGtmLoaded = true;
  dataLayer().push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  s.setAttribute('data-gtm', id);
  document.head.appendChild(s);
}

/** Push a named event. See docs/tracking.md for the spec. */
export function track(event: string, params: DataLayerEvent = {}) {
  if (typeof window === 'undefined') return;
  dataLayer().push({ event, ...params });
}
