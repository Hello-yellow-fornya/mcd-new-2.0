import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLivePages, getPage } from '@/lib/content';
import { ContentPage } from '@/templates/ContentPage';
import { PillarLanding } from '@/templates/PillarLanding';
import { PpcLanding } from '@/templates/PpcLanding';
import { UtilityPage } from '@/templates/UtilityPage';

/** Every non-draft content page becomes a static route (appendix §5). */
export function generateStaticParams() {
  return getLivePages().map((p) => ({ slug: p.frontmatter.slug.split('/').filter(Boolean) }));
}

function slugOf(parts: string[]) {
  return `/${parts.join('/')}/`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slugOf(slug));
  if (!page || page.frontmatter.draft) return {};
  const fm = page.frontmatter;
  return {
    title: { absolute: fm.title },
    description: fm.description,
    alternates: { canonical: fm.slug },
    openGraph: { title: fm.title, description: fm.description, url: fm.slug, type: 'article' },
    // Paid landing pages state it on the page as well as in the blanket header:
    // a stray link must never put one in an index.
    ...(fm.template === 'ppc-landing' ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function Route({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slugOf(slug));
  if (!page || page.frontmatter.draft) notFound();
  if (page.frontmatter.template === 'utility') return <UtilityPage page={page} />;
  if (page.frontmatter.template === 'ppc-landing') return <PpcLanding page={page} />;
  if (page.frontmatter.template === 'pillar-landing') return <PillarLanding page={page} />;
  return <ContentPage page={page} />;
}
