import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd/JsonLd';
import { absoluteUrl } from '@/lib/site';
import styles from './Breadcrumb.module.css';

export type Crumb = { href: string; label: string };

type Props = {
  /** Every crumb including the current page, last. Home is added automatically. A crumb with an empty href renders as text. */
  items: Crumb[];
  home?: boolean;
  /** Emit BreadcrumbList JSON-LD here. Content pages carry it in their page graph instead. */
  schema?: boolean;
};

export function Breadcrumb({ items, home = true, schema = true }: Props) {
  const all: Crumb[] = home ? [{ href: '/', label: 'Home' }, ...items] : items;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absoluteUrl(c.href || '/') })),
  };
  return (
    <nav className={`wrap ${styles.crumbs}`} aria-label="Breadcrumb">
      <ol>
        {all.map((c, i) =>
          i === all.length - 1 ? (
            <li key={c.href || c.label}>
              <span aria-current="page">{c.label}</span>
            </li>
          ) : c.href ? (
            <li key={c.href}>
              <Link href={c.href}>{c.label}</Link>
            </li>
          ) : (
            <li key={c.label}>
              <span>{c.label}</span>
            </li>
          ),
        )}
      </ol>
      {schema && <JsonLd data={ld} />}
    </nav>
  );
}
