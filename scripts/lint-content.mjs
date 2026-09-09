#!/usr/bin/env node
/**
 * Content lint (CLAUDE.md appendix §10). Runs before every build and fails it on a hit.
 *
 *   no-exclamation        no exclamation marks anywhere in prose
 *   no-all-caps-headings  headings and frontmatter headline fields are sentence case
 *   no-week-phrasing      no "week" / "weeks" — timescales are never promised
 *   banned-phrases        the list and patterns in content.rules.json
 *   conditioned-copy      a site's benefit phrases must sit on a line that also carries a condition
 *
 * A site adds to the rules with sites/<id>/content.rules.json (merged over the
 * shared file for everything under that folder). Copy files (.ts, .tsx, .json)
 * are linted by their string literals and JSX text, line by line.
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

/** The shared rules with a site's own merged over them: lists are added to, everything else is replaced. */
export function mergeRules(base, site) {
  return {
    ...base,
    ...site,
    rules: { ...(base.rules || {}), ...(site.rules || {}) },
    allowedCaps: [...(base.allowedCaps || []), ...(site.allowedCaps || [])],
    bannedPhrases: [...(base.bannedPhrases || []), ...(site.bannedPhrases || [])],
    bannedPatterns: [...(base.bannedPatterns || []), ...(site.bannedPatterns || [])],
  };
}

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json'];

/** The copy in a line of code: its string literals and, in TSX, its JSX text; single words (keys, icon names, paths) are not copy. */
export function codeProse(line, ext) {
  const parts = [];
  const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(line))) parts.push(m[1] ?? m[2] ?? m[3] ?? '');
  if (ext === '.tsx') for (const t of line.matchAll(/>([^<>{}]+)</g)) parts.push(t[1]);
  return parts.map((p) => p.trim()).filter((p) => /\S\s+\S/.test(p));
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
  const conditioned = rules.conditioned
    ? {
        benefits: rules.conditioned.benefits.map((b) => new RegExp(b, 'i')),
        conditions: rules.conditioned.conditions.map((c) => new RegExp(c, 'i')),
        message: rules.conditioned.message || 'A benefit must be conditioned on the same line.',
      }
    : null;
  const ext = extname(file);
  const isCode = CODE_EXTENSIONS.includes(ext);
  const lines = isCode
    ? text.split(/\r?\n/).map((line, i) => ({ n: i + 1, line: codeProse(line, ext).join(' '), kind: 'prose' })).filter((l) => l.line)
    : classify(text);

  for (const { n, line, kind } of lines) {
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

    if (conditioned && on('conditioned-copy')) {
      const benefit = conditioned.benefits.find((re) => re.test(plain));
      if (benefit && !conditioned.conditions.some((re) => re.test(plain))) {
        add(n, 'conditioned-copy', `${conditioned.message} Matched /${benefit.source}/`);
      }
    }

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

/** Files under dir with the rules that apply to each: a folder's own content.rules.json (a site's) is merged over the rules it inherits. */
function walk(dir, rules, acc = []) {
  if (!existsSync(dir)) return acc;
  const own = join(dir, 'content.rules.json');
  if (existsSync(own) && resolve(dir) !== root) rules = mergeRules(rules, JSON.parse(readFileSync(own, 'utf8')));
  const extensions = rules.extensions || ['.mdx', '.md'];
  const ignore = new Set(rules.ignore || []);
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, rules, acc);
    else if (extensions.includes(extname(full)) && !ignore.has(entry)) acc.push({ file: full, rules });
  }
  return acc;
}

/** The rules for one file: the shared rules with every content.rules.json between the root and the file merged in. */
export function rulesFor(file, rules = loadRules()) {
  const parts = relative(root, resolve(root, file)).split(/[\\/]/).slice(0, -1);
  let dir = root;
  for (const part of parts) {
    dir = join(dir, part);
    const own = join(dir, 'content.rules.json');
    if (existsSync(own)) rules = mergeRules(rules, JSON.parse(readFileSync(own, 'utf8')));
  }
  return rules;
}

export function lintPaths(paths, rules = loadRules()) {
  const entries = paths.flatMap((p) => {
    const abs = resolve(root, p);
    if (existsSync(abs) && statSync(abs).isFile()) return [{ file: abs, rules: rulesFor(abs, rules) }];
    return walk(abs, rules);
  });
  const findings = entries.flatMap((e) => lintText(readFileSync(e.file, 'utf8'), relative(root, e.file), e.rules));
  return { files: entries.map((e) => e.file), findings };
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
