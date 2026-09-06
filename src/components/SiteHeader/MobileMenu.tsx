'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/Button/Button';
import { ProofChip } from './ProofChip';
import { cta, nav, type NavItem } from '@/data/copy';
import { site } from '@/lib/site';
import styles from './SiteHeader.module.css';

function flatten(items: readonly NavItem[]): NavItem[] {
  return items.flatMap((i) => (i.children ? [i, ...i.children] : [i]));
}

/**
 * Mobile: ink "Call now" pill and burger hard right (§0). The burger opens a
 * full-width drawer on cream (design/mcd-2-0-nav-options.png): the proof
 * line, the links with hairline dividers, a full-width ink start button and
 * an outlined call button.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const items: NavItem[] = [...flatten(nav.links).filter((i) => !i.children), ...nav.drawerExtra];

  return (
    <div className={styles.mobile}>
      <Button href={site.phone.href} variant="ink" size="sm" icon="phone" className={styles.callNow} data-cta="call">
        {cta.callNow}
      </Button>
      <button
        type="button"
        className={styles.burger}
        aria-label={open ? 'Close menu' : 'Menu'}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={open ? styles.barOpen : styles.bar} />
        <span className={open ? styles.barOpen : styles.bar} />
        <span className={open ? styles.barOpen : styles.bar} />
      </button>
      <div id={id} className={styles.drawer} hidden={!open} data-drawer>
        <ProofChip drawer />
        <ul className={styles.drawerList}>
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? <Link href={item.href}>{item.label}</Link> : <span className={styles.soon}>{item.label}</span>}
            </li>
          ))}
        </ul>
        <div className={styles.drawerCtas}>
          <Button href={nav.claimHref} variant="ink" block data-cta="start">
            {cta.start}
          </Button>
          <Button href={site.phone.href} variant="outline-ink" icon="phone" block data-cta="call">
            {cta.call}
          </Button>
        </div>
      </div>
    </div>
  );
}
