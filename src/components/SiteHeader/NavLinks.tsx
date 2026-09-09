'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@site/copy';
import styles from './SiteHeader.module.css';

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href) return pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
  return (item.children ?? []).some((c) => isActive(pathname, c));
}

/**
 * Desktop section links. The active page carries a 2px yellow underline;
 * "Services" opens a dropdown of the service children on hover and focus.
 * Items without an href are pages that do not build yet: they render as text.
 */
export function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname() ?? '/';
  return (
    <nav className={className} aria-label="Sections">
      {items.map((item) => {
        const active = isActive(pathname, item);
        if (item.children) {
          return (
            <div key={item.label} className={styles.menu}>
              <button type="button" className={[styles.link, active ? styles.on : ''].join(' ')} aria-haspopup="true" aria-expanded="false" aria-controls={`menu-${item.label}`}>
                {item.label} <b aria-hidden="true">▾</b>
              </button>
              <ul id={`menu-${item.label}`} className={styles.dropdown}>
                {item.children.map((c) => (
                  <li key={c.label}>
                    {c.href ? (
                      <Link href={c.href} aria-current={isActive(pathname, c) ? 'page' : undefined}>
                        {c.label}
                      </Link>
                    ) : (
                      <span className={styles.soon}>{c.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return item.href ? (
          <Link key={item.label} href={item.href} className={[styles.link, active ? styles.on : ''].join(' ')} aria-current={active ? 'page' : undefined}>
            {item.label}
          </Link>
        ) : (
          <span key={item.label} className={`${styles.link} ${styles.soon}`}>
            {item.label}
          </span>
        );
      })}
    </nav>
  );
}
