/**
 * Paid-traffic attribution (the PPC landing page, /ppc/third-party-claim/).
 *
 * Google Ads lands a visitor with a `gclid` and, usually, UTM parameters. The
 * claim they start may be several pages later — the landing page sends them to
 * /claim-now/, and the reg box there is what posts — so the campaign is held in
 * sessionStorage for the length of the visit and read back when the claim is
 * submitted. It reaches the intake endpoint in the claim payload and is
 * forwarded to the claims API, and the gclid rides the thank-you conversion.
 *
 * sessionStorage, not a cookie: this is attribution for one visit, it never
 * needs to reach the server on its own, and it dies with the tab.
 */
export const CAMPAIGN_KEY = 'mcd2_campaign';

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
/** Click ids worth keeping: Google, then Microsoft and Meta, so a later channel needs no code change. */
export const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid'] as const;

export type Campaign = Partial<Record<(typeof UTM_KEYS)[number] | (typeof CLICK_ID_KEYS)[number], string>> & {
  /** The page the visitor arrived on. */
  landing?: string;
  /** When the click was captured. */
  at?: string;
};

/** One value: trimmed, length-capped, and free of anything that is not a campaign value. */
function clean(v: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.trim().slice(0, 200);
  return /^[\w.\-|:/+% ]+$/.test(s) ? s : undefined;
}

/**
 * The campaign a URL carries, or null if it carries none. Pure, so the rules
 * are testable without a browser.
 */
export function campaignFromUrl(search: string, pathname?: string): Campaign | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: Campaign = {};
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const v = clean(params.get(k));
    if (v) out[k] = v;
  }
  if (Object.keys(out).length === 0) return null;
  if (pathname) out.landing = pathname;
  out.at = new Date().toISOString();
  return out;
}

/** What is stored for this visit, or null. Never throws: private mode and blocked storage read as null. */
export function readCampaign(): Campaign | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CAMPAIGN_KEY);
    return raw ? (JSON.parse(raw) as Campaign) : null;
  } catch {
    return null;
  }
}

/**
 * Records the campaign on the current URL, if it has one, and returns what is
 * stored for the visit. A fresh set of parameters replaces what was there: a
 * second ad click in the same tab is a new click and should be attributed as
 * one. A URL with no parameters leaves the stored campaign alone.
 */
export function rememberCampaign(): Campaign | null {
  if (typeof window === 'undefined') return null;
  const found = campaignFromUrl(window.location.search, window.location.pathname);
  if (!found) return readCampaign();
  try {
    window.sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(found));
  } catch {
    // Storage blocked: the claim still posts, just without attribution.
  }
  return found;
}
