#!/usr/bin/env node
/**
 * Builds the GALLERY_PASSWORDS secret: a JSON map of gallery slug → SHA-256("slug:password").
 *
 *   node scripts/gallery-passwords.mjs passwords.csv     # slug,password (or a header row with "gallery"/"slug" and "password" columns)
 *   node scripts/gallery-passwords.mjs local.sql         # WordPress dump: reads each gallery's post password
 *
 * Then store it (the plain passwords never leave your computer):
 *   node scripts/gallery-passwords.mjs local.sql | npx wrangler secret put GALLERY_PASSWORDS
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const galleries = JSON.parse(readFileSync(new URL('../src/data/galleries.json', import.meta.url), 'utf8'));
const slugs = new Set(galleries.map((g) => g.slug));
const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/gallery-passwords.mjs <passwords.csv | wordpress.sql>');
  process.exit(1);
}
const source = readFileSync(file, 'utf8');

/** Reads every row of `INSERT INTO wp_posts ... VALUES (...),(...);` as arrays of strings. */
function* wpPostRows(sql) {
  const insert = /INSERT INTO `?\w*posts`?\s*(?:\([^)]*\)\s*)?VALUES\s*/gi;
  let match;
  while ((match = insert.exec(sql))) {
    let i = insert.lastIndex;
    while (sql[i] === '(') {
      const row = [];
      let value = '';
      let quoted = false;
      i++;
      for (; i < sql.length; i++) {
        const c = sql[i];
        if (quoted) {
          if (c === '\\') value += sql[++i];
          else if (c === "'" && sql[i + 1] === "'") value += sql[++i];
          else if (c === "'") quoted = false;
          else value += c;
        } else if (c === "'") quoted = true;
        else if (c === ',') (row.push(value), (value = ''));
        else if (c === ')') break;
        else if (!/\s/.test(c)) value += c;
      }
      row.push(value);
      yield row;
      i++;
      while (sql[i] === ',' || /\s/.test(sql[i] ?? '')) i++;
    }
  }
}

const passwords = new Map();
if (/\.sql$/i.test(file)) {
  // Columns: ID, author, date, date_gmt, content, title, excerpt, status, comment_status, ping_status, password, name, ...
  for (const row of wpPostRows(source)) {
    const [password, name, status] = [row[10], row[11], row[7]];
    if (slugs.has(name) && password && status !== 'inherit') passwords.set(name, password);
  }
} else {
  const lines = source.split(/\r?\n/).filter(Boolean);
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const hasHeader = header.includes('password');
  const slugCol = hasHeader ? Math.max(header.indexOf('gallery'), header.indexOf('slug')) : 0;
  const pwCol = hasHeader ? header.indexOf('password') : 1;
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = line.split(',').map((c) => c.trim());
    if (slugs.has(cells[slugCol]) && cells[pwCol]) passwords.set(cells[slugCol], cells[pwCol]);
  }
}

const missing = [...slugs].filter((slug) => !passwords.get(slug));
if (missing.length) console.error(`No password found for: ${missing.join(', ')}`);
console.error(`Hashed ${passwords.size} of ${slugs.size} gallery passwords.`);

const hashes = Object.fromEntries(
  [...passwords].map(([slug, pw]) => [slug, createHash('sha256').update(`${slug}:${pw}`).digest('hex')]),
);
process.stdout.write(JSON.stringify(hashes));
