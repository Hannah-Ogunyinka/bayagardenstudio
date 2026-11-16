#!/usr/bin/env node
/**
 * Uploads the client gallery photos and zip downloads to the private R2 bucket,
 * as <slug>/<file name>, the keys the gallery pages read.
 *
 *   node scripts/upload-galleries.mjs <path to WordPress uploads folder>
 *
 * Needs `npx wrangler login` first. Add --local to fill the local dev bucket instead.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BUCKET = 'baya-client-galleries';
const [uploads, flag] = process.argv.slice(2);
if (!uploads || !existsSync(uploads)) {
  console.error('Usage: node scripts/upload-galleries.mjs <wp-content/uploads folder> [--local]');
  process.exit(1);
}
const target = flag === '--local' ? '--local' : '--remote';
const galleries = JSON.parse(readFileSync(new URL('../src/data/galleries.json', import.meta.url), 'utf8'));

const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', zip: 'application/zip' };

for (const gallery of galleries) {
  const files = [...gallery.photos.map((p) => p.file), ...(gallery.download ? [gallery.download.file] : [])];
  for (const file of files) {
    const [path] = globSync(`*/*/${file}`, { cwd: uploads });
    if (!path) {
      console.error(`Missing: ${gallery.slug}/${file}`);
      continue;
    }
    const type = types[file.split('.').pop().toLowerCase()] ?? 'application/octet-stream';
    execFileSync(
      'npx',
      ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${gallery.slug}/${file}`, '--file', join(uploads, path), '--content-type', type, target],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    console.log(`Uploaded ${gallery.slug}/${file}`);
  }
}
