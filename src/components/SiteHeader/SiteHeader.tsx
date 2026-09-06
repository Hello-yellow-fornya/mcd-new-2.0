import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/Button/Button';
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { ProofChip } from './ProofChip';
import { cta, nav, type NavItem } from '@/data/copy';
import { isLinkable } from '@/lib/content';
import { site } from '@/lib/site';
import styles from './SiteHeader.module.css';

/**
 * The §0 header (design/mcd-2-0-homepage-concept.html): sticky cream bar,
 * 84px desktop with the logo hard left at 34px, the section links with a
 * yellow underline on the active page, the white proof chip, a yellow
 * phone-number pill and an ink "Start your claim" pill hard right. Mobile
 * 64px: logo left at 30px, ink "Call now" pill and burger hard right, nothing
 * else; the proof line lives in the drawer.
 */
/** Items whose page does not build yet lose their href and render as text (nothing 404s). */
function linkable(items: readonly NavItem[]): NavItem[] {
  return items.map((i) => ({
    ...i,
    href: i.href && isLinkable(i.href) ? i.href : undefined,
    children: i.children ? linkable(i.children) : undefined,
  }));
}

export function SiteHeader() {
  const links = linkable(nav.links);
  return (
    <header className={styles.nav} data-site-header>
      <div className={`wrap ${styles.row}`}>
        <Logo />
        <NavLinks items={links} className={styles.links} />
        <ProofChip className={styles.chip} />
        <Button href={site.phone.href} variant="yellow" size="sm" icon="phone" className={styles.call} data-cta="call">
          {site.phone.display}
        </Button>
        <Button href={nav.claimHref} variant="ink" size="sm" className={styles.start} data-cta="start">
          {cta.startShort}
        </Button>
        <MobileMenu items={[...links.flatMap((i) => (i.children ? [i, ...i.children] : [i])).filter((i) => !i.children), ...linkable(nav.drawerExtra)]} />
      </div>
    </header>
  );
}
