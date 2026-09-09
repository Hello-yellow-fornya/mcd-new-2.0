import { createHash } from 'node:crypto';

/**
 * Makes a served HTML page comparable across builds. What stays is the
 * rendered document: every element, attribute and text node, the JSON-LD and
 * the font preloads (font files are content-hashed, so a changed font shows
 * up as a changed name, which is the point). What goes is the bundler's
 * bookkeeping: the build id, the hashed chunk and stylesheet names, how many
 * files the stylesheets are split into (their contents are compared
 * separately, as rules), the Open Graph image's cache-busting query (the
 * image is compared as an asset) and the React Flight payload in the inline scripts,
 * which duplicates the markup for hydration with bundle-specific row ids.
 */
export function normaliseHtml(html) {
  return html
    .replace(/<!--[A-Za-z0-9_-]{16,}-->/g, '<!--BUILD-->')
    // the Open Graph image's cache-busting query is a hash of its route module; the image itself is hashed as an asset
    .replace(/(opengraph-image|twitter-image)\?[a-f0-9]+/g, '$1?HASH')
    .replace(/<link rel="stylesheet" href="\/_next\/static\/css\/[^"]+"[^>]*>/g, '')
    .replace(/<script>self\.__next_f\.push\(.*?\)<\/script>/gs, '')
    // /_next/static/<buildId>/_buildManifest.js and friends
    .replace(/\/_next\/static\/[A-Za-z0-9_-]{16,}\//g, '/_next/static/BUILD/')
    // static/chunks/…-<hash>.js and static/css/<hash>.css (with or without the /_next prefix, in flight data too)
    .replace(/static\/chunks\/[^"'\s\\)]+/g, 'static/chunks/CHUNK')
    .replace(/static\/css\/[^"'\s\\)]+/g, 'static/css/CSS')
    // client reference rows in the flight data: the module id and chunk list are bundling, not markup
    .replace(/:I\[\d+,\[[^\]]*\]/g, ':I[MOD,[CHUNKS]')
    // the build id inside the flight data ("b":"<id>")
    .replace(/\\"b\\":\\"[A-Za-z0-9_-]+\\"/g, '\\"b\\":\\"BUILD\\"')
    .replace(/"b":"[A-Za-z0-9_-]+"/g, '"b":"BUILD"');
}

/** The stylesheet hrefs a page loads, in document order. */
export function stylesheetHrefs(html) {
  return Array.from(html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g), (m) => m[1]);
}

export function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}
