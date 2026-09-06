import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllPages, getLivePages, getPage, isLinkable, normaliseSlug } from '../../src/lib/content/index.ts';

test('the six utility pages load with valid frontmatter', () => {
  const slugs = getLivePages().map((p) => p.frontmatter.slug).sort();
  for (const s of ['/about-us/', '/contact-us/', '/privacy-policy/', '/terms/', '/complaints/', '/cookies/']) assert.ok(slugs.includes(s), s);
  for (const p of getAllPages()) {
    assert.equal(p.frontmatter.slug, p.frontmatter.slug.toLowerCase());
    assert.ok(p.frontmatter.title.length > 0);
    assert.ok(p.frontmatter.description.length <= 160, `${p.file} description length`);
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
