import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = "images";
const OUT = "public/frames";
const QUALITY = Number(process.env.Q ?? 72);
const WIDTH = Number(process.env.W ?? 1920);
const POOL = 8;

await mkdir(OUT, { recursive: true });

const frames = (await readdir(SRC))
  .filter((f) => /^male\d{4}\.png$/.test(f))
  .sort();

if (frames.length === 0) throw new Error(`No male####.png frames found in ${SRC}/`);

let done = 0;
let srcBytes = 0;
let outBytes = 0;
let cursor = 0;

async function worker() {
  while (cursor < frames.length) {
    const file = frames[cursor++];
    const inPath = path.join(SRC, file);
    const outPath = path.join(OUT, file.replace(/\.png$/, ".webp"));

    const { size: inSize } = await stat(inPath);
    const info = await sharp(inPath)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, alphaQuality: 90, effort: 5 })
      .toFile(outPath);

    srcBytes += inSize;
    outBytes += info.size;
    if (++done % 50 === 0) console.log(`  ${done}/${frames.length}`);
  }
}

console.log(`Converting ${frames.length} frames -> WebP q${QUALITY} @${WIDTH}px`);
await Promise.all(Array.from({ length: POOL }, worker));

const mb = (b) => (b / 1024 / 1024).toFixed(1);
console.log(`\nDone: ${done} frames`);
console.log(`PNG:  ${mb(srcBytes)} MB  ->  WebP: ${mb(outBytes)} MB`);
console.log(`Saved ${(100 - (outBytes / srcBytes) * 100).toFixed(1)}%`);
