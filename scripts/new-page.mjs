#!/usr/bin/env node
/**
 * Scaffold a content page from a template's lorem-ipsum version (appendix §10).
 *
 *   pnpm new-page --template pillar --slug /accident-recovery/ [--title "Accident recovery"] [--section pillars]
 *
 * Writes content/<section>/<slug>.mdx as a draft. Remove `draft: true` to build it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]] : [])).filter((p) => p.length));
const sections = { pillar: 'pillars', process: 'process', comparison: 'comparison', guide: 'guides', location: 'locations', article: 'articles', utility: 'utility' };

const template = args.template;
if (!template || !sections[template]) {
  console.error(`--template must be one of ${Object.keys(sections).join(', ')}`);
  process.exit(1);
}
let slug = (args.slug || '').trim();
if (!slug) {
  console.error('--slug is required, e.g. --slug /accident-recovery/');
  process.exit(1);
}
if (!slug.startsWith('/')) slug = `/${slug}`;
if (!slug.endsWith('/')) slug = `${slug}/`;
slug = slug.toLowerCase();
const name = slug.split('/').filter(Boolean).pop();
const title = args.title || name.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const section = args.section || sections[template];
const out = join(root, 'content', section, `${name}.mdx`);
if (existsSync(out)) {
  console.error(`${out} already exists`);
  process.exit(1);
}
const src = readFileSync(join(root, 'content', '_templates', `${template}.mdx`), 'utf8')
  .replaceAll('{{slug}}', slug)
  .replaceAll('{{title}}', title)
  .replaceAll('{{date}}', new Date().toISOString().slice(0, 10));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, src);
console.log(`Created ${out.replace(root + '/', '')} (draft). Edit the frontmatter, write the page, remove draft: true, open a PR.`);
