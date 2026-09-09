import type { SiteConfig } from '@/lib/site-config';

/** The footer's status sentence, from the client's legal line (9 September 2026); the site is not FCA regulated. */
export const FCA_STATUS_LINE = 'Claims247.co.uk provides marketing and lead-generation services only and does not provide legal advice or claims-management services.';

export const siteConfig = {
  id: 'mcd2',
  /** The trading name: every title, meta, schema name and the wordmark. */
  name: 'Claims 24/7',
  /** The registered company, for schema legalName. */
  legalName: 'J&R Marketing Limited',
  /** The footer's legal line, as supplied by the client. */
  legalLine: 'J&R MARKETING LIMITED trading as Claims247.co.uk',
  legal: {
    companyNumber: '10025657',
    registeredOffice: 'C/O Perception Accounting Limited, The Cobalt Building, 1600 Eureka Park, Lower Pemberton, Ashford, Kent, England, TN25 4BF',
    statusLine: FCA_STATUS_LINE,
  },
  description: 'Independent accident management for non-fault drivers. The other driver’s insurer pays. Nothing goes through your policy.',
  phone: {
    display: '0208 988 9508',
    // The href matches the live Claims247 site exactly: Google Ads number-swap
    // rewrites both the display string and the tel: href, and the pair is what
    // is registered against the call conversion action.
    href: 'tel:+442089889508',
    e164: '+442089889508',
  },
  locale: 'en_GB',
  source: 'mcd2',
  theme: { background: '#F7F5EF', color: '#F3CD3E' },
} as const satisfies SiteConfig;
