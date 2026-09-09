/**
 * The Online Claims Report icon: "OCR" in Inter Black, white on a navy tile
 * (rounded 22%), the letters outlined from the self-hosted font so nothing
 * depends on an installed face. tileSvg(size) returns the SVG text.
 */
import opentype from 'opentype.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const font = opentype.loadSync(join(here, '..', 'fonts', 'inter-latin-900-normal.woff'));

export const NAVY = '#0E2A47';
export const WHITE = '#FFFFFF';
const TRACKING = -0.045; /* em, the wordmark's tracking */
const SPAN = 0.78; /* the word spans 78% of the tile */

export function tileSvg(size = 512) {
  const text = 'OCR';
  const probe = font.getPath(text, 0, 0, 100, { kerning: true, letterSpacing: TRACKING }).getBoundingBox();
  const fontSize = ((size * SPAN) / (probe.x2 - probe.x1)) * 100;
  const path = font.getPath(text, 0, 0, fontSize, { kerning: true, letterSpacing: TRACKING });
  const b = path.getBoundingBox();
  const dx = (size - (b.x2 - b.x1)) / 2 - b.x1;
  const dy = (size - (b.y2 - b.y1)) / 2 - b.y1;
  const r = Math.round(size * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="${NAVY}"/><path transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})" d="${path.toPathData(2)}" fill="${WHITE}"/></svg>\n`;
}
