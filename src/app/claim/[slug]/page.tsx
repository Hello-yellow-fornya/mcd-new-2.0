import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingPage } from '@site/landing';
import { getLanding, getLandingConfigs } from '@/lib/landing';

type Params = { params: Promise<{ slug: string }> };


/** One route per JSON file in sites/<id>/landing/. */
export function generateStaticParams() {
  return getLandingConfigs().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = getLanding(slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.description,
    // Paid landing pages (appendix §6): noindex, nofollow, canonical to self, off the sitemap.
    robots: { index: false, follow: false },
    alternates: { canonical: `/claim/${c.slug}/` },
    openGraph: { title: c.title, description: c.description, url: `/claim/${c.slug}/` },
  };
}

export default async function InsurerLandingPage({ params }: Params) {
  const { slug } = await params;
  const c = getLanding(slug);
  if (!c) notFound();
  return <LandingPage config={c} />;
}
