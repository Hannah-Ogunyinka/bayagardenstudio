#!/usr/bin/env node
/**
 * Design-system guard. Fails if a component or page stylesheet sets its own
 * raw colour, px or rem length, or screen width, instead of using a token.
 *
 * Checked: <style> blocks in src/**\/*.astro, and src/styles/*.css except
 * tokens.css (generated) and media.css (breakpoint definitions).
 *
 * Allowed: tokens (var(--…)), em, ch, %, fr, vw/vh/dvh, deg, ms/s, unitless
 * numbers, 0, and 1px or 2px inside a token-free border shorthand is NOT
 * allowed either: use --border-hairline / --border-thin.
 *
 * A deliberate exception: end the line with  /* token-exempt: reason *\/
 * (for example a position copied from the live theme's artwork).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP = new Set(['src/styles/tokens.css', 'src/styles/media.css']);

const RULES = [
  { name: 'hex colour', re: /#[0-9a-f]{3,8}\b/i },
  { name: 'rgb/hsl colour', re: /\b(?:rgba?|hsla?)\(/i },
  { name: 'px length', re: /(?<![\w.-])\d*\.?\d+px\b/ },
  { name: 'rem length', re: /(?<![\w.-])\d*\.?\d+rem\b/ },
  { name: 'raw media width', re: /@media[^{]*\b\d+(?:\.\d+)?(?:px|em|rem)\b/ },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(astro|css)$/.test(name)) out.push(path);
  }
  return out;
}

/** Returns [lineNumber, text] for each CSS line in the file. */
function cssLines(file, source) {
  const lines = source.split('\n');
  if (file.endsWith('.css')) return lines.map((text, i) => [i + 1, text]);
  const out = [];
  let inStyle = false;
  lines.forEach((text, i) => {
    if (/<style\b/.test(text)) inStyle = true;
    if (inStyle) out.push([i + 1, text]);
    if (/<\/style>/.test(text)) inStyle = false;
  });
  return out;
}

const problems = [];
for (const file of walk(join(ROOT, 'src'))) {
  const rel = relative(ROOT, file);
  if (SKIP.has(rel)) continue;
  let inComment = false;
  for (const [line, raw] of cssLines(file, readFileSync(file, 'utf8'))) {
    if (raw.includes('token-exempt:')) continue;
    // Drop comments (including multi-line ones) before checking.
    let text = raw;
    if (inComment) {
      const end = text.indexOf('*/');
      if (end === -1) continue;
      text = text.slice(end + 2);
      inComment = false;
    }
    text = text.replace(/\/\*.*?\*\//g, '');
    const start = text.indexOf('/*');
    if (start !== -1) {
      inComment = true;
      text = text.slice(0, start);
    }
    // Custom property definitions inside a component are allowed to hold values
    // only when they reference tokens; a raw value there is still flagged.
    for (const rule of RULES) {
      if (rule.re.test(text)) problems.push(`${rel}:${line}  ${rule.name}: ${raw.trim()}`);
    }
  }
}

if (problems.length) {
  console.error(`Design tokens: ${problems.length} raw value(s). Use a token from src/styles/tokens.css,\nor add /* token-exempt: reason */ for a deliberate exception.\n`);
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Design tokens: every component uses tokens.');
