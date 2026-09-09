#!/usr/bin/env node
/**
 * CSS rules that CLAUDE.md §0 says must hold in code:
 *
 *   no-uppercase    sentence case everywhere: no text-transform: uppercase / capitalize
 *   no-italic       never italics
 *   ink-on-bright   ink text on yellow, pale and green — never white or cream
 *   no-1-0-palette  no coral, no marine, no sky, no stone: the 1.0 tokens do not exist here
 *   no-underlay     the highlight is a bar under the words, never a box behind them
 *                   (the band's chip is the one exception, marked /* allow: chip *\/)
 *
 * A deliberate exception is marked on the same line, e.g.
 *   text-transform: uppercase; /* allow: uppercase *\/
 *
 * Usage: node scripts/lint-css.mjs [dir-or-file...]   (default: src and sites)
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const BRIGHT_BG = /background(?:-color)?\s*:\s*[^;]*?(?:var\(--(?:yellow|pale|green)\)|#f3cd3e|#fbf0bf|#7dc24a)/i;
const LIGHT_TEXT = /(?:^|[;\s{])color\s*:\s*(?:#fff\b|#ffffff\b|white\b|var\(--white\)|var\(--cream\)|var\(--on-ink\)|var\(--on-ink-button\))/i;
const OLD_PALETTE = /var\(--(?:coral|blue|sky|stone|paper|marine|ink-900)\)|#(?:f2694b|16324f|3d6d9c|bfd6e6|ede9e1|f7f5f0|0f2438)\b/i;
const UNDERLAY = /box-shadow\s*:\s*inset[^;]*var\(--yellow\)/i;

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

export function lintCss(text, file) {
  const findings = [];
  const add = (line, rule, message) => findings.push({ file, line, rule, message });

  text.split('\n').forEach((line, i) => {
    const n = i + 1;
    const code = line.replace(/\/\*(?!\s*allow:)[\s\S]*?\*\//g, '');
    if (/text-transform\s*:\s*(uppercase|capitalize)/i.test(code) && !/allow:\s*uppercase/.test(line)) {
      add(n, 'no-uppercase', 'Sentence case everywhere: no CSS uppercase (§0).');
    }
    if (/font-style\s*:\s*(italic|oblique)/i.test(code) && !/allow:\s*italic/.test(line)) {
      add(n, 'no-italic', 'Never italics (§0).');
    }
    // sites/ocr names its page colour --paper (design/ocr); everywhere else --paper is the 1.0 token.
    if (OLD_PALETTE.test(code) && !(/(^|\/)sites\/ocr\//.test(file) && /var\(--paper\)/.test(code) && !OLD_PALETTE.test(code.replace(/var\(--paper\)/g, '')))) {
      add(n, 'no-1-0-palette', 'No coral, no marine, no sky, no stone: 2.0 uses ink, yellow, cream, pale, ochre, muted, line, green (§0).');
    }
    if (UNDERLAY.test(code) && !/allow:\s*chip/.test(line)) {
      add(n, 'no-underlay', 'The highlight is a yellow bar under the words (text-decoration), never a box behind them (§0).');
    }
  });

  // Declaration blocks: a bright background must not carry light text.
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const block = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = block.exec(stripped))) {
    const [, selector, decls] = m;
    const raw = text.slice(m.index, m.index + m[0].length); // comments are preserved in position
    if (BRIGHT_BG.test(decls) && LIGHT_TEXT.test(decls) && !/allow:\s*light-on-bright/.test(raw)) {
      add(
        lineOf(stripped, m.index + selector.length),
        'ink-on-bright',
        `Ink text on yellow, pale and green — never white (§0). Selector: ${selector.trim().replace(/\s+/g, ' ')}`,
      );
    }
  }
  return findings;
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (extname(full) === '.css') acc.push(full);
  }
  return acc;
}

export function lintPaths(paths) {
  const files = paths.flatMap((p) => {
    const abs = resolve(root, p);
    return existsSync(abs) && statSync(abs).isFile() ? [abs] : walk(abs);
  });
  const findings = files.flatMap((f) => lintCss(readFileSync(f, 'utf8'), relative(root, f)));
  return { files, findings };
}

function main() {
  const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['src', 'sites'];
  const { files, findings } = lintPaths(paths);
  if (findings.length === 0) {
    console.log(`css lint: ${files.length} file${files.length === 1 ? '' : 's'} checked, no problems.`);
    return 0;
  }
  for (const f of findings) console.error(`${f.file}:${f.line}  ${f.rule}  ${f.message}`);
  console.error(`\ncss lint: ${findings.length} problem${findings.length === 1 ? '' : 's'}. Build stopped.`);
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
