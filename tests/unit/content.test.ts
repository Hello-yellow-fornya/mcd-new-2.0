import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllPages, getLivePages, getPage, isLinkable, normaliseSlug } from '../../src/lib/content/index.ts';
import { siteId } from '../../src/lib/site-id.ts';

test('the utility pages load with valid frontmatter', () => {
  const slugs = getLivePages().map((p) => p.frontmatter.slug).sort();
  // Claims 24/7 has no complaints page: it handles complaints through the partner it introduces you to.
  const utility = ['/about-us/', '/contact-us/', '/privacy-policy/', '/terms/', '/cookies/', ...(siteId === 'ocr' ? ['/complaints/'] : [])];
  for (const s of utility) assert.ok(slugs.includes(s), s);
  if (siteId !== 'ocr') assert.ok(!slugs.includes('/complaints/'));
  for (const p of getAllPages()) {
    assert.equal(p.frontmatter.slug, p.frontmatter.slug.toLowerCase());
    assert.ok(p.frontmatter.title.length > 0);
    assert.ok(p.frontmatter.description.length > 0, `${p.file} description`);
  }
});

test('slugs normalise with leading and trailing slashes', () => {
  assert.equal(normaliseSlug('about-us'), '/about-us/');
  assert.equal(normaliseSlug('/terms'), '/terms/');
});

test('links to live pages are linkable; unknown routes are left alone', () => {
  assert.equal(isLinkable('/cookies/'), true);
  assert.equal(isLinkable('/'), true);
  assert.equal(isLinkable('/claim-now/'), true);
  assert.equal(isLinkable('https://example.com'), true);
  assert.ok(getPage('/about-us/'));
});

test('headings get GitHub-style ids, deduplicated', async () => {
  const { extractHeadings } = await import('../../src/lib/content/index.ts');
  const body = `## What is it?\n\nText\n\n## Step 1. Tell us what happened\n\n### What we ask\n\n## What is it?`;
  assert.deepEqual(extractHeadings(body), [
    { id: 'what-is-it', text: 'What is it?', depth: 2 },
    { id: 'step-1-tell-us-what-happened', text: 'Step 1. Tell us what happened', depth: 2 },
    { id: 'what-we-ask', text: 'What we ask', depth: 3 },
    { id: 'what-is-it-1', text: 'What is it?', depth: 2 },
  ]);
});

test('every launch page names a highlight that is one or two words of its H1', () => {
  for (const p of getLivePages().filter((p) => p.frontmatter.template !== 'utility')) {
    const { h1, title, highlight } = p.frontmatter;
    assert.ok(highlight, `${p.file}: highlight`);
    assert.ok((h1 ?? title).includes(highlight!), `${p.file}: highlight in H1`);
    assert.ok(highlight!.trim().split(/\s+/).length <= 2, `${p.file}: at most two words`);
  }
});
