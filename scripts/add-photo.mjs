#!/usr/bin/env node
// Add a photo to one of the "Outside the lab" corners.
//
//   npm run photo -- <corner> <photo> "<title>" ["<alt text>"]
//   npm run photo -- cacti ~/Desktop/IMG_0412.jpg "Golden barrel" "A golden barrel cactus in a clay pot"
//
// What it does:
//   1. auto-rotates the photo, resizes it to at most 1600 px and saves it as WebP
//   2. strips ALL metadata (EXIF, GPS location, camera serial), because the repo is public
//   3. writes src/content/entries/<corner>/<date>-<slug>.md that points to the photo
// Nothing is overwritten: if the target file exists, the script stops.

import { existsSync, mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const [corner, photoArg, title, alt] = process.argv.slice(2);
if (!corner || !photoArg || !title) {
  console.error('Usage: npm run photo -- <corner> <photo> "<title>" ["<alt text>"]');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
if (!existsSync(join(root, 'src/content/corners', `${corner}.md`))) {
  console.error(`Unknown corner "${corner}". Create src/content/corners/${corner}.md first.`);
  process.exit(1);
}

let input = resolve(photoArg.replace(/^~(?=\/)/, process.env.HOME ?? '~'));
if (!existsSync(input)) {
  console.error(`Photo not found: ${input}`);
  process.exit(1);
}

// iPhone HEIC is not supported by sharp's prebuilt libvips; convert with macOS `sips` first.
if (/^\.hei[cf]$/i.test(extname(input))) {
  const tmp = join(mkdtempSync(join(tmpdir(), 'photo-')), 'converted.jpg');
  execFileSync('sips', ['-s', 'format', 'jpeg', input, '--out', tmp], { stdio: 'ignore' });
  input = tmp;
}

const date = new Date().toISOString().slice(0, 10);
const slug =
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'photo';
const name = `${date}-${slug}`;
const dir = join(root, 'src/content/entries', corner);
const imgPath = join(dir, `${name}.webp`);
const mdPath = join(dir, `${name}.md`);
if (existsSync(imgPath) || existsSync(mdPath)) {
  console.error(`Already exists: ${name}. Pick another title.`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

// sharp drops metadata unless .withMetadata() is called, so the output carries no EXIF/GPS.
await sharp(input)
  .rotate()
  .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(imgPath);

const meta = await sharp(imgPath).metadata();
if (meta.exif || meta.xmp || meta.iptc) {
  console.error('Metadata survived the conversion; refusing to continue.');
  process.exit(1);
}

const yaml = (s) => JSON.stringify(s); // JSON strings are valid YAML scalars
writeFileSync(
  mdPath,
  `---
title: ${yaml(title)}
date: ${date}
image: ./${name}.webp
imageAlt: ${yaml(alt ?? title)}
tags: []
---

<!-- Write a few lines about this photo here (optional). -->
`
);

console.log(`Added ${corner}/${name}: ${meta.width}×${meta.height} WebP, metadata stripped.`);
console.log(`Edit ${mdPath.replace(root + '/', '')} to add text, then commit and push.`);
