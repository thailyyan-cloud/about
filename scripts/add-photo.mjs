#!/usr/bin/env node
// Add a photo to one of the "Outside the lab" corners.
//
//   npm run photo -- <corner> <photo> "<title>" ["<alt text>"] [--crop=L,T,W,H] [--aspect=4:3]
//   npm run photo -- cacti ~/Desktop/IMG_0412.jpg "Golden barrel" "A golden barrel cactus in a clay pot"
//
// Options:
//   --crop=L,T,W,H  cut out a box first (pixels, measured on the upright photo), e.g. to remove a stranger
//   --aspect=4:3    then crop to this ratio, keeping the most salient region (sharp "attention" strategy)
//   --date=YYYY-MM-DD | --date=none   date shown on the card (default: today; "none" hides it)
//   --order=N       manual position on the page (lower first)
//   --tags=a,b      tags shown under the text
//
// What it does:
//   1. auto-rotates the photo, applies the optional crops, resizes to at most 1600 px and saves it as WebP
//   2. strips ALL metadata (EXIF, GPS location, camera serial), because the repo is public
//   3. writes src/content/entries/<corner>/<date>-<slug>.md that points to the photo
// Nothing is overwritten: if the target file exists, the script stops.

import { existsSync, mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith('--')).map((a) => [a.slice(2).split('=')[0], a.split('=').slice(1).join('=')])
);
const [corner, photoArg, title, alt] = argv.filter((a) => !a.startsWith('--'));
if (!corner || !photoArg || !title) {
  console.error('Usage: npm run photo -- <corner> <photo> "<title>" ["<alt text>"] [--crop=L,T,W,H] [--aspect=4:3]');
  process.exit(1);
}
const crop = flags.crop ? flags.crop.split(',').map(Number) : null;
if (crop && (crop.length !== 4 || crop.some((n) => !Number.isInteger(n) || n < 0) || crop[2] === 0 || crop[3] === 0)) {
  console.error('--crop needs four non-negative integers: left,top,width,height');
  process.exit(1);
}
const aspect = flags.aspect ? flags.aspect.split(':').map(Number) : null;
if (aspect && (aspect.length !== 2 || aspect.some((n) => !(n > 0)))) {
  console.error('--aspect needs a ratio such as 4:3');
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

const date =
  flags.date === undefined ? new Date().toISOString().slice(0, 10) : flags.date === 'none' ? null : flags.date;
if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('--date must be YYYY-MM-DD or "none"');
  process.exit(1);
}
const order = flags.order !== undefined ? Number(flags.order) : null;
if (order !== null && !Number.isFinite(order)) {
  console.error('--order must be a number');
  process.exit(1);
}
const tags = flags.tags ? flags.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
const slug =
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'photo';
const name = date ? `${date}-${slug}` : slug;
const dir = join(root, 'src/content/entries', corner);
const imgPath = join(dir, `${name}.webp`);
const mdPath = join(dir, `${name}.md`);
if (existsSync(imgPath) || existsSync(mdPath)) {
  console.error(`Already exists: ${name}. Pick another title.`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

// Work on an upright, lossless intermediate so crop coordinates match what you see.
let buf = await sharp(input).rotate().png({ compressionLevel: 0 }).toBuffer();
if (crop) {
  const { width, height } = await sharp(buf).metadata();
  const [left, top, w, h] = crop;
  if (left + w > width || top + h > height) {
    console.error(`--crop box ${crop.join(',')} falls outside the ${width}×${height} photo`);
    process.exit(1);
  }
  buf = await sharp(buf).extract({ left, top, width: w, height: h }).png({ compressionLevel: 0 }).toBuffer();
}
if (aspect) {
  const { width, height } = await sharp(buf).metadata();
  let w = width;
  let h = Math.round((width * aspect[1]) / aspect[0]);
  if (h > height) {
    h = height;
    w = Math.round((height * aspect[0]) / aspect[1]);
  }
  buf = await sharp(buf)
    .resize({ width: w, height: h, fit: 'cover', position: sharp.strategy.attention })
    .png({ compressionLevel: 0 })
    .toBuffer();
}

// sharp drops metadata unless .withMetadata() is called, so the output carries no EXIF/GPS.
await sharp(buf)
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
${date ? `date: ${date}\n` : ''}${order !== null ? `order: ${order}\n` : ''}image: ./${name}.webp
imageAlt: ${yaml(alt ?? title)}
tags: ${JSON.stringify(tags)}
---

<!-- Write a few lines about this photo here (optional). -->
`
);

console.log(`Added ${corner}/${name}: ${meta.width}×${meta.height} WebP, metadata stripped.`);
console.log(`Edit ${mdPath.replace(root + '/', '')} to add text, then commit and push.`);
