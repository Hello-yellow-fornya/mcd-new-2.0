import type { SiteId } from './site-id.ts';

/** What every sites/<id>/site.ts exports. */
export type SiteConfig = {
  id: SiteId;
  /** The trading name: every title, meta, schema name and the wordmark. */
  name: string;
  /** The registered company, for schema legalName. */
  legalName: string;
  /** The footer's legal line: the entity and trading name. */
  legalLine: string;
  /** The rest of the footer's legal line, when the client has supplied it. */
  legal?: { companyNumber: string; registeredOffice: string; statusLine: string };
  description: string;
  phone: { display: string; href: string; e164: string };
  locale: string;
  /** The `source` this site posts to the shared claims API. */
  source: string;
  /** Web app manifest colours. */
  theme: { background: string; color: string };
};
