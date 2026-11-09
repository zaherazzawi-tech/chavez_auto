#!/usr/bin/env node
/*
  Optimize site photos.

  Reads original photos from ../photo-originals (a folder NEXT TO the repo, not inside it)
  and writes web-ready copies into the repo:

    images/story/story-1.webp ...         Our Story frames (max 1600px long edge)
    images/gallery/work-01.webp ...       Our Work full-size (max 1600px long edge)
    images/gallery/thumbs/work-01.webp    Our Work grid thumbnails (600x600 square crop)

  Sorting (by file name, or by sub-folder name):
    - names containing "story"   -> story photos. A name containing "main" comes first,
                                    then by the number in the name. The first 3 fill the
                                    Our Story frames; any extras are added to the gallery.
    - names containing "gallery" or "work" -> gallery photos, in number order.

  Every output is auto-rotated from its EXIF orientation and has ALL metadata removed
  (camera info, GPS location, etc.). Images are never enlarged.

  Usage (from the repo root):
    cd scripts && npm install        # first time only, installs sharp
    node optimize-images.js          # or: npm run optimize-images
    node optimize-images.js --src "D:/some/other/folder"
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const REPO = path.resolve(__dirname, '..');
const argSrc = process.argv.indexOf('--src');
const SRC = argSrc > -1 ? path.resolve(process.argv[argSrc + 1]) : path.resolve(REPO, '..', 'photo-originals');
const OUT_STORY = path.join(REPO, 'images', 'story');
const OUT_GALLERY = path.join(REPO, 'images', 'gallery');
const OUT_THUMBS = path.join(OUT_GALLERY, 'thumbs');
const STORY_FRAMES = 3, MAX_EDGE = 1600, THUMB_W = 600, QUALITY = 80;
const IMG = /\.(jpe?g|png|webp|heic|heif|tiff?|avif)$/i;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : IMG.test(d.name) ? [p] : [];
  });
}
const num = f => { const m = path.basename(f).match(/(\d+)(?!.*\d)/); return m ? +m[1] : 0; };
const rel = f => path.relative(SRC, f).replace(/\\/g, '/');

async function save(input, file, opts) {
  // .rotate() with no angle = apply EXIF orientation. sharp drops all metadata unless asked to keep it.
  const info = await sharp(input).rotate().resize(opts).webp({ quality: QUALITY }).toFile(file);
  return info.width + 'x' + info.height;
}

(async () => {
  if (!fs.existsSync(SRC)) { console.error('Originals folder not found: ' + SRC); process.exit(1); }
  const all = walk(SRC);
  const story = all.filter(f => /story/i.test(rel(f)))
    .sort((a, b) => (/main/i.test(b) - /main/i.test(a)) || num(a) - num(b) || a.localeCompare(b));
  const gallery = all.filter(f => !/story/i.test(rel(f)) && /gallery|work/i.test(rel(f)))
    .sort((a, b) => num(a) - num(b) || a.localeCompare(b));
  const skipped = all.filter(f => !story.includes(f) && !gallery.includes(f));

  const frames = story.slice(0, STORY_FRAMES);
  const work = gallery.concat(story.slice(STORY_FRAMES));

  // start clean so removed originals don't leave stale outputs behind
  for (const d of [OUT_STORY, OUT_THUMBS, OUT_GALLERY]) {
    fs.mkdirSync(d, { recursive: true });
    fs.readdirSync(d).filter(f => f.endsWith('.webp')).forEach(f => fs.unlinkSync(path.join(d, f)));
  }

  const fit = { width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true };
  console.log('Story frames:');
  for (const [i, f] of frames.entries()) {
    const out = 'story-' + (i + 1) + '.webp';
    console.log('  ' + rel(f).padEnd(28) + ' -> images/story/' + out + '  ' + await save(f, path.join(OUT_STORY, out), fit));
  }
  console.log('Gallery:');
  for (const [i, f] of work.entries()) {
    const out = 'work-' + String(i + 1).padStart(2, '0') + '.webp';
    const full = await save(f, path.join(OUT_GALLERY, out), fit);
    // square center crop: the grid tiles are square
    const thumb = await save(f, path.join(OUT_THUMBS, out), { width: THUMB_W, height: THUMB_W, fit: 'cover', withoutEnlargement: true });
    console.log('  ' + rel(f).padEnd(28) + ' -> images/gallery/' + out + '  ' + full + '   thumb ' + thumb);
  }
  if (skipped.length) console.log('Skipped (name has no "story", "gallery" or "work"):\n  ' + skipped.map(rel).join('\n  '));
  console.log('\nGallery tiles in index.html need width/height = the "thumb" size above.');
})().catch(e => { console.error(e); process.exit(1); });
