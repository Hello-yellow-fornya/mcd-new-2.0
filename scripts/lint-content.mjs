#!/usr/bin/env node
/**
 * Content lint (CLAUDE.md appendix §10). Runs before every build and fails it on a hit.
 *
 *   no-exclamation        no exclamation marks anywhere in prose
 *   no-all-caps-headings  headings and frontmatter headline fields are sentence case
 *   no-week-phrasing      no "week" / "weeks" — timescales are never promised
 *   banned-phrases        the list and patterns in content.rules.json
 *
 * Usage: node scripts/lint-content.mjs [paths...]
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function loadRules(file = join(root, 'content.rules.json')) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

const FRONTMATTER_HEADING_KEYS = ['title', 'h1', 'kicker', 'description'];

function straightQuotes(s) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

/** Splits a document into lines tagged with whether they are prose. */
function classify(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let inFence = false;
  let inFrontmatter = false;
  let frontmatterDone = false;
  lines.forEach((line, i) => {
    const n = i + 1;
    if (i === 0 && line.trim() === '---') {
      inFrontmatter = true;
      out.push({ n, line, kind: 'fm-delim' });
      return;
    }
    if (inFrontmatter) {
      if (line.trim() === '---') {
        inFrontmatter = false;
        frontmatterDone = true;
        out.push({ n, line, kind: 'fm-delim' });
      } else {
        out.push({ n, line, kind: 'frontmatter' });
      }
      return;
    }
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push({ n, line, kind: 'code' });
      return;
    }
    if (inFence) {
      out.push({ n, line, kind: 'code' });
      return;
    }
    if (/^\s*(import|export)\s/.test(line)) {
      out.push({ n, line, kind: 'esm' });
      return;
    }
    void frontmatterDone;
    out.push({ n, line, kind: /^\s*#{1,6}\s/.test(line) ? 'heading' : 'prose' });
  });
  return out;
}

function frontmatterHeadingText(line) {
  const m = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
  if (!m) return null;
  if (!FRONTMATTER_HEADING_KEYS.includes(m[1])) return null;
  return m[2].replace(/^["']|["']$/g, '');
}

/** The copy part of a frontmatter line: after "key:" or a "- " list marker, quotes stripped; slugs and dates are not copy. */
function frontmatterValue(line) {
  const kv = line.match(/^\s*(?:-\s+)?([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
  let v = kv ? kv[2] : line.replace(/^\s*-\s+/, '');
  if (kv && ['slug', 'lastReviewed', 'template', 'phase', 'draft', 'href', 'id', 'related', 'schemaType'].includes(kv[1])) return '';
  v = v.trim().replace(/^["']|["']$/g, '');
  if (v.startsWith('/')) return '';
  return v;
}

function capsWords(text, allowed) {
  const allow = new Set(allowed.map((w) => w.toUpperCase()));
  const hits = [];
  for (const word of text.split(/[^A-Za-z0-9'’-]+/)) {
    const letters = word.replace(/[^A-Za-z]/g, '');
    if (letters.length < 2) continue;
    if (word !== word.toUpperCase()) continue;
    if (allow.has(word.toUpperCase())) continue;
    if (/^[A-Z]{2}\d/.test(word) || /^\d/.test(word)) continue; // reg-style tokens like AB12
    hits.push(word);
  }
  return hits;
}

/**
 * Lints one document. Returns an array of { file, line, rule, message }.
 */
export function lintText(text, file, rules = loadRules()) {
  const findings = [];
  const on = (rule) => rules.rules?.[rule] !== false;
  const add = (line, rule, message) => findings.push({ file, line, rule, message });
  const banned = (rules.bannedPhrases || []).map((p) => straightQuotes(p).toLowerCase());
  const patterns = (rules.bannedPatterns || []).map((p) => ({
    re: new RegExp(p.pattern, p.flags || ''),
    message: p.message || `Matches banned pattern /${p.pattern}/`,
  }));

  for (const { n, line, kind } of classify(text)) {
    if (kind === 'code' || kind === 'esm' || kind === 'fm-delim') continue;
    const isFrontmatter = kind === 'frontmatter';
    const headingText = kind === 'heading'
      ? line.replace(/^\s*#{1,6}\s+/, '')
      : isFrontmatter
        ? frontmatterHeadingText(line)
        : null;
    // Frontmatter: every string value is copy (title, lead, FAQ answers…), so lint the value part.
    const prose = isFrontmatter ? frontmatterValue(line) : line;
    if (!prose) continue;
    const plain = straightQuotes(prose);

    if (on('no-exclamation')) {
      // Allow markdown images "![alt](src)" and JSX "!=" / "!==".
      if (/!(?![\[=])/.test(plain)) add(n, 'no-exclamation', 'No exclamation marks (guidelines §2).');
    }

    if (on('no-all-caps-headings') && headingText) {
      const caps = capsWords(straightQuotes(headingText), rules.allowedCaps || []);
      if (caps.length) add(n, 'no-all-caps-headings', `Sentence case only. All-caps: ${caps.join(', ')}`);
    }

    if (on('no-week-phrasing') && /\bweeks?\b/i.test(plain)) {
      add(n, 'no-week-phrasing', 'No "week(s)" phrasing. Timescales are never promised (guidelines §2).');
    }

    if (on('banned-phrases')) {
      const lower = plain.toLowerCase();
      for (const phrase of banned) {
        if (lower.includes(phrase)) add(n, 'banned-phrases', `Banned phrase: "${phrase}"`);
      }
      for (const { re, message } of patterns) {
        if (re.test(plain)) add(n, 'banned-phrases', message);
      }
    }
  }
  return findings;
}

function walk(dir, extensions, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, extensions, acc);
    else if (extensions.includes(extname(full))) acc.push(full);
  }
  return acc;
}

export function lintPaths(paths, rules = loadRules()) {
  const files = paths.flatMap((p) => {
    const abs = resolve(root, p);
    if (existsSync(abs) && statSync(abs).isFile()) return [abs];
    return walk(abs, rules.extensions || ['.mdx', '.md']);
  });
  const findings = files.flatMap((f) => lintText(readFileSync(f, 'utf8'), relative(root, f), rules));
  return { files, findings };
}

function main() {
  const rules = loadRules();
  const paths = process.argv.slice(2).length ? process.argv.slice(2) : rules.paths || ['content'];
  const { files, findings } = lintPaths(paths, rules);
  if (findings.length === 0) {
    console.log(`content lint: ${files.length} file${files.length === 1 ? '' : 's'} checked, no problems.`);
    return 0;
  }
  for (const f of findings) console.error(`${f.file}:${f.line}  ${f.rule}  ${f.message}`);
  console.error(`\ncontent lint: ${findings.length} problem${findings.length === 1 ? '' : 's'} in ${files.length} file${files.length === 1 ? '' : 's'}. Build stopped.`);
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
