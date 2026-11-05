// Builds the planet textures served by the 3D scene, from the Solar System Scope originals
// (https://www.solarsystemscope.com/textures/, CC BY 4.0). Usage:
//   node scripts/build-textures.mjs <folder with the 8k_*.jpg / 2k_*.jpg / *.png downloads>
// Writes public/textures/{hd,sd}/*.webp. "hd" for desktop, "sd" for touch devices and low quality.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/build-textures.mjs <source folder>');

/** name → [source file, hd width, sd width, quality] (equirectangular maps are 2:1). */
const textures = {
  earth: ['8k_earth_daymap.jpg', 8192, 2048, 80],
  earth_night: ['8k_earth_nightmap.jpg', 4096, 1024, 75],
  // Clouds only drive opacity: greyscale, 2k is plenty.
  earth_clouds: ['8k_earth_clouds.jpg', 4096, 1024, 55],
  mars: ['8k_mars.jpg', 4096, 1024, 80],
  jupiter: ['8k_jupiter.jpg', 4096, 1024, 80],
  saturn: ['8k_saturn.jpg', 4096, 1024, 82],
  saturn_ring: ['saturn_ring.png', 2048, 1024, 85],
  milky_way: ['8k_stars_milky_way.jpg', 8192, 2048, 72],
};

// The Sombrero galaxy (ESA/Hubble, CC BY 4.0: NASA/ESA and The Hubble Heritage Team, STScI/AURA):
// cropped around the galaxy, with a radial vignette so the square never shows against space.
async function galaxy(width, quality, out) {
  const source = join(process.argv[2], 'sombrero-large.jpg');
  const meta = await sharp(source).metadata();
  const side = Math.round(meta.height * 1.0);
  const cropped = await sharp(source)
    .extract({
      left: Math.round((meta.width - side * 1.6) / 2),
      top: 0,
      width: Math.round(side * 1.6),
      height: side,
    })
    .resize({ width, height: Math.round(width / 1.6) })
    .toBuffer();
  const h = Math.round(width / 1.6);
  const mask = Buffer.from(
    `<svg width="${width}" height="${h}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%">` +
      `<stop offset="55%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient></defs>` +
      `<rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
  const info = await sharp(cropped)
    .composite([{ input: mask, blend: 'multiply' }])
    .webp({ quality })
    .toFile(out);
  console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

for (const tier of ['hd', 'sd']) mkdirSync(join('public/textures', tier), { recursive: true });

for (const [name, [file, hd, sd, quality]] of Object.entries(textures)) {
  for (const [tier, width] of [
    ['hd', hd],
    ['sd', sd],
  ]) {
    const out = join('public/textures', tier, `${name}.webp`);
    let image = sharp(join(source, file)).resize({ width });
    if (name === 'earth_clouds') image = image.greyscale();
    const info = await image.webp({ quality, alphaQuality: 90, effort: 6 }).toFile(out);
    console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
}

await galaxy(4096, 80, 'public/textures/hd/sombrero.webp');
await galaxy(2048, 78, 'public/textures/sd/sombrero.webp');
