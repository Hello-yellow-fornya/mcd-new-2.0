import type { SiteConfig } from '@/lib/site-config';

/** Online Claims Report: the same company and claims API as Claims 24/7, a third door where the accident is reported online, whoever was at fault. */
export const siteConfig = {
  id: 'ocr',
  name: 'Online Claims Report',
  legalName: 'Motor Claims Department Ltd',
  /** [TODO] blocking placeholder until the client confirms the entity line. */
  legalLine: 'Motor Claims Department Ltd, trading as Online Claims Report',
  description: 'Had an accident? Report it once, whoever was at fault. We take the details, work out where you stand and deal with the insurers from there.',
  phone: {
    display: '0800 048 0048',
    href: 'tel:08000480048',
    e164: '+448000480048',
  },
  locale: 'en_GB',
  source: 'ocr',
  theme: { background: '#F4F6F5', color: '#0E2A47' },
} as const satisfies SiteConfig;
