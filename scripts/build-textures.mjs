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
  earth: ['8k_earth_daymap.jpg', 4096, 2048, 82],
  earth_night: ['8k_earth_nightmap.jpg', 2048, 1024, 75],
  // Clouds only drive opacity: greyscale, 2k is plenty.
  earth_clouds: ['8k_earth_clouds.jpg', 2048, 1024, 70],
  mars: ['8k_mars.jpg', 2048, 1024, 80],
  jupiter: ['8k_jupiter.jpg', 2048, 1024, 80],
  saturn: ['8k_saturn.jpg', 2048, 1024, 80],
  saturn_ring: ['saturn_ring.png', 2048, 1024, 85],
  milky_way: ['8k_stars_milky_way.jpg', 4096, 2048, 72],
};

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
