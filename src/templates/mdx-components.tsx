import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { Callout } from '@/components/Callout/Callout';
import { StepCards } from '@/components/StepCards/StepCards';
import { ThemUsTable } from '@/components/ThemUsTable/ThemUsTable';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder/PhotoPlaceholder';
import { isLinkable } from '@/lib/content';

/** Placeholder figure inside prose: cream box, caption underneath. */
function Figure({ label, note, caption, ratio = '16/9' }: { label: string; note?: string; caption?: string; ratio?: '16/9' | '4/3' | '3/2' }) {
  return (
    <figure>
      <PhotoPlaceholder label={label} note={note} ratio={ratio} tone="cream" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Links to pages that do not build yet render as plain text, so nothing on the live site 404s. */
function A({ href, children, ...rest }: ComponentProps<'a'>) {
  if (!href) return <a {...rest}>{children}</a>;
  if (href.startsWith('/')) {
    if (!isLinkable(href)) {
      return (
        <span className="draft-link" data-draft-link={href} title="Coming soon">
          {children}
        </span>
      );
    }
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/** Components available inside MDX content. */
export const mdxComponents = {
  a: A,
  Callout,
  Steps: StepCards,
  ThemUs: ThemUsTable,
  Figure,
  Muted: ({ children }: { children: ReactNode }) => <p className="muted">{children}</p>,
};
