import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { normaliseHtml, stylesheetHrefs, sha256 } from './normalize.mjs';

/** Every route the site serves, plus the generated non-HTML routes. */
export async function siteRoutes() {
  const { getLivePages } = await import('../../src/lib/content/index.ts');
  const pages = getLivePages().map((p) => p.frontmatter.slug);
  const { siteId } = await import('../../src/lib/site-id.ts').catch(() => ({ siteId: 'mcd2' }));
  const fixed = siteId === 'mcd2' ? ['/', '/claim-now/', '/claim-now/thank-you/', '/claim/goskippy/', '/styleguide/', '/does-not-exist/'] : ['/'];
  return { siteId, html: [...fixed, ...pages], other: ['/robots.txt', '/manifest.webmanifest', '/opengraph-image', '/icon.svg', '/apple-icon.png', '/favicon.ico'] };
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

/**
 * A page's stylesheets as their rules, one per line, sorted: the bundler
 * decides how many files the CSS is split into and in what order the files
 * load, so the comparison is of every rule's bytes rather than of the
 * concatenation. (Rule order only matters between rules that share a
 * selector, and those always sit in the same file.)
 */
export function cssRules(css) {
  return css
    .split('}')
    .map((r) => r.trim())
    .filter(Boolean)
    .sort()
    .join('}\n');
}

export function snapshotFile(site) {
  return join(process.cwd(), 'tests/snapshots', `${site}-routes.json`);
}

/** Hashes of the normalised HTML and the stylesheets of every route, plus the generated public assets. */
export async function snapshotRoutes(base, { keepHtml } = {}) {
  const { siteId, html: htmlRoutes, other } = await siteRoutes();
  const routes = {};
  const pages = {};
  const cssCache = new Map();
  for (const route of htmlRoutes) {
    const res = await fetch(`${base}${route}`);
    const raw = await res.text();
    const html = normaliseHtml(raw);
    let css = '';
    for (const href of stylesheetHrefs(raw)) {
      const url = href.startsWith('http') ? href : `${base}${href}`;
      if (!cssCache.has(url)) cssCache.set(url, await (await fetch(url)).text());
      css += cssCache.get(url);
    }
    routes[route] = { status: res.status, html: sha256(html), css: sha256(cssRules(css)) };
    if (keepHtml) pages[route] = html;
  }
  const assets = {};
  for (const route of other) {
    const res = await fetch(`${base}${route}`);
    assets[route] = `${res.status}:${sha256(Buffer.from(await res.arrayBuffer()))}`;
  }
  const pub = join(process.cwd(), 'public');
  for (const file of walk(pub).sort()) assets[`public/${relative(pub, file)}`] = sha256(readFileSync(file));
  return { site: siteId, snapshot: { site: siteId, routes, assets }, pages, css: cssCache };
}
