import Link from 'next/link';
import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { site } from '@/lib/site';
import { Logo } from './logo';
import { MobileMenu } from './components/MobileMenu';
import { cta, nav } from './copy';
import styles from './components/header.module.css';

/**
 * The header (ocr-homepage-concept.html .nav): a sticky white bar, 80px
 * desktop with the wordmark left, the three section links, the call link and
 * the navy "Report your accident" pill right. Mobile 64px: wordmark left,
 * navy "Call now" pill and burger right (the layout rulebook's nav).
 */
export function SiteHeader() {
  return (
    <header className={styles.nav} data-site-header>
      <div className={`wrap ${styles.row}`}>
        <Logo />
        <nav className={styles.links} aria-label="Sections">
          {nav.links.map((l) => (
            <Link key={l.label} href={l.href ?? '/'} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>
        <a href={site.phone.href} className={styles.call} data-cta="call">
          <Icon name="phone" className={styles.callIcon} />
          {site.phone.display}
        </a>
        <Button href={nav.claimHref} variant="ink" size="sm" className={styles.start} data-cta="start">
          {cta.startShort}
        </Button>
        <MobileMenu items={[...nav.links, ...nav.drawerExtra]} />
      </div>
    </header>
  );
}
