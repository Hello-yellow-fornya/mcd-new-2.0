import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import type { Heading as MdHeading, Root } from 'mdast';
import { headingIdFor } from './remark-heading-ids.ts';
import { templateNames, type Frontmatter, type Heading, type Page } from './types.ts';

export type { Page, Frontmatter, Heading } from './types.ts';

const CONTENT_DIR = join(process.cwd(), 'content');

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (extname(full) === '.mdx') acc.push(full);
  }
  return acc;
}

export function normaliseSlug(slug: string): string {
  let s = slug.trim();
  if (!s.startsWith('/')) s = `/${s}`;
  if (!s.endsWith('/')) s = `${s}/`;
  return s;
}

function validate(file: string, fm: Record<string, unknown>): Frontmatter {
  const need = (k: string) => {
    if (fm[k] === undefined || fm[k] === '') throw new Error(`${file}: frontmatter "${k}" is required`);
  };
  ['slug', 'template', 'title', 'description', 'lastReviewed', 'author'].forEach(need);
  if (!templateNames.includes(fm.template as never)) throw new Error(`${file}: unknown template "${fm.template}"`);
  const slug = normaliseSlug(String(fm.slug));
  if (slug !== slug.toLowerCase()) throw new Error(`${file}: slug must be lowercase (${slug})`);
  if (!slug.startsWith('/claim/') && /\bno-fault\b/.test(slug)) throw new Error(`${file}: use "non-fault" outside /claim/ (${slug})`);
  if (slug === '/how-it-works/') throw new Error(`${file}: /how-it-works/ does not exist; it is /how-accident-management-works/`);
  if (String(fm.title).length > 60) console.warn(`${file}: title is over 60 characters`);
  if (String(fm.description).length > 155) console.warn(`${file}: description is over 155 characters`);
  return { ...(fm as Frontmatter), slug };
}

/** H2 (and H3) headings with the ids the remark plugin will assign. */
export function extractHeadings(body: string): Heading[] {
  const tree = remark().use(remarkMdx).parse(body) as Root;
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  visit(tree, 'heading', (node: MdHeading) => {
    const { id, text } = headingIdFor(node, slugger);
    out.push({ id, text, depth: node.depth });
  });
  return out;
}

let cache: Page[] | null = null;

/** Every content page, drafts included. Cached for the build. */
export function getAllPages(): Page[] {
  if (cache) return cache;
  const pages = walk(CONTENT_DIR).map((file): Page => {
    const raw = readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const frontmatter = validate(relative(process.cwd(), file), data);
    return {
      file: relative(process.cwd(), file),
      section: relative(CONTENT_DIR, file).split('/')[0],
      frontmatter,
      body: content,
      headings: extractHeadings(content),
    };
  });
  const seen = new Map<string, string>();
  for (const p of pages) {
    const dup = seen.get(p.frontmatter.slug);
    if (dup) throw new Error(`Duplicate slug ${p.frontmatter.slug} in ${dup} and ${p.file}`);
    seen.set(p.frontmatter.slug, p.file);
  }
  cache = pages;
  return pages;
}

/** Pages that build: not drafts. */
export function getLivePages(): Page[] {
  return getAllPages().filter((p) => !p.frontmatter.draft);
}

export function getPage(slug: string): Page | undefined {
  return getAllPages().find((p) => p.frontmatter.slug === normaliseSlug(slug));
}

export function isLive(slug: string): boolean {
  const p = getPage(slug);
  return !!p && !p.frontmatter.draft;
}

/** Whether an internal href can be linked to: live content, the homepage, or a non-content route. */
export function isLinkable(href: string): boolean {
  if (!href.startsWith('/')) return true;
  const path = href.split(/[?#]/)[0];
  if (path === '/' ) return true;
  const page = getPage(path);
  if (page) return !page.frontmatter.draft;
  return true;
}
