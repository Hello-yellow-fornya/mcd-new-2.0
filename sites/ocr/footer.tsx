import Link from 'next/link';
import { CookieSettingsButton } from '@/components/Consent/ConsentBanner';
import { isLinkable } from '@/lib/content';
import { site } from '@/lib/site';
import { Logo } from './logo';
import { footer } from './copy';
import styles from './components/footer.module.css';

/**
 * The footer (ocr-homepage-concept.html .foot): navy, the wordmark with
 * "Online" in green, the strapline and the number in green, three link
 * columns, then the legal line. The entity line is the site config's
 * (a blocking placeholder until confirmed); the company number and
 * registered office are placeholders too. No regulatory status line: the
 * company is not FCA authorised (confirmed for Claims 24/7, the same company).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.foot} data-site-footer>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo surface="navy" />
            <p className={styles.strap}>{footer.strapline}</p>
            <p>
              <a className={styles.tel} href={site.phone.href} data-cta="call">
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
          <span className={styles.todo}>{site.legalLine}</span>. Registered in England and Wales, company number <span className={styles.todo}>[00000000]</span>. Registered office:{' '}
          <span className={styles.todo}>[address]</span>. © {year}.
        </p>
      </div>
    </footer>
  );
}
