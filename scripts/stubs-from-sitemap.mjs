#!/usr/bin/env node
/**
 * Stub every page in design/motorclaimsdepartment_sitemap.html that has no
 * content file yet as a draft MDX file (appendix §5), so the route is known,
 * links resolve once the page is written, and nothing builds until
 * `draft: true` is removed. Idempotent: existing files are left alone.
 *
 *   pnpm stubs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteDir } from '../src/lib/site-dir.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'design', 'motorclaimsdepartment_sitemap.html'), 'utf8');

const existing = new Set();
(function walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      if (!f.startsWith('_')) walk(full);
    } else if (f.endsWith('.mdx')) {
      const m = readFileSync(full, 'utf8').match(/^slug:\s*(.+)$/m);
      if (m) existing.add(m[1].trim().replace(/^["']|["']$/g, ''));
    }
  }
})(join(siteDir, 'content'));

const sectionOf = (header) => header.toLowerCase().replace(/&amp;/g, 'and').replace(/—/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const templateFor = (slug, section) => {
  if (section.startsWith('our-locations')) return 'location';
  if (section.startsWith('resource') || slug.includes('/how-to-prove-fault/') || slug.includes('/advice/') || slug.includes('/insights/')) return 'article';
  if (section.startsWith('car-accident-claims-process')) return 'guide';
  return 'pillar';
};

// Each pillar block: header, optional root slug, then page-label/slug pairs.
const blocks = html.split(/<div class="pillar(?: wide)?">/).slice(1);
let created = 0;
for (const block of blocks) {
  const header = (block.match(/<div class="pillar-header [^"]*">([^<]+)<\/div>/) || [])[1];
  if (!header) continue;
  const section = sectionOf(header.replace(/&mdash;/g, '—').trim());
  const pages = [];
  const rootLabel = (block.match(/<div class="pillar-root">\s*<span class="page-label">([^<]+)<\/span>/) || [])[1];
  if (rootLabel && rootLabel.trim().startsWith('/') && rootLabel.trim() !== '/') pages.push({ slug: rootLabel.trim(), label: header.replace(/&mdash;/g, '—').trim() });
  for (const it of block.matchAll(/<span class="page-label">([^<]+)<\/span>[\s\S]*?<span class="slug">([^<]+)<\/span>/g)) {
    const slug = it[2].trim();
    if (slug.includes('[')) continue;
    pages.push({ slug, label: it[1].replace(/&amp;/g, '&').trim() });
  }
  for (const { slug, label } of pages) {
    if (existing.has(slug)) continue;
    // Appendix §5: /how-it-works/ does not exist; it is /how-accident-management-works/.
    if (slug === '/how-it-works/') continue;
    // Nested slugs keep their path so two pages with the same last segment cannot collide.
    const file = join(siteDir, 'content', section, ...slug.split('/').filter(Boolean)) + '.mdx';
    if (existsSync(file)) continue;
    mkdirSync(dirname(file), { recursive: true });
    const safe = label.replace(/"/g, '\\"');
    writeFileSync(
      file,
      `---
slug: ${slug}
template: ${templateFor(slug, section)}
title: "${safe} | Claims 24/7"
description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. One focused sentence of at most 155 characters."
h1: "${safe}"
lead: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
lastReviewed: 2026-09-06
author: "[Named handler, role]"
phase: 2
draft: true
---

Lorem ipsum dolor sit amet. This page is in the sitemap for a later phase; remove \`draft: true\` in the frontmatter when it is written.
`,
    );
    existing.add(slug);
    created++;
  }
}
console.log(`stubs: ${created} draft page${created === 1 ? '' : 's'} created (${existing.size} content pages known)`);
