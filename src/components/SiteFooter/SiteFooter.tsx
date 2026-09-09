import Link from 'next/link';
import { Logo } from '@/components/Logo/Logo';
import { CookieSettingsButton } from '@/components/Consent/ConsentBanner';
import { footer } from '@site/copy';
import { site } from '@/lib/site';
import { isLinkable } from '@/lib/content';
import styles from './SiteFooter.module.css';

/**
 * The footer: an ink surface carrying the on-ink lockup (CLAUDE.md §4a),
 * strapline and phone; four link columns; the legal line as the client
 * supplied it (sites/mcd2/site.ts: entity, company number, registered office
 * and the status sentence; the site is not FCA authorised). Column headings
 * are sentence case (§0), not the mockup's caps, and h3s so heading order holds after a page's h2s.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.foot} data-site-footer>
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <Logo surface="ink" />
            <p className={styles.strap}>{footer.strapline}</p>
            <p className={styles.phone}>
              <a href={site.phone.href} data-cta="call">
                {site.phone.display}
              </a>
            </p>
            <p className={styles.reassure}>{footer.reassurance}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.h}>
              <h3 className={styles.h3}>{col.h}</h3>
              <ul className={styles.list}>
                {col.items.map((it) => (
                  <li key={it.label}>{it.href && isLinkable(it.href) ? <Link href={it.href}>{it.label}</Link> : <span className={styles.soon}>{it.label}</span>}</li>
                ))}
                {col.h === 'Legal' ? (
                  <li>
                    <CookieSettingsButton className={styles.linkButton} />
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.legal} data-legal>
          {site.legal
            ? `${site.legalLine}. Company number: ${site.legal.companyNumber}. Registered office address: ${site.legal.registeredOffice}. ${site.legal.statusLine}`
            : `${site.legalLine}.`}{' '}
          © {year}.
        </p>
      </div>
    </footer>
  );
}
