import Link from 'next/link';
import { Logo } from '@/components/Logo/Logo';
import { CookieSettingsButton } from '@/components/Consent/ConsentBanner';
import { footer } from '@/data/copy';
import { site } from '@/lib/site';
import { isProduction } from '@/lib/staging';
import { isLinkable } from '@/lib/content';
import styles from './SiteFooter.module.css';

/**
 * The footer: an ink surface carrying the on-ink lockup (CLAUDE.md §4a),
 * strapline and phone; four link columns; the legal line. The FCA line comes from FCA_STATUS_LINE (appendix
 * §11): a visible [TODO] on preview, and the production build stops until it
 * is set. Column headings are sentence case (§0), not the mockup's caps, and h3s so heading order holds after a page's h2s.
 */
export function SiteFooter() {
  const fca = process.env.FCA_STATUS_LINE?.trim();
  if (!fca && isProduction()) {
    throw new Error('FCA_STATUS_LINE is not set. The footer legal line must carry the FCA status exactly as on the Register before a production build (CLAUDE.md appendix §11).');
  }
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
        <p className={styles.legal}>
          {site.legalLine}. {fca ?? <span className={styles.todo}>[TODO: regulatory status and FCA firm reference number exactly as on the FCA Register]</span>} Registered in England and
          Wales, company number <span className={styles.todo}>[00000000]</span>. Registered office: <span className={styles.todo}>[address]</span>. © {year}.
        </p>
      </div>
    </footer>
  );
}
