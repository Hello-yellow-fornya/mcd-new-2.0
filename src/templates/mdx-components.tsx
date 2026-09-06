import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { Callout } from '@/components/Callout/Callout';
import { isLinkable } from '@/lib/content';

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
  Muted: ({ children }: { children: ReactNode }) => <p className="muted">{children}</p>,
};
