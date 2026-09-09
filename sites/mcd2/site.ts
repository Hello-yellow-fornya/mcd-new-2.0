import type { SiteConfig } from '@/lib/site-config';

export const siteConfig = {
  id: 'mcd2',
  /** The trading name: every title, meta, schema name and the wordmark. */
  name: 'Claims 24/7',
  /** The registered company, for schema legalName. */
  legalName: 'Motor Claims Department Ltd',
  /** The footer's legal line (pending the client's confirmation). */
  legalLine: 'Motor Claims Department Ltd, trading as Claims 24/7',
  description: 'Independent accident management for non-fault drivers. The other driver’s insurer pays. Nothing goes through your policy.',
  phone: {
    display: '0800 048 0048',
    href: 'tel:08000480048',
    e164: '+448000480048',
  },
  locale: 'en_GB',
  source: 'mcd2',
  theme: { background: '#F7F5EF', color: '#F3CD3E' },
} as const satisfies SiteConfig;
